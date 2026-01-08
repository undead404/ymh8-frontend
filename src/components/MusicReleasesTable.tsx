import { useState } from 'react';

import type getTagList from '../database/get-tag-list';
import useSortedReleases, {
  type ReleasesSortKey,
} from '../hooks/use-sorted-releases';
import encodeLastfmUrlComponent from '../utils/encode-lastfm-url-component';
import getAlbumIdentity from '../utils/get-album-identity';
import slugify from '../utils/slugify';

import AlbumTag from './AlbumTag';
import Expandable from './Expandable';
import PreviewPlayer from './PreviewPlayer';
import { SortButton } from './SortButton';

import AppleMusicIcon from '../assets/apple-music-svgrepo-com.svg?react';
import LastfmIcon from '../assets/last-fm-svgrepo-com.svg?react';

export type Release = Awaited<ReturnType<typeof getTagList>>['list'][number];

interface MusicReleasesTableProperties {
  releases: Release[];
  self?: string;
}

const COLUMNS = [
  { key: 'place', label: '#', className: 'w-16' },
  { key: 'name', label: 'Album', className: 'w-1/4' },
  { key: 'artist', label: 'Artist', className: 'w-1/5' },
  { key: 'date', label: 'Date', className: 'w-32' }, // Shortened label
  { key: 'topTag', label: 'Tags', className: 'w-1/4' },
  { key: 'topPlace', label: 'Places', className: 'w-1/5' },
] as const;
const ArrowsUpDownIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
    />
  </svg>
);
const ArrowUpIcon = () => (
  <svg
    className="w-5 h-5 text-indigo-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
);
const ArrowDownIcon = () => (
  <svg
    className="w-5 h-5 text-indigo-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
    />
  </svg>
);
export default function MusicReleasesTable({
  releases,
  self,
}: MusicReleasesTableProperties) {
  const { setSort, sortConfig, sortedReleases } = useSortedReleases(releases);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    // Changed: Removed overflow-x-auto so cards can use full width on mobile
    <div className="w-full bg-gray-50 md:bg-white md:rounded-lg md:shadow-lg md:ring-1 md:ring-black/5">
      {/* HEADER: Adaptive Layout */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center sticky top-0 z-10 md:static">
        <h2 className="text-lg font-semibold text-gray-900">Top Releases</h2>

        {/* --- MOBILE SORT CONTROLS --- */}
        <div className="flex gap-2 md:hidden w-full">
          {/* 1. The Column Selector */}
          <div className="relative grow">
            <select
              className="w-full appearance-none bg-white text-sm border border-gray-300 rounded-md py-2 pl-3 pr-8 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={(event) =>
                setSort(event.target.value as ReleasesSortKey)
              }
              value={sortConfig?.key || ''}
            >
              <option value="" disabled>
                Sort by...
              </option>
              {COLUMNS.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
            {/* Decorative arrow for select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* 2. The Direction Toggle Button */}
          <button
            type="button"
            onClick={() => {
              // If a key is selected, clicking this toggles the direction
              // (Assuming useSortedReleases handles toggle when key matches)
              if (sortConfig?.key) {
                setSort(sortConfig.key);
              }
            }}
            disabled={!sortConfig?.key}
            className={`
                    flex items-center justify-center px-3 border rounded-md shadow-sm transition-colors
                    ${
                      sortConfig?.key
                        ? 'bg-white border-gray-300 active:bg-gray-100'
                        : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    }
                `}
            aria-label="Toggle sort direction"
          >
            {sortConfig?.direction ? (
              sortConfig.direction === 'asc' ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon />
              )
            ) : (
              <ArrowsUpDownIcon />
            )}
          </button>
        </div>
      </div>

      <table className="min-w-full md:divide-y md:divide-gray-300 block md:table">
        {/* THEAD: Hidden on mobile (block hidden), visible on desktop (md:table-header-group) */}
        <thead className="hidden md:table-header-group bg-gray-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer ${col.className || ''}`}
              >
                <SortButton
                  columnKey={col.key}
                  setSort={setSort}
                  sortConfig={sortConfig}
                >
                  {col.label}
                </SortButton>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="block md:table-row-group md:divide-y md:divide-gray-200 bg-transparent md:bg-white p-4 md:p-0 space-y-4 md:space-y-0">
          {sortedReleases.map((album) => (
            <tr
              key={album.place}
              // ROW TRANSFORMATION:
              // Mobile: Flex column (card), white bg, shadow, rounded.
              // Desktop: Table row, hover effect.
              className="
                relative flex flex-col gap-2 
                bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5
                md:table-row md:gap-0 md:p-0 md:rounded-none md:shadow-none md:ring-0 md:hover:bg-gray-50 transition-colors
              "
            >
              {/* CELL 1: Place/Rank */}
              {/* Mobile: Absolute badge in top-right. Desktop: Standard cell. */}
              <td
                className="
                absolute top-4 right-4 
                text-xl font-bold text-gray-300
                md:static md:px-4 md:py-3 md:text-sm md:font-semibold md:text-gray-700 md:bg-transparent
              "
              >
                <span className="md:hidden">#</span>
                {album.place}
              </td>

              {/* CELL 2: Album/Player (Main Content) */}
              <td className="px-0 md:px-4 py-1 md:py-3 flex flex-col-reverse w-full">
                {album.url && (
                  <div className="mt-3 md:mt-0">
                    <PreviewPlayer
                      key={getAlbumIdentity(album)}
                      id={getAlbumIdentity(album)}
                      url={album.url}
                      activeId={activeId}
                      onPlay={setActiveId}
                    />
                  </div>
                )}
                {!album.itunesCheckedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pending audio preview…
                  </p>
                )}
                <div className="flex items-center gap-3 pr-10 md:pr-0">
                  {' '}
                  {/* pr-10 prevents text hitting the absolute Rank number */}
                  <img
                    src={album.thumbnail || 'https://placehold.co/10x10'}
                    alt=""
                    // Mobile: Slightly larger icon
                    className="h-14 w-14 md:h-10 md:w-10 rounded object-cover shadow-sm ring-1 ring-gray-900/10 shrink-0"
                    loading="lazy"
                    role="img"
                  />
                  <div className="flex mobile:flex-col min-w-0 flex-between grow">
                    <span className="font-semibold text-gray-900 truncate block md:inline">
                      {album.name}
                    </span>

                    {/* Moved Links here for Mobile, hidden on desktop if you prefer, or keep consistent */}
                    <span className="flex gap-3 mt-1 md:ml-auto md:mt-0">
                      {album.pageUrl && (
                        <a
                          className="text-gray-500 hover:text-[#fa243c] cursor-pointer"
                          href={album.pageUrl}
                          rel="noreferrer"
                          target="_blank"
                          title={`Listen ${getAlbumIdentity(album)} on Apple Music`}
                        >
                          <AppleMusicIcon className="w-5 h-5" />
                        </a>
                      )}
                      <a
                        href={`https://last.fm/music/${encodeLastfmUrlComponent(album.artist)}/${encodeLastfmUrlComponent(album.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-500 hover:text-[#b90000] cursor-pointer"
                      >
                        <LastfmIcon className="w-5 h-5" />
                      </a>
                    </span>
                  </div>
                </div>
              </td>

              {/* CELL 3: Artist */}
              {/* Mobile: Small text below title? Or standalone? Let's make it standalone but subtle */}
              <td className="px-0 md:px-4 py-0 md:py-3 text-sm text-gray-700">
                <span className="flex justify-between gap-2">
                  <span className="md:hidden text-gray-500 text-xs uppercase tracking-wide font-bold">
                    By
                  </span>
                  {album.artist}
                  <a
                    href={`https://last.fm/music/${encodeLastfmUrlComponent(album.artist)}`}
                    rel="noreferrer"
                    target="_blank"
                    title={`Open ${album.artist} on Last.fm`}
                  >
                    <LastfmIcon className="max-h-5 max-w-5 hover:underline" />
                  </a>
                </span>
              </td>

              {/* CELL 4: Date */}
              {/* Mobile: Inline with other meta */}
              <td className="px-0 md:px-4 py-1 md:py-3 text-sm text-gray-500 tabular-nums">
                <span className="md:hidden font-medium text-gray-400 mr-2">
                  Released:
                </span>
                {album.date}
              </td>

              {/* CELL 5: Tags */}
              <td className="px-0 md:px-4 py-2 md:py-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  <Expandable
                    max={3}
                    items={album.tags.map((tag) => (
                      <AlbumTag
                        key={tag.tagName}
                        count={tag.count}
                        isSelf={!!self && tag.tagName === self}
                        tagName={tag.tagName}
                      />
                    ))}
                  />
                </div>
              </td>

              {/* CELL 6: Places */}
              <td className="px-0 md:px-4 py-2 md:py-3 text-sm border-t border-gray-100 mt-2 pt-2 md:border-0 md:mt-0 md:pt-3">
                <div className="flex flex-wrap gap-1">
                  <Expandable
                    max={3}
                    items={album.places.map((tag) => (
                      <a
                        key={tag.tagName}
                        href={`/tags/${slugify(tag.tagName)}#place-${tag.place}`}
                        className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-200"
                      >
                        {tag.tagName}{' '}
                        <span className="ml-1 text-gray-400">#{tag.place}</span>
                      </a>
                    ))}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
