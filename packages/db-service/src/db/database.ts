import { Knex } from "knex";
import allowedDbTypes from "../constants/allowedDbTypes";

export function getDbConfig(
  dbType: string,
  connectionString: string
): Knex.Config {
  if (!allowedDbTypes.includes(dbType)) {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
  //Handle SQLite separately so we use filename instead of connectionString
  if (dbType === "sqlite") {
    return {
      client: "sqlite3",
      connection: {
        filename: connectionString,
      },
      useNullAsDefault: true,
    };
  }

  return {
    client: dbType,
    connection: {
      connectionString,
    },
    useNullAsDefault: true,
  };
}
