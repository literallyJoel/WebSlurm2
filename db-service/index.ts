import Elysia, { t } from "elysia";
import { configRoutes } from "./routes/config";
import {
  getDatabase,
  initialiseDatabase,
  isDatabaseConfigured,
} from "./helpers/db";
import { getRuntimeConfig } from "./helpers/config";

import { getModelClass } from "./helpers/models";
import UserModel from "./models/UserModel";

let app: Elysia;

//Adds all non-config routes
function setupDatabaseRoutes() {
  const db = getDatabase();
  if (!db) {
    console.error("Database not initialised");
    return;
  }

  app
    .post("/test", () => "yeet")
    .post(
      "/query",
      async ({ body, set }) => {
        const { model, operation, params } = body;

        const modelClass = getModelClass(model);

        if (!modelClass) {
          set.status = 400;
          return "Bad Request";
        }

        switch (operation) {
          case "getOne": {
            const result = await modelClass.getOne(params);
            if ("error" in result && result.error === "Record not found") {
              set.status = 404;
              return "Record not found";
            }
            return result;
          }
          case "getMany": {
            const result = await modelClass.getMany(params);
            if ("error" in result && result.error === "No records found") {
              set.status = 404;
              return "No records found";
            }
            return result;
          }
          case "getAll": {
            const result = await modelClass.getAll();
            if ("error" in result && result.error === "No records found") {
              set.status = 404;
              return "No records found";
            }
            return result;
          }
          case "create":
            return await modelClass.create(params);
          case "update":
            return await modelClass.update(params);
          case "delete":
            return await modelClass.delete(params);
          //This is specific to the user model, but is common enough it makese sense to include it here.
          case "getUserByEmail":
            if (!(modelClass instanceof UserModel)) {
              set.status = 400;
              return "Bad Request";
            }
            return await modelClass.getUserByEmail(params.email);
          default:
            set.status = 400;
            return "Bad Request";
        }
      },
      {
        body: t.Object({
          model: t.Union([t.Literal("user")]),
          operation: t.Union([
            t.Literal("getOne"),
            t.Literal("getMany"),
            t.Literal("getAll"),
            t.Literal("create"),
            t.Literal("update"),
            t.Literal("delete"),
            t.Literal("getUserByEmail"),
          ]),
          params: t.Any({ default: {} }),
        }),
      }
    );
}
/*
Adds the db configuration routes. Added prior to all
other routes so we can ensure the databasee is configured
before any other requests are made.
*/
function setupConfigRoutes() {
  app = new Elysia().use((app) => configRoutes(app, setupDatabaseRoutes));
}

export async function startServer() {
  //If the database type is set, we check it's valid
  const dbType = process.env.DATABASE_TYPE;
  const allowedTypes = ["sqlite", "postgres", "sqlserver", "oracledb"];
  if (dbType && !allowedTypes.includes(dbType)) {
    console.error(
      "Invalid database type. Allowed types are sqlite, postgres, sqlserver, oracledb"
    );
    process.exit(1);
  }

  //Setup the config routes
  setupConfigRoutes();
  //Initialise the database if the environment variables are set
  if (dbType && process.env.DATABASE_CONNECTION_STRING) {
    await initialiseDatabase(dbType, process.env.DATABASE_CONNECTION_STRING);
  }

  if (isDatabaseConfigured()) {
    setupDatabaseRoutes();
  }

  app.listen(process.env.DB_SERVICE_PORT || 5160);
  console.log(
    `Database Service Started on ${app.server?.url}. ${
      isDatabaseConfigured()
        ? `Database is configured with type ${getRuntimeConfig().dbType}.`
        : `Awaiting configuration.\nSend a POST request to ${app.server?.url}config/init with dbType and connectionString in the body.\nAllowed types are sqlite, postgres, sqlserver, oracledb.\nIf using SQLite, connectionString should be the filepath for the sqlite file.`
    }`
  );
}

startServer();
