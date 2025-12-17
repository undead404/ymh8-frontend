import type getTagList from '../database/get-tag-list';
import useSortedReleases from '../hooks/use-sorted-releases';
import slugify from '../utils/slugify';

import Expandable from './Expandable';
import { SortButton } from './SortButton';

const Link = 'a';
// 1. Define explicit types to decouple from DB implementation details
export type Release = Awaited<ReturnType<typeof getTagList>>['list'][number];

interface MusicReleasesTableProperties {
  releases: Release[];
}

// 2. Configuration for columns to ensure header/body alignment
const COLUMNS = [
  { key: 'place', label: '#', className: 'w-16' },
  { key: 'name', label: 'Album', className: 'w-1/4' },
  { key: 'artist', label: 'Artist', className: 'w-1/5' },
  { key: 'date', label: 'Release Date', className: 'w-32' },
  { key: 'topTag', label: 'Tags', className: 'w-1/4' },
  { key: 'topPlace', label: 'Places', className: 'w-1/5' },
  { key: 'weight', label: 'Weight', className: 'w-24 text-right' },
] as const;

// 3. Mathematical clamping for font size
const calculateTagSize = (count: number): string => {
  // Clamps font size between 0.75rem and 1.25rem based on count
  // Formula: Size = Base + log10(count) * scaling_factor
  const size = Math.min(1.25, Math.max(0.75, 0.75 + Math.log10(count) * 0.1));
  return `${size}rem`;
};

export default function MusicReleasesTable({
  releases,
}: MusicReleasesTableProperties) {
  const { setSort, sortConfig, sortedReleases } = useSortedReleases(releases);

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

              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {album.thumbnail && (
                    <img
                      src={album.thumbnail}
                      alt="" // Decorative image, alt should be empty if name is next to it
                      className="h-10 w-10 rounded object-cover shadow-sm ring-1 ring-gray-900/10"
                      loading="lazy"
                      role="img"
                    />
                  )}
                  <span className="font-medium text-gray-900">
                    {album.name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {album.artist}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">
                {album.date}
              </td>

              <td className="px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  <Expandable
                    max={3}
                    items={album.tags.map((tag) => (
                      <Link
                        key={tag.tagName}
                        href={`/tags/${slugify(tag.tagName)}`}
                        className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100"
                        style={{ fontSize: calculateTagSize(tag.count) }}
                        title={`${tag.tagName} (${tag.count})`}
                      >
                        {tag.tagName}
                      </Link>
                    ))}
                  />
                </div>
              </td>

              <td className="px-4 py-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  <Expandable
                    max={3}
                    items={album.places.map((tag) => (
                      <Link
                        key={tag.tagName}
                        href={`/tags/${slugify(tag.tagName)}#place-${tag.place}`}
                        className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-200"
                      >
                        {tag.tagName}{' '}
                        <span className="ml-1 text-gray-400">#{tag.place}</span>
                      </Link>
                    ))}
                  />
                </div>
              </td>

              <td className="px-4 py-3 text-right text-sm font-mono text-gray-600 tabular-nums">
                {album.weight.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
