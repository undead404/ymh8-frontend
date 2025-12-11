import path from "node:path";

import { writeFile } from "node:fs/promises";
import environment from "./environment";
import getTagList from "./database/get-tag-list";
import getTags from "./database/get-tags";

const tags = await getTags();

const TAG_LISTS_DIRECTORY = "src/data/tag-lists";

for (const tag of tags) {
  const tagList = await getTagList(tag.name);
  await writeFile(
    path.join(TAG_LISTS_DIRECTORY, `${tag.name.replaceAll(" ", "-")}.json`),
    JSON.stringify(
      {
        list: tagList,
        slug: tag.name.replaceAll(" ", "-"),
        ...tag,
      },
      null,
      environment.NODE_ENV === "development" ? 2 : undefined
    )
  );
}
process.exit(0);
