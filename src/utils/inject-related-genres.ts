import slugify from './slugify';

function getGenreEndIndex(startIndex: number, genre: string) {
  return startIndex + genre.length;
}

/**
 * Injects Markdown links to related genres
 * @param self The current genre
 * @param description The current genre's textual description
 * @param relatedGenres The current genre's related genres; for pop those may be: hyperpop, rock, sunshine, pop rock etc
 * @returns The description with related genres' markdown links inserted
 *
 * @example
 * injectRelatedGenres('pop', 'Pop is related to rock and is known for its hyperpop and sunshine pop subgenres', ['hyperpop', 'rock', 'sunshine pop'])
 * Would return:
 * 'Pop is related to [rock](/tags/rock/) and is known for its [hyperpop](/tags/hyperpop/) and [sunshine pop](/tags/sunshine-pop/) subgenres'
 */
export default function injectRelatedGenres(
  self: string,
  description: string,
  relatedGenres: string[],
) {
  //   console.log(self, description, relatedGenres);
  const lowercasedDescription = description.toLowerCase();
  const sortedGenres = relatedGenres.toSorted(
    // longer to shorter
    (a, b) => b.length - a.length,
  );
  const occurrences = new Map<string, number>();

  function hasOverlap(startIndex: number, genre: string) {
    const endIndex = getGenreEndIndex(startIndex, genre);
    return occurrences.entries().some(([otherGenre, otherStartIndex]) => {
      const otherEndIndex = getGenreEndIndex(otherStartIndex, otherGenre);
      if (endIndex < otherStartIndex) {
        return false;
      }
      if (startIndex > otherEndIndex) {
        return false;
      }
      return true;
    });
  }
  // Self-genre put first as it usually comes first in the description.
  for (const genre of [self, ...sortedGenres]) {
    let genreStartIndex = lowercasedDescription.indexOf(genre);
    // Find the first occurrence that doesn't overlap with higher-priority (longer) matches
    while (genreStartIndex !== -1 && hasOverlap(genreStartIndex, genre)) {
      genreStartIndex = lowercasedDescription.indexOf(
        genre,
        genreStartIndex + genre.length,
      );
    }
    // If a valid spot is found, claim it.
    if (genreStartIndex !== -1) {
      occurrences.set(genre, genreStartIndex);
    }
  }
  const adjustments = [...occurrences.entries()].toSorted(
    // first adjustments first
    ([, genre1StartIndex], [, genre2StartIndex]) =>
      genre1StartIndex - genre2StartIndex,
  );
  let alteredDescription = description;
  for (const [genre, genreStartIndex] of adjustments) {
    if (genre === self) {
      continue;
    }
    const indexAdjustment = alteredDescription.length - description.length;
    const genreEndIndex = getGenreEndIndex(genreStartIndex, genre);
    alteredDescription =
      alteredDescription.slice(0, genreStartIndex + indexAdjustment) +
      `[${alteredDescription.slice(genreStartIndex + indexAdjustment, genreEndIndex + indexAdjustment)}](/tags/${slugify(genre)}/)` +
      alteredDescription.slice(genreEndIndex + indexAdjustment);
  }
  //   console.log(alteredDescription);
  return alteredDescription;
}
