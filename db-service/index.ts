import Elysia, { t } from "elysia";
import { serviceConfigRoutes } from "./routes/service-config";
import {
  getDatabase,
  initialiseDatabase,
  isDatabaseConfigured,
} from "./helpers/db";
import { getRuntimeConfig } from "./helpers/config";

import { getModelClass } from "./helpers/models";
import UserModel from "./models/UserModel";
import { COLOURS } from "./helpers/colours";
import { transaction } from "./helpers/transaction";
import { handleError, ErrorType } from "./helpers/errorHandler";

let app: Elysia;

//Adds all non-config routes
async function setupDatabaseRoutes() {
  const db = getDatabase();
  if (!db) {
    console.error("Database not initialised");
    return;
  }

  app
    .get("/ping", () => ({
      message: "pong",
    }))
    .post(
      "/query",
      async ({ body, set }) => {
        const { model, operation, params } = body;

        const modelClass = getModelClass(model);

        if (!modelClass) {
          const { error, status } = handleError(
            new Error(ErrorType.BAD_REQUEST)
          );
          set.status = status;
          return { error };
        }

        try {
          switch (operation) {
            case "getOne":
              return await modelClass.getOne(params);
            case "getMany":
              return await modelClass.getMany(params);
            case "getAll":
              return await modelClass.getAll();
            case "create":
              return await modelClass.create(params);
            case "update":
              return await modelClass.update(params);
            case "delete":
              return await modelClass.delete(params);
            case "getUserByEmail":
              if (!(modelClass instanceof UserModel)) {
                throw new Error(ErrorType.BAD_REQUEST);
              }
              return await modelClass.getUserByEmail(params.email);
            default:
              throw new Error(ErrorType.BAD_REQUEST);
          }
        } catch (error) {
          const { error: errorMessage, status } = handleError(error);
          set.status = status;
          return { error: errorMessage };
        }
      },
      {
        body: t.Object({
          model: t.Union([
            t.Literal("user"),
            t.Literal("organisation"),
            t.Literal("organisationMember"),
            t.Literal("config"),
          ]),
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
    )
    .post(
      "/transaction",
      async ({ body, set }) => {
        const { operations } = body;
        try {
          return await transaction(operations);
        } catch (error) {
          const { error: errorMessage, status } = handleError(error);
          set.status = status;
          return { error: errorMessage };
        }
      },
      {
        body: t.Object({
          operations: t.Array(
            t.Object({
              order: t.Number(),
              model: t.Union([
                t.Literal("user"),
                t.Literal("organisation"),
                t.Literal("organisationMember"),
                t.Literal("config"),
              ]),
              operation: t.Union([
                t.Literal("getOne"),
                t.Literal("getMany"),
                t.Literal("getAll"),
                t.Literal("create"),
                t.Literal("update"),
                t.Literal("delete"),
                t.Literal("getUserByEmail"),
              ]),
              params: t.Union([
                t.Any(),
                t.Object({
                  $ref: t.String(),
                  field: t.String(),
                }),
              ]),
              resultKey: t.Optional(t.String()),
              return: t.Optional(t.Array(t.String())),
            })
          ),
        }),
      }
    );
}

async function setupConfigRoutes() {
  app = new Elysia().use((app) =>
    serviceConfigRoutes(app, setupDatabaseRoutes)
  );
}

export async function startServer() {
  const dbType = process.env.DATABASE_TYPE;
  const allowedTypes = ["sqlite", "postgres", "sqlserver", "oracledb"];
  if (dbType && !allowedTypes.includes(dbType)) {
    console.error(
      "Invalid database type. Allowed types are sqlite, postgres, sqlserver, oracledb"
    );
    process.exit(1);
  }

  await setupConfigRoutes();

  if (dbType && process.env.DATABASE_CONNECTION_STRING) {
    await initialiseDatabase(dbType, process.env.DATABASE_CONNECTION_STRING);
  }

  if (isDatabaseConfigured()) {
    await setupDatabaseRoutes();
  }


  app.listen(process.env.DB_SERVICE_PORT || 5160, (server) => {
    console.log(
      `${COLOURS.green}Database Service Started on ${COLOURS.magenta}${
        server.url
      }${COLOURS.reset}\n${
        isDatabaseConfigured()
          ? `${COLOURS.green}Database is configured with type ${
              COLOURS.magenta
            }${getRuntimeConfig().dbType}${COLOURS.reset}`
          : `${COLOURS.yellow}Awaiting configuration.\nSend a POST request to ${server.url}service-config/init with dbType and connectionString in the body.\nAllowed types are sqlite, postgres, sqlserver, oracledb.\nIf using SQLite, connectionString should be the filepath for the sqlite file.${COLOURS.reset}`
      }`
    );
  });
}

startServer();
