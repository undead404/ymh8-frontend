import { useCallback, useState, type ReactNode } from "react";

export interface ExpandableProperties {
  items: ReactNode[];
  max: number;
}

export default function Expandable({ items, max }: ExpandableProperties) {
  const [isExpanded, setExpanded] = useState(false);
  const itemsToShow = isExpanded ? items : items.slice(0, max);
  const toggle = useCallback(() => setExpanded((prev) => !prev), []);
  return (
    <>
      {itemsToShow}
      {items.length > max && (
        <button
          className="cursor-pointer inline-flex items-center gap-2 px-3 rounded-md bg-white border border-gray-200 text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? "Collapse items"
              : `Show ${items.length - max} more items`
          }
        >
          <span className="inline-block transform transition-transform duration-150">
            {isExpanded ? "«" : `+${items.length - max}`}
          </span>
        </button>
      )}
    </>
  );
}
