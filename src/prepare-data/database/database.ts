import type { SqlStatement } from "@nearform/sql";
import { z } from "astro/zod";
import { Pool, type PoolClient, type PoolConfig, type QueryResult } from "pg";
import environment from "../environment";
import { writeFile } from "node:fs/promises";

export class Database {
  client: PoolClient | null = null;
  pool: Pool;
  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
    console.log("Database initialized");
  }

  async init() {
    this.client = await this.pool.connect();
  }

  private async query(sql: string | SqlStatement, parameters?: unknown[]) {
    if (!this.client) {
      throw new Error("Database client is not initialized. Call init() first.");
    }
    // console.log("query");
    const result = await this.client.query<
      QueryResult<Record<string, unknown>>,
      unknown[]
    >(sql, parameters);
    // console.log("query success");
    return result;
  }

  async queryOne<T>(
    schema: z.Schema<T>,
    sql: string | SqlStatement,
    parameters?: unknown[]
  ): Promise<T | null> {
    const result = await this.query(sql, parameters);
    if (result.rows.length === 0) {
      return null;
    }
    if (result.rows.length > 1) {
      throw new Error("Too many rows returned.");
    }
    return schema.parse(result.rows[0]);
  }

  async queryMany<T>(
    schema: z.Schema<T>,
    sql: string | SqlStatement,
    parameters?: unknown[]
  ): Promise<T[]> {
    // console.log("queryMany");
    const result = await this.query(sql, parameters);
    // await writeFile("./data.json", JSON.stringify(result.rows, null, 2));
    // console.log("parsing...");
    const parsed = z.array(schema).parse(result.rows);
    // console.log("parsing success");
    return parsed;
  }

  async update(
    sql: string | SqlStatement,
    parameters?: unknown[],
    enforceImpact: boolean = true
  ): Promise<void> {
    console.log("UPDATE", sql);
    const result = await this.query(sql, parameters);
    if (result.rows.length > 0) {
      throw new Error("Update query unexpectedly returned some data");
    }
    if (enforceImpact && result.rowCount === 0) {
      throw new Error("Zero rows affected");
    }
  }
}

export const database = new Database({
  database: environment.DB,
  password: environment.DB_PASSWORD,
  user: environment.DB_USER,
});

await database.init();
