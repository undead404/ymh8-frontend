import { useMemo } from 'react';

import slugify from '../utils/slugify';

export interface AlbumTagProperties {
  count: number;
  isSelf: boolean;
  tagName: string;
}

// 3. Mathematical clamping for font size
const calculateTagSize = (count: number): string => {
  // Clamps font size between 0.75rem and 1.25rem based on count
  // Formula: Size = Base + log10(count) * scaling_factor
  const size = Math.min(1.25, Math.max(0.75, 0.75 + Math.log10(count) * 0.1));
  return `${size}rem`;
};
export default function AlbumTag({
  count,
  isSelf,
  tagName,
}: AlbumTagProperties) {
  const style = useMemo(() => ({ fontSize: calculateTagSize(count) }), [count]);
  const title = `${tagName} (${count}%)`;
  if (isSelf) {
    return (
      <span
        className="inline-flex items-center rounded px-2 py-1 ring-1 ring-inset ring-blue-700/10"
        style={style}
        title={title}
      >
        {tagName}
      </span>
    );
  }
  return (
    <a
      key={tagName}
      href={`/tags/${slugify(tagName)}`}
      className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100"
      style={style}
      title={title}
    >
      {tagName}
    </a>
  );
}
