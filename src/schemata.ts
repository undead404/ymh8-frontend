import { z } from "astro/zod";

export const nonEmptyString = z.string().nonempty().max(1023);

export const weightedTagSchema = z.object({
  // id: nonEmptyString,
  name: nonEmptyString,
  weight: z.number(),
});

export const weightedTagWithRelatedSchema = weightedTagSchema.extend({
  related: z.array(weightedTagSchema),
});

export type WeightedTag = z.infer<typeof weightedTagSchema>;

export type WeightedTagWithRelated = z.infer<
  typeof weightedTagWithRelatedSchema
>;

export const musicUniverseGraphSchema = z.object({
  links: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      weight: z.number(),
    })
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
    })
  ),
});

export type MusicUniverseGraph = z.infer<typeof musicUniverseGraphSchema>;

export const dateString = z
  .string()
  .regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/)
  .transform((value) => {
    let valueToChange = value;
    while (valueToChange.endsWith("-00")) {
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

export const fullTagSchema = weightedTagSchema.extend({
  albumsScrapedAt: z.coerce.date(),
  description: z.string().nullable(),
  listUpdatedAt: z.coerce.date(),
});

export type FullTag = z.infer<typeof fullTagSchema>;
