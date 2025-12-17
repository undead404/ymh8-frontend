import { useCallback, useMemo, useState } from "react";
import type getTagList from "../database/get-tag-list";

export type SortKey =
  | "artist"
  | "date"
  | "name"
  | "place"
  | "topPlace"
  | "topTag"
  | "weight";

export default function useSortedReleases(
  releases: Awaited<ReturnType<typeof getTagList>>["list"]
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
          aVal = a.artist;
          bVal = b.artist;
          break;
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "place":
          aVal = a.place;
          bVal = b.place;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "weight":
          aVal = a.weight;
          bVal = b.weight;
          break;
        case "topTag":
          aVal = a.tags[0]?.tagName.toLowerCase();
          bVal = b.tags[0]?.tagName.toLowerCase();
          break;
        case "topPlace":
          aVal = a.places[0]?.place;
          bVal = b.places[0]?.place;
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
