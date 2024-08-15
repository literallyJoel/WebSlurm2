import {
  CreateUserSchema,
  dbQuery,
  elysiaErrorHandler,
  ErrorType,
} from "@webslurm2/shared";
import Elysia from "elysia";
import { register, verifyToken } from "../helpers/serviceCalls/authService";

export function usersRoutes(app: Elysia<any>) {
  app
    .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
    .get("/", async ({ headers: { authorization } }) => {
      const verified = await verifyToken(authorization?.split(" ")[1] ?? "");
      if (!verified || verified.role !== "admin") {
        throw new Error(ErrorType.UNAUTHORIZED);
      }
      const users = await dbQuery("user", "getAll", {});
      return users;
    })
    .get("/:id", async ({ params, headers: { authorization } }) => {
      const verified = await verifyToken(authorization?.split(" ")[1] ?? "");
      if (
        !verified ||
        verified.role !== "admin" ||
        verified.userId !== params.id
      ) {
        throw new Error(ErrorType.UNAUTHORIZED);
      }

      const user = await dbQuery("user", "getOne", { id: params.id });
    });
}
