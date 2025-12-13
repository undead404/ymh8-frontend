import path from "node:path";

import { writeFile } from "node:fs/promises";
import environment from "./environment";
import getTopReleases from "./database/get-top-releases";

const TOP_RELEASES_DIRECTORY = "src/data/top-releases";

const topReleases = await getTopReleases();

await Promise.all(
  topReleases.map(async (topRelease, index) => {
    await writeFile(
      path.join(TOP_RELEASES_DIRECTORY, `${index + 1}.json`),
      JSON.stringify(
        topRelease,
        null,
        environment.NODE_ENV === "development" ? 2 : undefined
      )
    );
  })
);
process.exit(0);
