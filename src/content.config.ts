import { defineCollection } from 'astro:content';

import graphLoader from './loaders/graph';
import tagsIndexLoader from './loaders/tags-index';
import topReleasesLoader from './loaders/top-releases';
import {
  fullAlbumSchema,
  musicUniverseGraphSchema,
  tagsIndexItemSchema,
} from './schemata';

const tagsGraph = defineCollection({
  loader: graphLoader(),
  schema: musicUniverseGraphSchema,
});

const topReleases = defineCollection({
  loader: topReleasesLoader(),
  schema: fullAlbumSchema,
});

const tagsIndex = defineCollection({
  loader: tagsIndexLoader(),
  schema: tagsIndexItemSchema,
});

export const collections = {
  tagsIndex,
  tagsGraph,
  topReleases,
};
