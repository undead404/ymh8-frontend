import { z } from "astro/zod";
import readJsonFilesFromDirectory from "./read-json-files-from-directory";
import { weightedTagWithRelatedSchema } from "../schemata";

const TARGET_FOLDER = "./src/data/tags";

export default async function readData() {
  const dataItems = await readJsonFilesFromDirectory(TARGET_FOLDER);
  const tags = z.array(weightedTagWithRelatedSchema).parse(dataItems);
  return tags;
}
