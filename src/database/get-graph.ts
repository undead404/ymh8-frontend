import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

import database from '.';

export default function getComplexTagData() {
  return (
    database
      // Stage 1: Calculate the base Tag weights
      .with('WeightedTags', (database_) =>
        database_
          .selectFrom('Tag as t')
          .innerJoin('AlbumTag as at', 't.name', 'at.tagName')
          .innerJoin('Album as a', (join) =>
            join
              .onRef('at.albumArtist', '=', 'a.artist')
              .onRef('at.albumName', '=', 'a.name'),
          )
          .where('t.listUpdatedAt', 'is not', null)
          .groupBy([
            't.name',
            't.description',
            't.albumsScrapedAt',
            't.listUpdatedAt',
          ])
          .select([
            't.name',
            't.description',
            't.albumsScrapedAt',
            't.listUpdatedAt',
            sql<number>`SUM(a.playcount::FLOAT / 1000 * a.listeners / 100 * at.count)`.as(
              'weight',
            ),
          ]),
      )
      // Stage 2: For each weighted tag, find related tags
      .selectFrom('WeightedTags as wt')
      .selectAll('wt')
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom('AlbumTag as r1') // "Related 1": Albums belonging to the current tag
            .innerJoin('AlbumTag as r2', (join) =>
              join
                .onRef('r1.albumArtist', '=', 'r2.albumArtist')
                .onRef('r1.albumName', '=', 'r2.albumName'),
            )
            .innerJoin('Album as ra', (join) =>
              join
                .onRef('r2.albumArtist', '=', 'ra.artist')
                .onRef('r2.albumName', '=', 'ra.name'),
            )
            .innerJoin('Tag as rt', 'rt.name', 'r2.tagName')
            .whereRef('r1.tagName', '=', 'wt.name') // Correlate to the outer tag
            .whereRef('r2.tagName', '<>', 'wt.name') // Don't relate to self
            .where('rt.listUpdatedAt', 'is not', null)
            .select([
              'r2.tagName as name',
              sql<number>`SUM(LEAST(r1.count, r2.count)::FLOAT * COALESCE(ra.listeners, 0))`.as(
                'weight',
              ),
            ])
            .groupBy('r2.tagName')
            .orderBy('weight', 'desc')
            .limit(5),
        ).as('related'),
      ])
      .orderBy('wt.weight', 'desc')
      .execute()
  );
}
