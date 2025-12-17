function getGenreEndIndex(startIndex: number, genre: string) {
  return startIndex + genre.length;
}

export default function injectRelatedGenres(
  self: string,
  description: string,
  relatedGenres: string[]
) {
  const sortedGenres = [self, ...relatedGenres].toSorted(
    // longer to shorter
    (a, b) => b.length - a.length
  );
  const occurences = new Map<string, number>();

  function hasOverlap(startIndex: number, genre: string) {
    const endIndex = getGenreEndIndex(startIndex, genre);
    return occurences.entries().some(([otherGenre, otherStartIndex]) => {
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
  for (const genre of sortedGenres) {
    const genreStartIndex = description.indexOf(genre);
  }
}
