import type Elysia from "elysia";
import { getConfig, updateConfig } from "../helpers/db/config";
import {
  elysiaErrorHandler,
  ErrorType,
  handleError,
} from "../helpers/errorHandler";

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
      .post("/setupcomplete", async ({ set }) => {
        await updateConfig("setupComplete", "true");
      })
  );
}
