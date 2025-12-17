// slugify.test.ts
import { describe, expect, it } from 'vitest';

import slugify from './slugify';

describe('slugify (naive implementation)', () => {
  it('replaces single spaces with hyphens', () => {
    expect(slugify('indie rock')).toBe('indie-rock');
  });

  it('fails to lowercase strings (Current Behavior)', () => {
    // Ideally this should be 'heavy-metal'
    expect(slugify('Heavy Metal')).toBe('Heavy-Metal');
  });

  it('fails to remove special characters (Current Behavior)', () => {
    // Ideally this should be 'rock-and-roll' or 'rock-roll'
    expect(slugify('Rock & Roll')).toBe('Rock-&-Roll');
  });

  it('fails to collapse multiple spaces (Current Behavior)', () => {
    // Ideally this should be 'pop-rock'
    expect(slugify('pop  rock')).toBe('pop--rock');
  });

  it('fails to trim surrounding whitespace (Current Behavior)', () => {
    // Ideally this should be 'jazz'
    expect(slugify(' jazz ')).toBe('-jazz-');
  });
});
