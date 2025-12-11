import { z } from "astro/zod";
import { nonEmptyString } from "./schemata";

const environmentSchema = z.object({
  DB: nonEmptyString,
  DB_PASSWORD: nonEmptyString,
  DB_USER: nonEmptyString,
});

const environment = environmentSchema.parse(import.meta.env);

export default environment;
