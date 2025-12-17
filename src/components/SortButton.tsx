import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useCallback } from 'react';

export interface SortButtonProperties<T extends string> {
  children: ReactNode;
  columnKey: T;
  setSort: (key: T) => void;
  sortConfig: {
    direction: 'asc' | 'desc';
    key: T;
  };
}

export function SortButton<T extends string>({
  columnKey,
  children,
  setSort,
  sortConfig,
}: SortButtonProperties<T>) {
  const isActive = sortConfig.key === columnKey;

  const handleSort = useCallback(() => {
    setSort(columnKey);
  }, [columnKey, setSort]);
  return (
    <button
      onClick={handleSort}
      className="flex w-full cursor-pointer items-center gap-1 font-semibold transition-colors hover:text-blue-600"
    >
      {children}
      <span className="w-4">
        {isActive &&
          (sortConfig.direction === 'asc' ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          ))}
      </span>
    </button>
  );
}
