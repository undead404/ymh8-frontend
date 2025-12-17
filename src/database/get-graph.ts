import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";

import db from ".";

// Assumes you have a DB interface defined
export default function getComplexTagData() {
  return db
    .with("TagData", (qb) =>
      qb
        .selectFrom("Tag")
        .innerJoin("AlbumTag", "Tag.name", "AlbumTag.tagName")
        .innerJoin("Album", (join) =>
          join
            .onRef("AlbumTag.albumArtist", "=", "Album.artist")
            .onRef("AlbumTag.albumName", "=", "Album.name")
        )
        .where("listUpdatedAt", "is not", null)
        .groupBy([
          "Tag.name",
          "Tag.description",
          "Tag.albumsScrapedAt",
          "Tag.listUpdatedAt",
        ])
        .select([
          "Tag.name",
          "Tag.description",
          "Tag.albumsScrapedAt",
          "Tag.listUpdatedAt",
          // Complex math must remain raw SQL
          sql<number>`SUM("Album"."playcount"::FLOAT / 1000 * "Album"."listeners" / 100 * "AlbumTag"."count")`.as(
            "weight"
          ),
        ])
    )
    .selectFrom("TagData as t")
    .selectAll("t")
    .select((eb) => [
      // Replaces LEFT JOIN LATERAL ... json_agg
      jsonArrayFrom(
        eb
          .selectFrom("Album")
          .innerJoin("AlbumTag as first_tag", (join) =>
            join
              .onRef("Album.artist", "=", "first_tag.albumArtist")
              .onRef("Album.name", "=", "first_tag.albumName")
          )
          .innerJoin("AlbumTag as second_tag", (join) =>
            join
              .onRef("second_tag.albumArtist", "=", "Album.artist")
              .onRef("second_tag.albumName", "=", "Album.name")
          )
          .innerJoin(
            "Tag as second_tag_tag",
            "second_tag_tag.name",
            "second_tag.tagName"
          )
          // The Correlation
          .whereRef("first_tag.tagName", "=", "t.name")
          .where("second_tag_tag.listUpdatedAt", "is not", null)
          .whereRef("second_tag_tag.name", "<>", "t.name")
          .groupBy("second_tag.tagName")
          .orderBy(sql`weight`, "desc")
          .limit(10)
          .select([
            "second_tag.tagName as name",
            sql<number>`SUM(LEAST("first_tag"."count", "second_tag"."count")::FLOAT * COALESCE("Album"."listeners", 0))`.as(
              "weight"
            ),
          ])
      ).as("related"),
    ])
    .orderBy("t.weight", "desc")
    .execute();
}
