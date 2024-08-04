import type Elysia from "elysia";
import {
  getConfig,
  updateConfig,
  elysiaErrorHandler,
  ErrorType,
  handleError,
} from "@webslurm2/shared";
import { createInitial } from "../helpers/serviceCalls/authService";
import { CreateInitialSchema } from "@webslurm2/shared";

export function setupRoutes(app: Elysia<any>) {
  return app.group("/setup", (app) =>
    app
      .onError(({ set, error, code }) => {
        return elysiaErrorHandler(code, error, set);
      })
      .get("/setupcomplete", async ({ set }) => {
        const isSetup = await getConfig("setupComplete");
        if (!isSetup) {
          const error = handleError(
            new Error("Could not get setup status. Check DB Service Logs."),
            ErrorType.INTERNAL_SERVER_ERROR
          );
          set.status = error.status;
          return error;
        }

        return { isSetup: isSetup.value === "true" };
      })
      .onError(({ set, error, code }) => {
        return elysiaErrorHandler(code, error, set);
      })
      .post("/setupcomplete", async () => {
        await updateConfig("setupComplete", "true");
      })
      .onError(({ set, error, code }) => {
        return elysiaErrorHandler(code, error, set);
      })
      .post(
        "/initial",
        async ({ body, cookie }) => {
          console.log("called");
          const result = await createInitial(body);
          if (!result) {
            throw new Error("Failed to create initial user");
          }

          console.log(result);
          const response = result.result;

          cookie["ws2_token"].set({
            value: result.token,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });

          return response;
        },
        {
          body: CreateInitialSchema,
        }
      )
  );
}
