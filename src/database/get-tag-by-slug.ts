import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";

import db from ".";

export default function getTagBySlug(tagSlug: string) {
  return (
    db
      // 1. Pre-calculate global stats
      .with("GlobalStats", (qb) =>
        qb
          .selectFrom("Album")
          .where("numberOfTracks", "is not", null)
          .select(sql<number>`AVG("numberOfTracks")`.as("avgTracks"))
      )
      // 2. Fetch the specific Tag
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
          // TRANSLATE function filter
          .where(sql`TRANSLATE("Tag"."name", ' ', '-')`, "=", tagSlug)
          .groupBy([
            "Tag.name",
            "Tag.albumsScrapedAt",
            "Tag.description",
            "Tag.listUpdatedAt",
          ])
          .select([
            "Tag.name",
            "Tag.albumsScrapedAt",
            "Tag.description",
            "Tag.listUpdatedAt",
            sql<number>`SUM("Album"."playcount"::FLOAT / 1000 * "Album"."listeners" / 100 * "AlbumTag"."count")`.as(
              "tag_weight"
            ),
          ])
          .limit(1)
      )
      // 3. Main Select
      .selectFrom("TagData as t")
      // Emulate CROSS JOIN "GlobalStats" gs so 'gs' is available in the subquery
      .innerJoin("GlobalStats as gs", (join) => join.on(sql`true`))
      .selectAll("t")
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("Album")
            .innerJoin("TagListItem", (join) =>
              join
                .onRef("Album.artist", "=", "TagListItem.albumArtist")
                .onRef("Album.name", "=", "TagListItem.albumName")
            )
            .innerJoin("AlbumTag", (join) =>
              join
                .onRef("Album.artist", "=", "AlbumTag.albumArtist")
                .onRef("Album.name", "=", "AlbumTag.albumName")
                // Link TagListItem and AlbumTag
                .onRef("TagListItem.tagName", "=", "AlbumTag.tagName")
            )
            .where("hidden", "is not", true)
            // Link subquery to the outer TagData row
            .whereRef("TagListItem.tagName", "=", "t.name")
            .select([
              "Album.artist",
              "Album.cover",
              "Album.date",
              "Album.name",
              "TagListItem.place",
              "Album.statsUpdatedAt",
              "Album.thumbnail",
              // Weight calculation referencing 'gs.avgTracks'
              sql<number>`(
              COALESCE("playcount", 0)::FLOAT / 1000 
              * COALESCE("listeners", 0) 
              / COALESCE(
                  CASE WHEN "Album"."numberOfTracks" = 0 THEN 1 ELSE "Album"."numberOfTracks" END,
                  "gs"."avgTracks"
              ) 
              / 100 
              * "AlbumTag"."count"
            )`.as("weight"),
            ])
            .orderBy(sql`weight`, "desc")
            .limit(100)
        ).as("list"),
      ])
      .orderBy("t.tag_weight", "desc")
      .executeTakeFirst()
  );
}
