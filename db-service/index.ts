import Elysia, { t } from "elysia";
import { elysiaErrorHandler, handleError } from "./helpers/errorHandler";
import {
  getDatabase,
  initialiseDatabase,
  isDatabaseConfigured,
} from "./helpers/db";
import {
  getModelClass,
  ModelNameSchema,
  OperationNameSchema,
} from "./helpers/models";
import UserModel from "./models/UserModel";
import { transaction } from "./helpers/transaction";
import serviceConfigRoutes from "./routes/service-config";
import { checkEnvVars } from "./helpers/checkEnvVars";
import { COLOURS } from "./helpers/colours";
import { getRuntimeConfig, setRuntimeConfig } from "./helpers/config";

let app: Elysia;

//Adds all the non-config routes. Separate so we can ensure they're only accessible after the database is configured
async function setupDatabaseRoutes() {
  const db = getDatabase();
  if (!db) {
    return handleError(new Error("Database not configured"));
  }

  app
    //Used by other services to check connection
    .get("/ping", () => ({ message: "pong" }))
    //Used for any non-transaction queries
    .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
    .post(
      "/query",
      async ({ body, set }) => {
        const { model, operation, params } = body;

        const modelClass = getModelClass(model);

        if (!modelClass) {
          throw new Error("Model not found");
        }

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
              throw new Error("Call to getUserByEmail on non-user model");
            }
            return await modelClass.getByEmail(params.email);
          default:
            throw new Error("Unknown Operation");
        }
      },
      {
        body: t.Object({
          model: ModelNameSchema,
          operation: OperationNameSchema,
          params: t.Any({ default: {} }),
        }),
      }
    )
    .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
    .post(
      //Used for transactions
      "/transaction",
      async ({ body }) => {
        const { operations } = body;

        return await transaction(operations);
      },
      {
        body: t.Object({
          operations: t.Array(
            t.Object({
              order: t.Number(),
              model: ModelNameSchema,
              operation: OperationNameSchema,
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

//Sets up the service config routes
export async function setupConfigRoutes() {
  app = new Elysia().use((app) =>
    serviceConfigRoutes(app, setupDatabaseRoutes)
  );
}

//Starts the service

export async function startService() {
  //Ensure the environment variables are valid
  checkEnvVars();

  //Setup the service config routes
  await setupConfigRoutes();

  //Initialise the database if the env vars are set
  if (process.env.DATABASE_TYPE && process.env.DATABASE_CONNECTION_STRING) {
    await setRuntimeConfig(
      process.env.DATABASE_TYPE,
      process.env.DATABASE_CONNECTION_STRING
    );
    await initialiseDatabase(
      process.env.DATABASE_TYPE,
      process.env.DATABASE_CONNECTION_STRING
    );
  }
  //Check if the database is configued, and setup the database routes if it is
  if (isDatabaseConfigured()) {
    await setupDatabaseRoutes();
  }

  app.listen(process.env.PORT || 5160, (server) => {
    console.log(
      `${COLOURS.green}Database Service Started on ${COLOURS.magenta}${
        server.url
      }${COLOURS.reset}\n${
        isDatabaseConfigured()
          ? `${COLOURS.green}Database is configured with type ${
              COLOURS.magenta
            }${getRuntimeConfig().dbType}${COLOURS.reset}`
          : `${COLOURS.yellow}Awaiting configuration.\nSend a ${COLOURS.cyan}POST${COLOURS.yellow} request to ${COLOURS.magenta}${server.url}service-config/init${COLOURS.yellow} with ${COLOURS.cyan}dbType${COLOURS.yellow} and ${COLOURS.cyan}connectionString${COLOURS.yellow} in the body.\nAllowed types are ${COLOURS.magenta}sqlite, postgres, sqlserver, oracledb.${COLOURS.yellow}\nIf using ${COLOURS.magenta}SQLite${COLOURS.yellow}, connectionString should be the filepath for the sqlite file.${COLOURS.reset}`
      }`
    );
  });
}

startService();
