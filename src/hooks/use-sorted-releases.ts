import { useCallback, useMemo, useState } from "react";
import type { FullAlbum } from "../schemata";

export type SortKey =
  | "artist"
  | "date"
  | "name"
  | "place"
  | "topPlace"
  | "topTag"
  | "weight";

export default function useSortedReleases(
  releases: {
    id: string;
    data: FullAlbum;
  }[]
) {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "asc",
  });

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const sortedReleases = useMemo(() => {
    const sorted = [...releases];
    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case "artist":
          aVal = a.data.artist;
          bVal = b.data.artist;
          break;
        case "date":
          aVal = a.data.date;
          bVal = b.data.date;
          break;
        case "place":
          aVal = a.data.place;
          bVal = b.data.place;
          break;
        case "name":
          aVal = a.data.name.toLowerCase();
          bVal = b.data.name.toLowerCase();
          break;
        case "weight":
          aVal = a.data.weight;
          bVal = b.data.weight;
          break;
        case "topTag":
          aVal = a.data.tags[0]?.tagName.toLowerCase();
          bVal = b.data.tags[0]?.tagName.toLowerCase();
          break;
        case "topPlace":
          aVal = a.data.places[0]?.place;
          bVal = b.data.places[0]?.place;
          break;
        default:
          return 0;
      }
      if (aVal == null) {
        if (bVal == null) {
          return 0;
        }
        return 1;
      }
      if (bVal == null) {
        return -1;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
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
