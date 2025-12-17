import type { BareAlbum } from "../schemata";
import db from ".";

export default function getAlbumPlaces(album: BareAlbum) {
  return db
    .selectFrom("TagListItem")
    .select(["place", "tagName"])
    .where("albumArtist", "=", album.artist)
    .where("albumName", "=", album.name)
    .orderBy("place", "asc")
    .execute();
}
