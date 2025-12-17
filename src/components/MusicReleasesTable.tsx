import useSortedReleases from "../hooks/use-sorted-releases";
import { SortButton } from "./SortButton";
import Expandable from "./Expandable";
import type getTagList from "../database/get-tag-list";
import slugify from "../utils/slugify";

export interface MusicReleasesTableProperties {
  releases: Awaited<ReturnType<typeof getTagList>>["list"];
}

export default function MusicReleasesTable({
  releases,
}: MusicReleasesTableProperties) {
  const { setSort, sortConfig, sortedReleases } = useSortedReleases(releases);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="place"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                #
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="name"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Album
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="artist"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Artist
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="date"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Release Date
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="topTag"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Tags
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="topPlace"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Places
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton
                columnKey="weight"
                setSort={setSort}
                sortConfig={sortConfig}
              >
                Weight
              </SortButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedReleases.map((album) => (
            <tr
              key={album.place}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              id={`place-${album.place}`}
            >
              <td className="px-4 py-3 font-semibold text-gray-700">
                {album.place}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {album.thumbnail && (
                    <img
                      src={album.thumbnail}
                      alt={album.name}
                      className="w-10 h-10 rounded shadow-sm"
                    />
                  )}
                  <span className="font-medium">{album.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{album.artist}</td>
              <td className="px-4 py-3 text-gray-600 text-sm">{album.date}</td>
              <td className="px-4 py-3 max-w-3xs gap-1 text-sm">
                <p className="flex flex-wrap gap-[3px]">
                  <Expandable
                    items={album.tags.map((tag) => (
                      <a
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-center"
                        key={tag.tagName}
                        href={`/tags/${slugify(tag.tagName)}`}
                        style={{ fontSize: `calc(1em * ${tag.count} / 100)` }}
                        title={tag.tagName}
                      >
                        {tag.tagName}
                      </a>
                    ))}
                    max={3}
                  />
                </p>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-3xs">
                <div className="flex flex-wrap gap-[3px]">
                  <Expandable
                    items={album.places.map((tag) => (
                      <a
                        key={tag.tagName}
                        className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        href={`/tags/${slugify(tag.tagName)}#place-${
                          tag.place
                        }`}
                        title={`Place: ${tag.place}`}
                      >
                        {tag.tagName} #{tag.place}
                      </a>
                    ))}
                    max={3}
                  />
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600 text-sm font-mono">
                {album.weight.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
