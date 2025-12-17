import { describe, expect, it } from 'vitest';

import injectRelatedGenres from './inject-related-genres';

describe('injectRelatedGenres', () => {
  it("should handle the 'Atmospheric Sludge Metal' scenario (Self contains Related)", () => {
    const self = 'atmospheric sludge metal';
    const desc = 'Atmospheric sludge metal evolved from sludge.';
    const related = ['sludge'];

    // 'atmospheric sludge metal' (self) claims the first 24 chars.
    // 'sludge' (related) appears at the end.
    // Result: The first part is ignored (self), the second part is linked.
    expect(injectRelatedGenres(self, desc, related)).toBe(
      'Atmospheric sludge metal evolved from [sludge](/tags/sludge/).',
    );
  });

  it("should handle the 'Sunshine Pop' scenario (Related contains Self)", () => {
    const self = 'pop';
    const desc = 'Pop is good, but we mostly listen to sunshine pop.';
    const related = ['sunshine pop'];

    // 'sunshine pop' is longer than 'pop', so it claims the spot first.
    expect(injectRelatedGenres(self, desc, related)).toBe(
      'Pop is good, but we mostly listen to [sunshine pop](/tags/sunshine-pop/).',
    );
  });

  it('should standard basic injection', () => {
    const self = 'pop';
    const desc = 'Related to rock and jazz.';
    const related = ['rock', 'jazz'];

    expect(injectRelatedGenres(self, desc, related)).toBe(
      'Related to [rock](/tags/rock/) and [jazz](/tags/jazz/).',
    );
  });

  it('should not link the self genre when it stands alone', () => {
    const self = 'rock';
    const desc = 'Rock is a broad genre.';
    const related = ['metal'];

    expect(injectRelatedGenres(self, desc, related)).toBe(
      'Rock is a broad genre.',
    );
  });

  it('should preserve original case in the link text', () => {
    const self = 'pop';
    const desc = 'Influenced by RoCk music.';
    const related = ['rock'];

    expect(injectRelatedGenres(self, desc, related)).toBe(
      'Influenced by [RoCk](/tags/rock/) music.',
    );
  });

  it('should handle only one instance of the same related genre', () => {
    const self = 'pop';
    const desc = 'Rock is good. Rock is life.';
    const related = ['rock'];

    expect(injectRelatedGenres(self, desc, related)).toBe(
      '[Rock](/tags/rock/) is good. Rock is life.',
    );
  });

  it('should handle overlapping related genres (Longest Wins)', () => {
    const self = 'music';
    const desc = 'I like post-rock music.';
    // 'post-rock' overlaps 'rock'. 'post-rock' is longer.
    const related = ['rock', 'post-rock'];

    expect(injectRelatedGenres(self, desc, related)).toBe(
      'I like [post-rock](/tags/post-rock/) music.',
    );
  });
});
