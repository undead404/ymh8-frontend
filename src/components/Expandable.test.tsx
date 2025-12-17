import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Expandable from './Expandable'; // Adjust path as needed

// Helper to generate test items
const generateItems = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <div key={index}>Item {index + 1}</div>
  ));

describe('Expandable Component', () => {
  it('renders all items without a button when item count is within max', () => {
    const items = generateItems(3);
    render(<Expandable items={items} max={5} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();

    // Button should not exist
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('truncates items and renders a simplified button when item count exceeds max', () => {
    const items = generateItems(10);
    const max = 3;
    render(<Expandable items={items} max={max} />);

    // Visible items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();

    // Hidden items
    expect(screen.queryByText('Item 4')).not.toBeInTheDocument();

    // Button state
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(`+${10 - max}`); // +7
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show all items when clicked', async () => {
    const user = userEvent.setup();
    const items = generateItems(5);
    render(<Expandable items={items} max={2} />);

    const button = screen.getByRole('button');

    // Click to expand
    await user.click(button);

    // Check all items are visible
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();

    // Check button state update
    expect(button).toHaveTextContent('«');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Collapse items');
  });

  it('collapses back to max items when clicked twice', async () => {
    const user = userEvent.setup();
    const items = generateItems(5);
    render(<Expandable items={items} max={2} />);

    const button = screen.getByRole('button');

    // Expand
    await user.click(button);
    expect(screen.getByText('Item 5')).toBeInTheDocument();

    // Collapse
    await user.click(button);
    expect(screen.queryByText('Item 5')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('calculates the correct "show more" count in the label', () => {
    const items = generateItems(10);
    const max = 4;
    render(<Expandable items={items} max={max} />);

    const button = screen.getByRole('button');
    // 10 total - 4 shown = 6 remaining
    expect(button).toHaveAttribute('aria-label', 'Show 6 more items');
    expect(button).toHaveTextContent('+6');
  });
});
