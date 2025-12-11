import { z } from "astro/zod";
import { nonEmptyString } from "../schemata";
import { loadEnv } from "vite";

const rawEnvironment = loadEnv(process.env.NODE_ENV!, process.cwd(), "");

const environmentSchema = z.object({
  DB: nonEmptyString,
  DB_PASSWORD: nonEmptyString,
  DB_USER: nonEmptyString,
  NODE_ENV: z.enum(["development", "production"]).optional(),
});

const environment = environmentSchema.parse(rawEnvironment);

export default environment;
