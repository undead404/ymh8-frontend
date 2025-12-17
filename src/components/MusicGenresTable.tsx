import { Calendar, Music, Search, TrendingUp } from 'lucide-react';

import type { Genre } from '../hooks/use-music-genres';
import useMusicGenres from '../hooks/use-music-genres';
import formatDate from '../utils/format-date';
import formatWeight from '../utils/format-weight';
import slugify from '../utils/slugify';

import { SortButton } from './SortButton';

interface GenreListProperties {
  genres: Genre[];
}

export default function MusicGenresTable({ genres }: GenreListProperties) {
  const {
    searchTerm,
    sortConfig,
    filteredAndSortedGenres,
    handleSort,
    handleSearchChange,
  } = useMusicGenres(genres);

  return (
    <div className="w-full">
      {/* Controls Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1 w-full">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            placeholder="Search genres..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="text-sm text-gray-600 whitespace-nowrap">
          <span className="font-semibold text-gray-900">
            {filteredAndSortedGenres.length}
          </span>
          <span className="mx-1">of</span>
          <span>{genres.length} genres</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    <SortButton
                      columnKey="name"
                      setSort={handleSort}
                      sortConfig={sortConfig}
                    >
                      <Music size={16} className="mr-1" />
                      Genre
                    </SortButton>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    <SortButton
                      columnKey="weight"
                      setSort={handleSort}
                      sortConfig={sortConfig}
                    >
                      <TrendingUp size={16} className="mr-1" />
                      Weight
                    </SortButton>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    <SortButton
                      columnKey="updated"
                      setSort={handleSort}
                      sortConfig={sortConfig}
                    >
                      <Calendar size={16} className="mr-1" />
                      Last Updated
                    </SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedGenres.map((genre) => (
                  <tr
                    key={genre.id}
                    className="group transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Anchor is now the primary interaction for the name cell, no parent onClick */}
                      <a
                        className="flex items-center focus:outline-none"
                        href={`/tags/${slugify(genre.data.name)}`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                          {genre.data.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {genre.data.name}
                          </div>
                          <div className="max-w-64 truncate text-xs text-gray-500">
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
                        <div className="ml-2 font-mono text-xs text-gray-500 tabular-nums">
                          {genre.data.weight.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 tabular-nums">
                      {formatDate(new Date(genre.data.listUpdatedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSortedGenres.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Music size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No genres found</p>
            <p className="text-sm">
              We couldn&apos;t find anything matching &quot;{searchTerm}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
