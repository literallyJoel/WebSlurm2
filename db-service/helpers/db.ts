import Knex, { type Knex as TKnex } from "knex";
import { getDbConfig } from "../config/database";
import path from "path";
import { createSchema } from "../config/schema";

let db: TKnex | null = null;

export async function initialiseDatabase(
  dbType: string,
  connectionString: string
) {
  console.log("Intialising database of type", dbType);
  if (dbType === "sqlite") {
    const dbPath = path.resolve(connectionString);
    if (!(await Bun.file(dbPath).exists())) {
      console.log("Database not found, creating...");
      await Bun.write(dbPath, "");
    }
  }

  db = Knex(getDbConfig(dbType, connectionString));

  try {
    await db.raw("SELECT 1");
    console.log("Database connection successful");
    await createSchema(db);
  } catch (e) {
    console.error("Failed to connect to database", e);
    db = null;
    throw e;
  }
}

export function getDatabase() {
  return db;
}

export function isDatabaseConfigured() {
  return db !== null;
}
