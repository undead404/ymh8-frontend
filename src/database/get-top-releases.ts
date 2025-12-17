import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import db from ".";

export default function getTopAlbumsWithStats() {
  return (
    db
      // 1. CTE: GlobalStats
      .with("GlobalStats", (qb) =>
        qb
          .selectFrom("Album")
          .where("numberOfTracks", "is not", null)
          .select(sql<number>`AVG("numberOfTracks")`.as("avgTracks"))
      )
      // 2. CTE: TopAlbums
      .with("TopAlbums", (qb) =>
        qb
          .selectFrom("Album")
          .where("hidden", "is not", true)
          .select([
            "artist",
            "cover",
            "date",
            "name",
            "statsUpdatedAt",
            "thumbnail",
            // The Weight Calculation
            sql<number>`(
          COALESCE("playcount", 0)::FLOAT / 1000 
          * COALESCE("listeners", 0) 
          / COALESCE(
              CASE WHEN "numberOfTracks" = 0 THEN 1 ELSE "numberOfTracks" END,
              (SELECT "avgTracks" FROM "GlobalStats")
          )
        )`.as("weight"),
          ])
          // Order by the alias 'weight'
          .orderBy(sql`weight`, "desc")
          .limit(100)
      )
      // 3. Main Select
      .selectFrom("TopAlbums as ta")
      .selectAll("ta")
      .select((eb) => [
        // Window function for "place"
        sql<number>`ROW_NUMBER() OVER (ORDER BY "ta"."weight" DESC)`.as(
          "place"
        ),

        // Lateral Join replacement: Places
        jsonArrayFrom(
          eb
            .selectFrom("TagListItem")
            .whereRef("TagListItem.albumArtist", "=", "ta.artist")
            .whereRef("TagListItem.albumName", "=", "ta.name")
            .orderBy("place", "asc")
            .select(["place", "tagName"])
        ).as("places"),

        // Lateral Join replacement: Tags
        jsonArrayFrom(
          eb
            .selectFrom("AlbumTag")
            .innerJoin("Tag", "AlbumTag.tagName", "Tag.name")
            .whereRef("AlbumTag.albumArtist", "=", "ta.artist")
            .whereRef("AlbumTag.albumName", "=", "ta.name")
            .where("Tag.listUpdatedAt", "is not", null)
            .orderBy("count", "desc")
            .select(["count", "tagName"])
        ).as("tags"),
      ])
      .orderBy("ta.weight", "desc")
      .execute()
  );
}
