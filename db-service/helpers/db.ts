import Knex, { type Knex as TKnex } from "knex";
import { getDbConfig } from "../service-config/database";
import path from "path";
import { createSchema } from "../service-config/schema";
import { COLOURS } from "./colours";
import { handleError } from "./errorHandler";

let db: TKnex | null = null;

export async function initialiseDatabase(
  dbType: string,
  connectionString: string
) {
  console.log(
    `${COLOURS.blue}Intialising database of type: ${COLOURS.magenta}${dbType}${COLOURS.reset}`
  );
  if (dbType === "sqlite") {
    const dbPath = path.resolve(connectionString);
    if (!(await Bun.file(dbPath).exists())) {
      console.log(
        `${COLOURS.blue}Database not found, creating...${COLOURS.reset}`
      );
      await Bun.write(dbPath, "");
    }
  }

  db = Knex(getDbConfig(dbType, connectionString));

  try {
    await db.raw("SELECT 1");
    console.log(
      `${COLOURS.green}Database connection successful${COLOURS.reset}`
    );
    await createSchema(db);
  } catch (e) {
    handleError(`Failed to connect to database: ${e}`);
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
