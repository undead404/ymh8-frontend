import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from 'kysely-codegen';
import { Pool } from 'pg';

import environment from '../environment';

const database = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: environment.DB,
      password: environment.DB_PASSWORD,
      user: environment.DB_USER,
    }),
  }),
});

export default database;
