import { useState } from 'react';

import type getTagList from '../database/get-tag-list';
import useSortedReleases from '../hooks/use-sorted-releases';
import encodeLastfmUrlComponent from '../utils/encode-lastfm-url-component';
import getAlbumIdentity from '../utils/get-album-identity';
import slugify from '../utils/slugify';

import AlbumTag from './AlbumTag';
import Expandable from './Expandable';
import PreviewPlayer from './PreviewPlayer';
import { SortButton } from './SortButton';

import AppleMusicIcon from '../assets/apple-music-svgrepo-com.svg?react';
import LastfmIcon from '../assets/last-fm-svgrepo-com.svg?react';

// 1. Define explicit types to decouple from DB implementation details
export type Release = Awaited<ReturnType<typeof getTagList>>['list'][number];

interface MusicReleasesTableProperties {
  releases: Release[];
  self?: string;
}

// 2. Configuration for columns to ensure header/body alignment
const COLUMNS = [
  { key: 'place', label: '#', className: 'w-16' },
  { key: 'name', label: 'Album', className: 'w-1/4' },
  { key: 'artist', label: 'Artist', className: 'w-1/5' },
  { key: 'date', label: 'Release Date', className: 'w-32' },
  { key: 'topTag', label: 'Tags', className: 'w-1/4' },
  { key: 'topPlace', label: 'Places', className: 'w-1/5' },
  // { key: 'weight', label: 'Weight', className: 'w-24 text-right' },
] as const;

export default function MusicReleasesTable({
  releases,
  self,
}: MusicReleasesTableProperties) {
  const { setSort, sortConfig, sortedReleases } = useSortedReleases(releases);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto rounded-lg bg-white shadow-lg ring-1 ring-black/5">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Top Releases</h2>
      </div>

      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${col.className || ''}`}
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
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedReleases.map((album) => (
            <tr
              key={album.place} // Prefer a unique ID (e.g., album.id) if available
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                {album.place}
              </td>

              <td className="px-4 py-3 flex flex-col-reverse">
                {album.url && (
                  <PreviewPlayer
                    key={getAlbumIdentity(album)}
                    id={getAlbumIdentity(album)}
                    url={album.url}
                    activeId={activeId}
                    onPlay={setActiveId}
                  />
                )}
                {!album.itunesCheckedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pending audio preview…
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <img
                    src={album.thumbnail || 'https://placehold.co/10x10'}
                    alt="" // Decorative image, alt should be empty if name is next to it
                    className="h-10 w-10 rounded object-cover shadow-sm ring-1 ring-gray-900/10"
                    loading="lazy"
                    role="img"
                  />

                  {album.name}
                  <span className="justify-self-end ml-auto flex gap-3">
                    {album.pageUrl && (
                      <a
                        href={album.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={`Listen ${getAlbumIdentity(album)} on Apple Music`}
                      >
                        <AppleMusicIcon className="max-h-5 max-w-5 w-5 h-5 hover:underline" />
                      </a>
                    )}
                    <a
                      href={`https://last.fm/music/${encodeLastfmUrlComponent(album.artist)}/${encodeLastfmUrlComponent(album.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      title={`Open ${getAlbumIdentity(album)} on Last.fm`}
                    >
                      <LastfmIcon className="max-h-5 max-w-5" />
                    </a>
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                <span className="flex flex-wrap align-middle gap-5 justify-between">
                  {album.artist}
                  <a
                    href={`https://last.fm/music/${encodeLastfmUrlComponent(album.artist)}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${album.artist} on Last.fm`}
                  >
                    <LastfmIcon className="max-h-5 max-w-5 hover:underline" />
                  </a>
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">
                {album.date}
              </td>

              <td className="px-4 py-3 text-sm">
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

              <td className="px-4 py-3 text-sm">
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

              {/* <td className="px-4 py-3 text-right text-sm font-mono text-gray-600 tabular-nums">
                {album.weight.toLocaleString()}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
