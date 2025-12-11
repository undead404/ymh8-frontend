import SQL from "@nearform/sql";
import { database } from "./database";

import { fullTagSchema, type FullTag } from "../../schemata";

export default async function getTags(): Promise<FullTag[]> {
  console.log("getTags");
  const tags = await database.queryMany(
    fullTagSchema,
    SQL`
        SELECT
            "albumsScrapedAt",
            "description",
            -- "Tag"."name" AS "id",
            "listUpdatedAt",
            "Tag"."name" AS "name",
            SUM("Album"."playcount"::FLOAT / 1000 * "Album"."listeners" / 100 * "AlbumTag"."count") AS "weight"
        FROM "Tag"
        INNER JOIN "AlbumTag"
        ON "Tag"."name" = "AlbumTag"."tagName"
        INNER JOIN "Album"
        ON "AlbumTag"."albumArtist" = "Album"."artist"
        AND "AlbumTag"."albumName" = "Album"."name"
        WHERE "listUpdatedAt" IS NOT NULL
        GROUP BY "Tag"."name"
        ORDER BY "weight" DESC
    `
  );
  return tags;
}
