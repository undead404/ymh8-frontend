import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useMusicGenres, {
  type GenresSortKey,
  type SortDirection,
} from '../hooks/use-music-genres'; // Adjust path

import MusicGenresTable from './MusicGenresTable'; // Adjust path
import type { SortButtonProperties } from './SortButton';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// 1. Mock the Custom Hook
// We mock the entire module to control state and handlers returned to the component.
vi.mock('../hooks/use-music-genres');

// 2. Mock Utility functions
// We isolate the component from util logic errors.
vi.mock('../utils/format-date', () => ({
  default: (date: Date) => `Formatted: ${date.toISOString()}`,
}));
vi.mock('../utils/format-weight', () => ({
  default: (weight: number) => `Formatted: ${weight}`,
}));
vi.mock('../utils/slugify', () => ({
  default: (text: string) => `slug-${text.toLowerCase()}`,
}));

// 3. Mock SortButton
// We mock this to ensure we can easily find and click the sort trigger
// without depending on SortButton's internal implementation.
vi.mock('./SortButton', () => ({
  SortButton: ({
    children,
    setSort,
    columnKey,
  }: SortButtonProperties<string>) => (
    <button
      data-testid={`sort-${columnKey}`}
      onClick={() => setSort(columnKey)}
    >
      {children}
    </button>
  ),
}));

// 4. Mock Lucide Icons (Optional, keeps DOM clean)
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="icon-calendar" />,
  Music: () => <span data-testid="icon-music" />,
  Search: () => <span data-testid="icon-search" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
}));

// -----------------------------------------------------------------------------
// Test Data & Setup
// -----------------------------------------------------------------------------

const mockGenres = [
  {
    id: '1',
    data: {
      albumsScrapedAt: '2023-01-01T00:00:00.000Z',
      name: 'Synthwave',
      description: 'Retro futuristic',
      weight: 1500,
      listUpdatedAt: '2023-01-01T00:00:00.000Z',
    },
  },
  {
    id: '2',
    data: {
      albumsScrapedAt: '2023-01-01T00:00:00.000Z',
      name: 'Lo-Fi',
      description: 'Chill beats',
      weight: 800,
      listUpdatedAt: '2023-02-01T00:00:00.000Z',
    },
  },
];

describe('MusicGenresTable', () => {
  // Default mock return values
  const defaultHookValues = {
    searchTerm: '',
    sortConfig: {
      key: 'weight' as GenresSortKey,
      direction: 'desc' as SortDirection,
    },
    filteredAndSortedGenres: mockGenres,
    handleSort: vi.fn(),
    handleSearchChange: vi.fn(),
  };

  beforeEach(() => {
    // Reset mock implementation before each test
    vi.mocked(useMusicGenres).mockReturnValue(defaultHookValues);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering Tests
  // ---------------------------------------------------------------------------

  it('renders the table with correct genre counts', () => {
    render(<MusicGenresTable genres={mockGenres} />);

    // Check header stats
    expect(screen.getByText('2')).toBeInTheDocument(); // Filtered count
    expect(screen.getByText('2 genres')).toBeInTheDocument(); // Total count

    // Check rows exist
    expect(screen.getByText('Synthwave')).toBeInTheDocument();
    expect(screen.getByText('Lo-Fi')).toBeInTheDocument();
  });

  it('correctly formats data using utility functions', () => {
    render(<MusicGenresTable genres={mockGenres} />);

    // Check Weight Formatting (Mocked)
    expect(screen.getByText('Formatted: 1500')).toBeInTheDocument();

    // Check Date Formatting (Mocked)
    // Note: The mock returns ISO string, checking partial match
    expect(screen.getByText(/Formatted: 2023-01-01/)).toBeInTheDocument();
  });

  it('generates correct href links for genres', () => {
    render(<MusicGenresTable genres={mockGenres} />);

    const anchor = screen.getByRole('link', { name: /synthwave/i });
    // Expecting the slugify mock output
    expect(anchor).toHaveAttribute('href', '/tags/slug-synthwave');
  });

  // ---------------------------------------------------------------------------
  // Interaction Tests
  // ---------------------------------------------------------------------------

  it('calls handleSearchChange when typing in the search bar', () => {
    const handleSearchChangeMock = vi.fn();
    vi.mocked(useMusicGenres).mockReturnValue({
      ...defaultHookValues,
      handleSearchChange: handleSearchChangeMock,
    });

    render(<MusicGenresTable genres={mockGenres} />);

    const input = screen.getByPlaceholderText('Search genres...');
    fireEvent.change(input, { target: { value: 'Metal' } });

    expect(handleSearchChangeMock).toHaveBeenCalledTimes(1);
  });

  it('binds the search term value from the hook to the input', () => {
    vi.mocked(useMusicGenres).mockReturnValue({
      ...defaultHookValues,
      searchTerm: 'Existing Search',
    });

    render(<MusicGenresTable genres={mockGenres} />);

    const input =
      screen.getByPlaceholderText<HTMLInputElement>('Search genres...');
    expect(input.value).toBe('Existing Search');
  });

  it('calls handleSort when column headers are clicked', () => {
    const handleSortMock = vi.fn();
    vi.mocked(useMusicGenres).mockReturnValue({
      ...defaultHookValues,
      handleSort: handleSortMock,
    });

    render(<MusicGenresTable genres={mockGenres} />);

    // Click the Weight SortButton (using the data-testid from our mock)
    fireEvent.click(screen.getByTestId('sort-weight'));

    expect(handleSortMock).toHaveBeenCalledWith('weight');
    expect(handleSortMock).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Empty State Tests
  // ---------------------------------------------------------------------------

  it('renders the empty state when no genres match filter', () => {
    vi.mocked(useMusicGenres).mockReturnValue({
      ...defaultHookValues,
      filteredAndSortedGenres: [], // Simulate empty result
      searchTerm: 'NonExistent',
    });

    render(<MusicGenresTable genres={mockGenres} />);

    // Check for empty state text
    expect(screen.getByText('No genres found')).toBeInTheDocument();
    expect(
      screen.getByText('We couldn\'t find anything matching "NonExistent"'),
    ).toBeInTheDocument();

    // Ensure table body is empty (or headers exist but rows don't)
    // The specific logic ensures rows don't render.
    expect(screen.queryByText('Synthwave')).not.toBeInTheDocument();
  });
});
