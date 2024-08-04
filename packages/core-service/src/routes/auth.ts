import { elysiaErrorHandler, ErrorType } from "@webslurm2/shared";
import Elysia, { t } from "elysia";
import { verifyToken } from "../helpers/serviceCalls/authService";

export function authRoutes(app: Elysia<any>) {
  return app.group("/auth", (app) =>
    app
      .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
      .get("/verify", async ({ headers: { authorization } }) => {
        if (!authorization) {
          throw new Error(ErrorType.UNAUTHORIZED);
        }
        const token = authorization.split(" ")[1];

        const decoded = await verifyToken(token);
        if (!decoded) {
          throw new Error(ErrorType.UNAUTHORIZED);
        }

        return decoded;
      })
  );
}
