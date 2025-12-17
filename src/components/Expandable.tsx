import { type ReactNode, useCallback, useState } from 'react';

export interface ExpandableProperties {
  items: ReactNode[];
  max: number;
}

export default function Expandable({ items, max }: ExpandableProperties) {
  const [isExpanded, setExpanded] = useState(false);
  const itemsToShow = isExpanded ? items : items.slice(0, max);
  const toggle = useCallback(() => setExpanded((previous) => !previous), []);
  return (
    <>
      {itemsToShow}
      {items.length > max && (
        <button
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? 'Collapse items'
              : `Show ${items.length - max} more items`
          }
        >
          <span className="inline-block transform transition-transform duration-150">
            {isExpanded ? '«' : `+${items.length - max}`}
          </span>
        </button>
      )}
    </>
  );
}
