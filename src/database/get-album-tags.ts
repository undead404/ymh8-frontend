import type { BareAlbum } from "../schemata";
import db from ".";

export default function getAlbumTags(album: BareAlbum) {
  return db
    .selectFrom("AlbumTag")
    .innerJoin("Tag", "AlbumTag.tagName", "Tag.name")
    .select(["count", "tagName"])
    .where("albumArtist", "=", album.artist)
    .where("albumName", "=", album.name)
    .where("Tag.listUpdatedAt", "is not", null)
    .orderBy("count", "desc")
    .execute();
}
