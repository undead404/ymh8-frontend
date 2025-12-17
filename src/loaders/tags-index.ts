import type { Loader, LoaderContext } from "astro/loaders";

import getTagsIndex from "../database/get-tags-index";
import slugify from "../utils/slugify";

export default function tagsIndexLoader(): Loader {
  return {
    load: async (context: LoaderContext) => {
      context.logger.info("start");
      try {
        const data = await getTagsIndex();
        context.logger.info(`${data.length} items returned`);
        let latestUpdatedAt = new Date(0);
        for (const record of data) {
          if (!record.listUpdatedAt) {
            throw new Error("A list with no listUpdatedAt found");
          }
          context.store.set({
            data: record,
            digest: context.generateDigest(record),
            id: slugify(record.name),
          });
          if (latestUpdatedAt < record.listUpdatedAt) {
            latestUpdatedAt = record.listUpdatedAt;
          }
        }
        context.meta.set("lastModified", latestUpdatedAt.toISOString());
      } catch (error) {
        context.logger.error(`${error}`);
        throw error;
      }
    },
    name: "tags-index-loader",
  };
}
