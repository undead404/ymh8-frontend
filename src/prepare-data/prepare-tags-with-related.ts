import path from "node:path";
import getRelatedTags from "./database/get-related-tags";

import { writeFile } from "node:fs/promises";
import environment from "./environment";
import getTags from "./database/get-tags";

const tags = await getTags();

const TAGS_DIRECTORY = "src/data/tags";

await Promise.all(
  tags.map(async (tag) => {
    const related = await getRelatedTags(tag.name);
    const targetPath = path.join(TAGS_DIRECTORY, `${tag.name}.json`);
    await writeFile(
      targetPath,
      JSON.stringify(
        {
          ...tag,
          related,
        },
        null,
        environment.NODE_ENV === "development" ? 2 : undefined
      )
    );
  })
);

process.exit(0);
