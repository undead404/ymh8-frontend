import { sql } from 'kysely';

import database from '.';

export default function getTagsIndex() {
  return database
    .selectFrom('Tag')
    .innerJoin('AlbumTag', 'Tag.name', 'AlbumTag.tagName')
    .innerJoin('Album', (join) =>
      join
        .onRef('AlbumTag.albumArtist', '=', 'Album.artist')
        .onRef('AlbumTag.albumName', '=', 'Album.name'),
    )
    .where('listUpdatedAt', 'is not', null)
    .groupBy('Tag.name') // Valid in Postgres if name is PK
    .select([
      'Tag.albumsScrapedAt',
      'Tag.description',
      'Tag.name',
      'Tag.listUpdatedAt',
      // Complex math calculation kept as raw SQL
      sql<number>`SUM("Album"."playcount"::FLOAT / 1000 * "Album"."listeners" / 100 * "AlbumTag"."count")`.as(
        'weight',
      ),
    ])
    .orderBy('weight', 'desc')
    .execute();
}
