import { promises as fs } from "fs";
import path from "path";

/**
 * Read all top-level (non-nested) .json files in a directory and return an array
 * containing the parsed contents of each file.
 *
 * - Only files directly inside dirPath are considered (no recursion).
 * - Filters by the .json extension (case-insensitive).
 * - Reads files in parallel.
 *
 * @param dirPath - Path to the directory containing JSON files.
 * @param options - Optional settings:
 *    - encoding: file encoding (default 'utf8')
 *    - ignoreInvalidJson: if true, files with invalid JSON are skipped instead of throwing (default false)
 * @returns Promise resolving to an array of parsed JSON values (one entry per JSON file).
 */
export async function readJsonFilesFromDirectory(
  dirPath: string,
  options?: { encoding?: BufferEncoding; ignoreInvalidJson?: boolean }
): Promise<any[]> {
  const { encoding = "utf8", ignoreInvalidJson = false } = options ?? {};

  // List directory entries and keep only files with .json extension
  const dirents = await fs.readdir(dirPath, { withFileTypes: true });
  const jsonFiles = dirents
    .filter((d) => d.isFile() && path.extname(d.name).toLowerCase() === ".json")
    .map((d) => path.join(dirPath, d.name));

  if (jsonFiles.length === 0) return [];

  // Read and parse all JSON files in parallel
  const readPromises = jsonFiles.map(async (filePath) => {
    const content = await fs.readFile(filePath, { encoding });
    try {
      return JSON.parse(content);
    } catch (err: any) {
      if (ignoreInvalidJson) {
        // Skip this file
        return null;
      }
      // Add file path context to the error
      throw new Error(
        `Failed to parse JSON in "${filePath}": ${err?.message ?? err}`
      );
    }
  });

  const results = await Promise.all(readPromises);
  // If skipping invalid JSON files, remove nulls
  return results.filter((r) => r !== null);
}

export default readJsonFilesFromDirectory;
