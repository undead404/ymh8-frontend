import { z } from 'astro/zod';

export const nonEmptyString = z.string().nonempty().max(1023);

export const bareTagSchema = z.object({
  name: nonEmptyString,
});

export interface WeightedTag {
  name: string;
  weight: number;
}

export interface WeightedTagWithRelated extends WeightedTag {
  related: WeightedTag[];
}

export const musicUniverseGraphSchema = z.object({
  links: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      weight: z.number(),
    }),
  ),
  nodes: z.array(
    z.object({
      color: z.string(),
      community: z.number(),
      id: z.string(),
      label: z.string(),
      originalPopularity: z.number(),
      size: z.number(),
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
  ),
});

export type MusicUniverseGraph = z.infer<typeof musicUniverseGraphSchema>;

export const dateString = z
  .string()
  .regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/)
  .transform((value) => {
    // console.log(value);
    let valueToChange = value;
    while (valueToChange.endsWith('-00')) {
      // console.log(valueToChange);
      valueToChange = valueToChange.slice(0, -3);
    }
    return valueToChange;
  });

export const albumPlaceSchema = z.object({
  place: z.number().min(1).max(100),
  tagName: nonEmptyString,
});

export type AlbumPlace = z.infer<typeof albumPlaceSchema>;

export interface BareAlbum {
  artist: string;
  name: string;
}

export const albumTagSchema = z.object({
  count: z.number().min(1).max(100),
  tagName: nonEmptyString,
});

export type AlbumTag = z.infer<typeof albumTagSchema>;

export const weightedAlbumSchema = z.object({
  artist: nonEmptyString,
  cover: z.string().url().nullable(),
  date: dateString.nullable(),
  name: nonEmptyString,
  statsUpdatedAt: z.string().datetime().nullable(),
  thumbnail: z.string().url().nullable(),
  weight: z.number(),
});

export type WeightedAlbum = z.infer<typeof weightedAlbumSchema>;

export const fullAlbumSchema = weightedAlbumSchema.extend({
  place: z.number().min(1).max(100),
  places: z.array(albumPlaceSchema),
  tags: z.array(albumTagSchema),
});

export type FullAlbum = z.infer<typeof fullAlbumSchema>;

export interface FullTag extends WeightedTag {
  albumsScrapedAt: string;
  description: null | string;
  listUpdatedAt: string;
}

export const tagsIndexItemSchema = bareTagSchema.extend({
  albumsScrapedAt: z.string().datetime(),
  description: z.string().nullable(),
  listUpdatedAt: z.string().datetime(),
  weight: z.number(),
});

export type TagsIndexItem = z.infer<typeof tagsIndexItemSchema>;

export interface Logger {
  info: (message: string) => void;
}
