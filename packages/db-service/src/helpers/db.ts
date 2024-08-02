import Knex, { type Knex as TKnex } from "knex";
import { getDbConfig } from "../db/database";
import path from "path";
import fs from "node:fs/promises";
import { createSchema } from "../db/schema";
import { COLOURS } from "@webslurm2/shared";
import allowedDbTypes from "../constants/allowedDbTypes";

let db: TKnex | null = null;

export async function initialiseDatabase(
  dbType: string,
  connectionString: string
) {
  if (!allowedDbTypes.includes(dbType)) {
    throw new Error(`Invalid database type provided: ${dbType}`);
  }
  console.log(
    `${COLOURS.blue}Intialising database of type: ${COLOURS.magenta}${dbType}${COLOURS.reset}`
  );
  if (dbType === "sqlite" && connectionString !== ":memory:") {
    const dbPath = path.resolve(connectionString);
    if (!(await Bun.file(dbPath).exists())) {
      console.log(
        `${COLOURS.blue}Database not found, creating...${COLOURS.reset}`
      );
      const filepath = path.dirname(dbPath);
      await fs.mkdir(filepath, { recursive: true });
      await Bun.write(dbPath, "");
    }
  }

  const _db = setDatabase(Knex(getDbConfig(dbType, connectionString)));

  const isTest = process.env.NODE_ENV === "test" && dbType === "postgres";
  try {
    if (!isTest) {
      await _db!.raw("SELECT 1");
      console.log(
        `${COLOURS.green}Database connection successful${COLOURS.reset}`
      );
      await createSchema(_db!);
    }
  } catch (e) {
    setDatabase(null);
    throw e;
  }
}

export function setDatabase(_db: TKnex<any, any[]> | null) {
  db = _db;
  return _db;
}

export function getDatabase() {
  return db;
}

export function isDatabaseConfigured() {
  return db !== null;
}
