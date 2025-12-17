import { writeFile } from 'node:fs/promises';

import { loadEnv } from 'vite';

import getTopReleases from './database/get-top-releases';

process.env = loadEnv(process.env.NODE_ENV!, process.cwd(), '');

const result = await getTopReleases();

await writeFile('result.json', JSON.stringify(result));
