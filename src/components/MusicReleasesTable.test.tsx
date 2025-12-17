import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useSortedReleases from '../hooks/use-sorted-releases';

import MusicReleasesTable from './MusicReleasesTable';

// 1. Mock the custom hook
// We need to control the data this hook returns to test the table's response
vi.mock('../hooks/use-sorted-releases');

// 3. Mock Expandable
// We don't need to test Expandable's internal logic here, just that it renders children
vi.mock('./Expandable', () => ({
  default: ({ items }: { items: React.ReactNode[] }) => <>{items}</>,
}));

const useSortedReleasesMock = vi.mocked(useSortedReleases);

// 4. Mock Data Fixtures
const mockReleases = [
  {
    place: 1,
    cover: null,
    statsUpdatedAt: '2023-01-01T00:00:00.000Z',
    name: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    date: '1973-03-01',
    thumbnail: 'https://example.com/pinkfloyd.jpg',
    weight: 5000,
    tags: [
      { tagName: 'rock', count: 100 },
      { tagName: 'prog', count: 50 },
    ],
    places: [{ tagName: 'London', place: 1, count: 10 }],
  },
  {
    place: 2,
    cover: null,
    statsUpdatedAt: '2023-01-01T00:00:00.000Z',
    name: 'Thriller',
    artist: 'Michael Jackson',
    date: '1982-11-29',
    thumbnail: null, // Test missing image case
    weight: 8000,
    tags: [],
    places: [],
  },
];

describe('MusicReleasesTable', () => {
  const mockSetSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    useSortedReleasesMock.mockReturnValue({
      setSort: mockSetSort,
      sortConfig: { key: 'place', direction: 'asc' },
      sortedReleases: mockReleases,
    });
  });

  it('renders the table with correct headers', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    // Check specific columns exist
    expect(
      screen.getByRole('columnheader', { name: /Album/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Weight/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Release Date/i }),
    ).toBeInTheDocument();
  });

  it('renders the correct number of rows based on sorted data', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    // We expect 2 rows in tbody.
    // Note: screen.getAllByRole('row') includes the thead row, so we look inside tbody if strict
    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows = 3
    expect(rows).toHaveLength(3);
  });

  it('renders album details correctly', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    // Check Text content
    expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
    expect(screen.getByText('Pink Floyd')).toBeInTheDocument();

    // Check tabular-nums formatting (dates and weights)
    expect(screen.getByText('1973-03-01')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument(); // Checks locale string formatting
  });

  it('renders images when provided', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/pinkfloyd.jpg');
  });

  it('handles missing images gracefully', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    // We have 2 items, but only 1 has an image.
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
  });

  it('triggers setSort when a column header is clicked', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    const weightHeader = screen.getByRole('button', { name: /Weight/i });
    fireEvent.click(weightHeader);

    expect(mockSetSort).toHaveBeenCalledWith('weight');
  });

  it('renders tags with correct font scaling logic', () => {
    render(<MusicReleasesTable releases={mockReleases} />);

    const rockTag = screen.getByRole('link', { name: /Rock/i });

    // Validate the font-size calculation:
    // Logic was: clamp(0.75, 0.75 + log10(100) * 0.1, 1.25)
    // log10(100) = 2.  0.75 + (2 * 0.1) = 0.95.
    // 0.95rem is within the clamp.
    expect(rockTag).toHaveStyle({ fontSize: '0.95rem' });
    expect(rockTag).toHaveAttribute('href', '/tags/rock');
  });

  it('renders empty state without crashing', () => {
    // Override mock for this specific test
    useSortedReleasesMock.mockReturnValue({
      setSort: mockSetSort,
      sortConfig: {
        key: 'weight',
        direction: 'desc',
      },
      sortedReleases: [],
    });

    render(<MusicReleasesTable releases={[]} />);

    // Should render headers but no body rows
    // getAllByRole throws if 0 found, so we use queryAllByRole
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(1); // Only the header row
  });
});
