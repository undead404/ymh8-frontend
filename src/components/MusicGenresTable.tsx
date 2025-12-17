import React, { useState, useMemo } from "react";
import {
  Search,
  Music,
  TrendingUp,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { FullTag } from "../schemata";
import slugify from "../utils/slugify";

interface Genre {
  id: string;
  data: FullTag;
}

interface GenreListProps {
  genres: Genre[];
}

type SortKey = "name" | "weight" | "updated";
type SortDirection = "asc" | "desc";

export default function MusicGenresTable({ genres }: GenreListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "weight",
    direction: "desc",
  });

  const filteredAndSortedGenres = useMemo(() => {
    let filtered = genres.filter((genre) =>
      genre.data.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case "name":
          aValue = a.data.name;
          bValue = b.data.name;
          break;
        case "weight":
          aValue = a.data.weight;
          bValue = b.data.weight;
          break;
        case "updated":
          aValue = new Date(a.data.listUpdatedAt).getTime();
          bValue = new Date(b.data.listUpdatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortConfig.direction === "asc"
        ? aValue - (bValue as number)
        : (bValue as number) - aValue;
    });

    return filtered;
  }, [genres, searchTerm, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1e9) return `${(weight / 1e9).toFixed(2)}B`;
    if (weight >= 1e6) return `${(weight / 1e6).toFixed(2)}M`;
    if (weight >= 1e3) return `${(weight / 1e3).toFixed(2)}K`;
    return weight.toFixed(0);
  };

  const SortButton: React.FC<{
    columnKey: SortKey;
    children: React.ReactNode;
  }> = ({ columnKey, children }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <button
        onClick={() => handleSort(columnKey)}
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-semibold w-full"
      >
        {children}
        <span className="w-4">
          {isActive &&
            (sortConfig.direction === "asc" ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            ))}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedGenres.length} of {genres.length} genres
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton columnKey="name">
                      <Music size={16} className="mr-1" />
                      Genre
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton columnKey="weight">
                      <TrendingUp size={16} className="mr-1" />
                      Weight
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton columnKey="updated">
                      <Calendar size={16} className="mr-1" />
                      Last Updated
                    </SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedGenres.map((genre) => (
                  <tr
                    key={genre.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      console.log("Genre clicked:", genre.data.name)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        className="flex items-center"
                        href={`/tags/${slugify(genre.data.name)}`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {genre.data.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {genre.data.name}
                          </div>
                          <div className="text-xs text-gray-500 max-w-64 truncate">
                            {genre.data.description}
                          </div>
                        </div>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatWeight(genre.data.weight)}
                        </div>
                        <div className="ml-2 text-xs text-gray-500 font-mono">
                          {genre.data.weight.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(new Date(genre.data.listUpdatedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSortedGenres.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Music size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No genres found</p>
            <p className="text-sm">Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
