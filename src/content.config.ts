import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import {
  fullAlbumSchema,
  fullTagSchema,
  musicUniverseGraphSchema,
} from "./schemata";

const tags = defineCollection({
  loader: glob({
    base: "./src/data/tags",
    pattern: "*.json",
  }),
  schema: z.object({
    name: z.string(),
    related: z.array(
      z.object({
        name: z.string(),
        weight: z.number(),
      })
    ),
    weight: z.number(),
  }),
});

const tagsGraph = defineCollection({
  loader: glob({ base: "./src/data/graph", pattern: "*.json" }),
  schema: musicUniverseGraphSchema,
});

const topReleases = defineCollection({
  loader: glob({ base: "./src/data/top-releases", pattern: "*.json" }),
  schema: fullAlbumSchema,
});

const tagLists = defineCollection({
  loader: glob({ base: "./src/data/tag-lists", pattern: "*.json" }),
  schema: fullTagSchema.extend({
    list: z.array(fullAlbumSchema),
  }),
});

export const collections = { tagLists, tags, tagsGraph, topReleases };
