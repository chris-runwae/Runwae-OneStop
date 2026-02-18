import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/runwae",
  max: 10,
});

/**
 * Drizzle DB instance with schema for typed queries.
 * Use `db` in routes for select/insert/update/delete.
 */
export const db = drizzle(pool, { schema });
export { schema };
