import type { BareAlbum } from '../schemata';

export default function getAlbumIdentity(album: BareAlbum): string {
  return `${album.artist} - ${album.name}`;
}
