import SQL from "@nearform/sql";
import { database } from "./database";
import {
  weightedAlbumSchema,
  type AlbumPlace,
  type AlbumTag,
  type WeightedAlbum,
} from "../../schemata";
import getAlbumPlaces from "./get-album-places";
import getAlbumTags from "./get-album-tags";

interface EnhancedWeightedAlbum extends WeightedAlbum {
  place: number;
  places: AlbumPlace[];
  tags: AlbumTag[];
}

export default async function getTopReleases(): Promise<
  EnhancedWeightedAlbum[]
> {
  console.log("getTopReleases");
  const topReleases = await database.queryMany(
    weightedAlbumSchema,
    SQL`
        SELECT
            "artist",
            "cover",
            "date",
            "name",
            "thumbnail",
            (
                COALESCE("playcount", 0)::FLOAT
                / 1000
                * COALESCE("listeners", 0)
                / COALESCE(
                    CASE WHEN "Album"."numberOfTracks" = 0 THEN 1 ELSE "Album"."numberOfTracks" END,
                    (
                        SELECT AVG("numberOfTracks") FROM "Album" WHERE "numberOfTracks" IS NOT NULL
                    )
                )
            ) AS "weight"
        FROM "Album"
        WHERE "hidden" IS NOT TRUE
        ORDER BY "weight" DESC
        LIMIT 100
    `
  );
  const enhancedTopReleases: EnhancedWeightedAlbum[] = [];
  for (let i = 0; i < topReleases.length; i += 1) {
    const topRelease = topReleases[i];
    enhancedTopReleases.push({
      ...topRelease,
      place: i + 1,
      places: await getAlbumPlaces(topRelease),
      tags: await getAlbumTags(topRelease),
    });
  }
  return enhancedTopReleases;
}
