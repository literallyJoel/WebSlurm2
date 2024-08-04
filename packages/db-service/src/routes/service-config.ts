import type Elysia from "elysia";
import { getRuntimeConfig, setRuntimeConfig } from "../helpers/config";
import { elysiaErrorHandler, ErrorType } from "@webslurm2/shared";
import { getDatabase, initialiseDatabase } from "../helpers/db";
import { COLOURS } from "@webslurm2/shared";
import { restart } from "@webslurm2/shared";
import { t } from "elysia";
import allowedDbTypes from "../constants/allowedDbTypes";

export default function serviceConfigRoutes(app: Elysia) {
  return app.group("/service-config", (app) =>
    app
      .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
      .post(
        "/init",
        async ({ body, set }) => {
          //Grab the current config
          const currentConfig = getRuntimeConfig();

          //Send a specific informative response if the db type is invalid
          if (!allowedDbTypes.includes(body.dbType)) {
            set.status = 400;
            return {
              message:
                "Invalid database type. Please use one of the following values: " +
                allowedDbTypes.join(", "),
              code: 400,
            };
          }
          //Bad request if the config is already set. There'll be a separate function for updating the config to prevent accidental overwrites
          if (currentConfig.dbType && currentConfig.connectionString) {
            throw new Error(ErrorType.BAD_REQUEST);
          }

          setRuntimeConfig(body.dbType, body.connectionString);

          //Initialise the database

          await initialiseDatabase(body.dbType, body.connectionString);
          set.status = 200;

          console.log(
            `${COLOURS.blue}Database cofigured with type ${COLOURS.magenta}${body.dbType}${COLOURS.blue}. ${COLOURS.yellow}Restarting...${COLOURS.reset}`
          );
          //Use a timeout here to ensure the return can be sent before the service restarts
          setTimeout(restart, 1000);
          return {
            message: `Database configured successfully with type ${body.dbType}. Service will restart.`,
          };
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
      //temp
      .get("/reset", async () => {
        const db = getDatabase();
        await db?.destroy();
        await initialiseDatabase(
          getRuntimeConfig().dbType!,
          getRuntimeConfig().connectionString!
        );
        return { message: "Database destroyed successfully." };
      })
  );
}
