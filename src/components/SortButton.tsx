import { useCallback, type ReactNode } from "react";
import type { SortKey } from "../hooks/use-sorted-releases";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SortButtonProperties {
  children: ReactNode;
  columnKey: SortKey;
  setSort: (key: SortKey) => void;
  sortConfig: {
    direction: "asc" | "desc";
    key: SortKey;
  };
}

export function SortButton({
  columnKey,
  children,
  setSort,
  sortConfig,
}: SortButtonProperties) {
  const isActive = sortConfig.key === columnKey;

  const handleSort = useCallback(() => {
    setSort(columnKey);
  }, [columnKey, setSort]);
  return (
    <button
      onClick={handleSort}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold w-full cursor-pointer"
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
}
