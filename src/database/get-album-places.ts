import type { BareAlbum } from '../schemata';

import database from '.';

export default function getAlbumPlaces(album: BareAlbum) {
  console.log('getAlbumPlaces', { artist: album.artist, name: album.name });
  return database
    .selectFrom('TagListItem')
    .select(['place', 'tagName'])
    .where('albumArtist', '=', album.artist)
    .where('albumName', '=', album.name)
    .orderBy('place', 'asc')
    .execute();
}
