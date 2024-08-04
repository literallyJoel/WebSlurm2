import { elysiaErrorHandler, ErrorType } from "@webslurm2/shared";
import Elysia, { t } from "elysia";
import { login, verifyToken } from "../helpers/serviceCalls/authService";

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
      .post(
        "/login",
        async ({ body, cookie }) => {
          const { email, password } = body;
          const response = await login(email, password);

          if (!response) {
            throw new Error(ErrorType.UNAUTHORIZED);
          }

          cookie["ws2_token"].set({
            value: response.token,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            password: t.String(),
          }),
        }
      )
  );
}
