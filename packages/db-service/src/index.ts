import Elysia, { t } from "elysia";
import { COLOURS, elysiaErrorHandler } from "@webslurm2/shared";
import {
  getDatabase,
  initialiseDatabase,
  isDatabaseConfigured,
} from "./helpers/db";
import { getModelClass } from "./helpers/models";
import { ModelNameSchema, OperationNameSchema } from "@webslurm2/shared";
import UserModel from "./models/UserModel";
import transaction from "./helpers/transaction";
import serviceConfigRoutes from "./routes/service-config";

import { checkEnvVars } from "./helpers/checkEnvVars";
import { setRuntimeConfig } from "./helpers/config";
import allowedDbTypes from "./constants/allowedDbTypes";

checkEnvVars();

if (process.env.DATABASE_TYPE && process.env.DATABASE_CONNECTION_STRING) {
  setRuntimeConfig(
    process.env.DATABASE_TYPE,
    process.env.DATABASE_CONNECTION_STRING
  );
  initialiseDatabase(
    process.env.DATABASE_TYPE,
    process.env.DATABASE_CONNECTION_STRING
  );
}

//exported for tests
export const app = new Elysia()
  .use((app) => serviceConfigRoutes(app))
  .get("/ping", () => ({ message: "pong" }))
  .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
  .post(
    "/query",
    async ({ body }) => {
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
  )
  .guard({
    beforeHandle: async ({ set }) => {
      const db = getDatabase();
      if (!db) {
        set.status = 503;
        return { error: "Database not configured", code: 503 };
      }
    },
  })
  .listen(
    process.env.PORT ? Number.parseInt(process.env.PORT) : 5160,
    (server) => {
      console.log(
        `${COLOURS.green}DatabaseService running on ${COLOURS.magenta}${server.url}${COLOURS.reset}`
      );
      if (!isDatabaseConfigured()) {
        console.log(
          `${COLOURS.yellow}Database not configured. Awaiting initialisation...${COLOURS.reset}`
        );
        console.log(
          `${COLOURS.yellow}Send a POST request to ${COLOURS.magenta}/service-config/init${COLOURS.yellow} with the following body:${COLOURS.reset}`
        );
        console.log(
          `${COLOURS.magenta}dbType:  ${COLOURS.blue}(${allowedDbTypes.join(
            ", "
          )})${COLOURS.reset}`
        );
        console.log(
          `${COLOURS.magenta}connectionString: ${COLOURS.blue}(if using sqlite provide a path to the db file here)${COLOURS.reset}`
        );
      }
    }
  );
