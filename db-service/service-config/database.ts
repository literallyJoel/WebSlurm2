import { Knex } from "knex";

export function getDbConfig(
  dbType: string,
  connectionString: string
): Knex.Config {
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
