import SQL from "@nearform/sql";
import { database } from "./database";
import {
  albumPlaceSchema,
  type AlbumPlace,
  type BareAlbum,
} from "../../schemata";

const CACHE = new Map<string, AlbumPlace[]>();

export default async function getAlbumPlaces(
  album: BareAlbum
): Promise<AlbumPlace[]> {
  const cacheKey = `${album.artist} - ${album.name}`;
  const cacheValue = CACHE.get(cacheKey);
  if (cacheValue) {
    return cacheValue;
  }
  console.log("getAlbumPlaces", { artist: album.artist, name: album.name });
  const albumPlaces = await database.queryMany(
    albumPlaceSchema,
    SQL`
        SELECT
            "place",
            "tagName"
        FROM "TagListItem"
        WHERE "albumArtist" = ${album.artist}
        AND "albumName" = ${album.name}
        ORDER BY "place" ASC
    `
  );
  if (albumPlaces.length > 1) {
    CACHE.set(cacheKey, albumPlaces);
  }
  return albumPlaces;
}
