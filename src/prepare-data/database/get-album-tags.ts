import SQL from "@nearform/sql";
import { database } from "./database";
import { albumTagSchema, type AlbumTag, type BareAlbum } from "../../schemata";

const CACHE = new Map<string, AlbumTag[]>();

export default async function getAlbumTags(
  album: BareAlbum
): Promise<AlbumTag[]> {
  const cacheKey = `${album.artist} - ${album.name}`;
  const cacheValue = CACHE.get(cacheKey);
  if (cacheValue) {
    return cacheValue;
  }
  console.log("getAlbumTags", { artist: album.artist, name: album.name });
  const albumTags = await database.queryMany(
    albumTagSchema,
    SQL`
        SELECT
            "count",
            "tagName"
        FROM "AlbumTag"
        INNER JOIN "Tag"
        ON "AlbumTag"."tagName" = "Tag"."name"
        WHERE "albumArtist" = ${album.artist}
        AND "albumName" = ${album.name}
        AND "Tag"."listUpdatedAt" IS NOT NULL
        ORDER BY "count" DESC
    `
  );
  if (albumTags.length > 1) {
    CACHE.set(cacheKey, albumTags);
  }
  return albumTags;
}
