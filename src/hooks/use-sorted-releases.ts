import { padEnd } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import type getTagList from '../database/get-tag-list';

export type ReleasesSortKey =
  | 'artist'
  | 'date'
  | 'name'
  | 'place'
  | 'topPlace'
  | 'topTag'
  | 'weight';

export default function useSortedReleases(
  releases: Awaited<ReturnType<typeof getTagList>>['list'],
) {
  const [sortConfig, setSortConfig] = useState<{
    key: ReleasesSortKey;
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'asc',
  });

  const handleSort = useCallback((key: ReleasesSortKey) => {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const sortedReleases = useMemo(() => {
    const sorted = [...releases];
    sorted.sort((a, b) => {
      let aValue: undefined | number | string,
        bValue: undefined | number | string;

      switch (sortConfig.key) {
        case 'artist': {
          aValue = a.artist;
          bValue = b.artist;
          break;
        }
        case 'date': {
          const baseYear = sortConfig.direction === 'asc' ? '9999' : '0000';
          const padding = sortConfig.direction === 'asc' ? '-99' : '-00';
          aValue = padEnd(a.date ?? baseYear, 10, padding);
          bValue = padEnd(b.date ?? baseYear, 10, padding);
          // console.log(aValue, '?', bValue);
          break;
        }
        case 'place': {
          aValue = a.place;
          bValue = b.place;
          break;
        }
        case 'name': {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        }
        case 'weight': {
          aValue = a.weight;
          bValue = b.weight;
          break;
        }
        case 'topTag': {
          aValue = a.tags[0]?.tagName.toLowerCase();
          bValue = b.tags[0]?.tagName.toLowerCase();
          break;
        }
        case 'topPlace': {
          aValue = a.places[0]?.place;
          bValue = b.places[0]?.place;
          break;
        }
        default: {
          return 0;
        }
      }
      if (aValue == undefined) {
        if (bValue == undefined) {
          return 0;
        }
        return 1;
      }
      if (bValue == undefined) {
        return -1;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [releases, sortConfig]);

  return {
    setSort: handleSort,
    sortConfig,
    sortedReleases,
  };
}
