import type { Loader, LoaderContext } from "astro/loaders";

import getTagLists from "../database/get-tag-lists";
import slugify from "../utils/slugify";

export default function tagListsLoader(): Loader {
  return {
    load: async (context: LoaderContext) => {
      context.logger.info("start");
      try {
        const tags = await getTagLists();
        context.logger.info(`${tags.length} items returned`);
        let latestUpdatedAt = new Date(0);
        for (const record of tags) {
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
    name: "tag-lists-loader",
  };
}
