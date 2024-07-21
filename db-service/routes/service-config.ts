import type Elysia from "elysia";
import { getRuntimeConfig, setRuntimeConfig } from "../helpers/config";
import { ErrorType, handleError } from "../helpers/errorHandler";
import { initialiseDatabase } from "../helpers/db";
import { COLOURS } from "../helpers/colours";
import restart from "../helpers/restart";
import { t } from "elysia";

export default function serviceConfigRoutes(
  app: Elysia,
  onDatabaseConfigured: () => void
) {
  return app.group("/service-config", (app) =>
    app.post(
      "/init",
      async ({ body, set }) => {
        //Grab the current config
        const currentConfig = getRuntimeConfig();

        //Bad request if the config is already set. There'll be a separate function for updating the config to prevent accidental overwrites
        if (currentConfig.dbType && currentConfig.connectionString) {
          throw new Error(ErrorType.BAD_REQUEST);
        }

        setRuntimeConfig(body.dbType, body.connectionString);

        //Initialise the database

        await initialiseDatabase(body.dbType, body.connectionString);
        set.status = 200;
        onDatabaseConfigured();
        console.log(
          `${COLOURS.blue}Database cofigured with type ${COLOURS.magenta}${body.dbType}${COLOURS.blue}. ${COLOURS.yellow}Restarting...${COLOURS.reset}`
        );
        //Use a timeout here to ensure the return can be sent before the service restarts
        setTimeout(restart, 1000);
        return {
          message: `Database configured succesfully with type ${body.dbType}. Service will restart.`,
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
  );
}
