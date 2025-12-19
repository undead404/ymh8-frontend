import type { Loader, LoaderContext } from 'astro/loaders';

import getGraph from '../database/get-graph';
import makeGraph from '../graph';
import type { WeightedTagWithRelated } from '../schemata';

export default function graphLoader(): Loader {
  return {
    load: async (context: LoaderContext) => {
      context.logger.info('start');
      try {
        const tagsWithRelated = await getGraph();
        context.logger.info(`${tagsWithRelated.length} returned`);
        const graph = makeGraph(
          tagsWithRelated as WeightedTagWithRelated[],
          context.logger,
        );
        context.store.set({
          id: 'music-universe',
          data: graph,
          digest: context.generateDigest(graph),
        });
      } catch (error) {
        context.logger.error(`${error as Error}`);
        throw error;
      }
    },
    name: 'graph-loader',
  };
}
