import { Elysia, t } from "elysia";

import { getRuntimeConfig, setRuntimeConfig } from "../helpers/config";
import { getDatabase, initialiseDatabase } from "../helpers/db";
import { restart } from "../helpers/misc";
import { COLOURS } from "../helpers/colours";

export function configRoutes(app: Elysia, onDatabaseConfigured: () => void) {
  return (
    app
      //Used to configure the database during first time setup
      .group("/config", (app) =>
        app
          .post(
            "/init",
            async ({ body, set }) => {
              //Grab the current config
              const currentConfig = getRuntimeConfig();
              //Bad request if the config is already set. We'll have a separate update function for this to avoid accidentally overwriting the config
              if (
                currentConfig.dbType !== undefined &&
                currentConfig.connectionString !== undefined
              ) {
                set.status = 400;
                return "Database already configured";
              }

              setRuntimeConfig(body.dbType, body.connectionString);
              //Initialise the database
              try {
                await initialiseDatabase(body.dbType, body.connectionString);
                set.status = 200;
                onDatabaseConfigured();
                console.log(
                  `${COLOURS.blue}Database cofigured with type ${COLOURS.magenta}${body.dbType}${COLOURS.blue}. ${COLOURS.yellow}Restarting...${COLOURS.reset}`
                );
                restart();
              } catch (e) {
                set.status = 500;
                console.error("Failed to initialise database: ", e);
                return "Internal Server Error";
              }
            },
            {
              body: t.Object({
                dbType: t.Union([
                  t.Literal("sqlite"),
                  t.Literal("mysql"),
                  t.Literal("postgres"),
                  t.Literal("sqlserver"),
                  t.Literal("oracledb"),
                ]),
                connectionString: t.String(),
              }),
            }
          )
          //Returns a simple status message
          .get("/status", () => {
            const db = getDatabase();
            //If the db object isn't null, the database is configured
            if (db) {
              return "Database is configured and database service is running";
            }

            //Otherwise we assume it's waiting for the config request
            return "Awaiting configuration request. Send a POST request to /configure with dbType and connectionString in the body. Support types are sqlite, mysql, postgres, sqlserver, oracledb. If using SQLite, connectionString should be the filepath for the sqlite file.";
          })
          //Returns details of the current database configuration
          .get("/config", () => {
            const db = getDatabase();
            const config = getRuntimeConfig();
            return {
              databaseCofigured: !!db,
              dbType: config.dbType,
              connectionString: config.connectionString ? "****" : undefined,
            };
          })
          .get("/type", () => {
            return { type: getRuntimeConfig().dbType };
          })
      )
  );
}
