import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";

import db from ".";

export default function getTagsWithAlbums() {
  return (
    db
      // 1. Pre-calculate global stats
      .with("GlobalStats", (qb) =>
        qb
          .selectFrom("Album")
          .where("numberOfTracks", "is not", null)
          .select(sql<number>`AVG("numberOfTracks")`.as("avgTracks"))
      )
      // 2. Fetch the Tags (TagData CTE)
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
      )
      // 3. The Main Select
      .selectFrom("TagData as t")
      // Emulate CROSS JOIN "GlobalStats" gs
      .innerJoin("GlobalStats as gs", (join) => join.on(sql`true`))
      .select((eb) => [
        // Select all columns from 't'
        "t.name",
        "t.albumsScrapedAt",
        "t.description",
        "t.listUpdatedAt",
        "t.tag_weight",

        // 4. The Magic: jsonArrayFrom replaces LEFT JOIN LATERAL ... json_agg
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
                .onRef("TagListItem.tagName", "=", "AlbumTag.tagName")
            )
            .where("hidden", "is not", true)
            // THE MAGIC LINK: Connects subquery to the outer row (t.name)
            .whereRef("TagListItem.tagName", "=", "t.name")
            .select([
              "Album.artist",
              "Album.cover",
              "Album.date",
              "Album.name",
              "Album.statsUpdatedAt",
              "Album.thumbnail",
              // The Weight Calculation using 'gs.avgTracks' from the outer join
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
            // We order by the calculated alias 'weight'
            .orderBy(sql`weight`, "desc")
            .limit(100)
        ).as("list"),
      ])
      .orderBy("t.tag_weight", "desc")
      .execute()
  );
}
