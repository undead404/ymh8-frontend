import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { FullTag } from '../schemata';

export interface Genre {
  id: string;
  data: FullTag;
}
export type GenresSortKey = 'name' | 'weight' | 'updated';
export type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: GenresSortKey;
  direction: SortDirection;
}

export default function useMusicGenres(genres: Genre[]) {
  const [searchTerm, setSearchTerm] = useState('');
  // Debounced search term prevents filtering on every single keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'weight',
    direction: 'desc',
  });

  // Debounce effect: 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredAndSortedGenres = useMemo(() => {
    // 1. Filter
    const query = debouncedSearch.toLowerCase();
    const filtered = genres.filter((genre) =>
      genre.data.name.toLowerCase().includes(query),
    );

    // 2. Sort (using toSorted or shallow copy to avoid mutation)
    return filtered.toSorted((a, b) => {
      const { key, direction } = sortConfig;
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (key) {
        case 'name': {
          return multiplier * a.data.name.localeCompare(b.data.name);
        }
        case 'weight': {
          return multiplier * (a.data.weight - b.data.weight);
        }
        case 'updated': {
          // Optimization: String comparison is sufficient for ISO 8601 dates
          // Falls back to timestamp if not ISO strings
          const tA = a.data.listUpdatedAt;
          const tB = b.data.listUpdatedAt;
          return multiplier * (tA < tB ? -1 : tA > tB ? 1 : 0);
        }
        default: {
          return 0;
        }
      }
    });
  }, [genres, debouncedSearch, sortConfig]);

  const handleSort = useCallback((key: GenresSortKey) => {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [],
  );

  return {
    searchTerm,
    sortConfig,
    filteredAndSortedGenres,
    handleSort,
    handleSearchChange,
  };
}
