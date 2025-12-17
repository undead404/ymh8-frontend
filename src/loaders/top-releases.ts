import type { Loader, LoaderContext } from "astro/loaders";

import getTopReleases from "../database/get-top-releases";

export default function topReleasesLoader(): Loader {
  return {
    load: async (context: LoaderContext) => {
      context.logger.info("start");
      try {
        const topReleases = await getTopReleases();
        context.logger.info(`${topReleases.length} items returned`);
        let latestUpdatedAt = new Date(0);
        for (const record of topReleases) {
          context.store.set({
            data: record as any,
            digest: context.generateDigest(record as any),
            id: `${record.artist} - ${record.name}`,
          });
          if (
            record.statsUpdatedAt &&
            latestUpdatedAt < record.statsUpdatedAt
          ) {
            latestUpdatedAt = record.statsUpdatedAt;
          }
        }
        context.meta.set("lastModified", latestUpdatedAt.toISOString());
      } catch (error) {
        context.logger.error(`${error}`);
        throw error;
      }
    },
    name: "top-releases-loader",
  };
}
