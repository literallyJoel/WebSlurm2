import { dbQuery, elysiaErrorHandler, ErrorType } from "@webslurm2/shared";
import Elysia from "elysia";
import { verifyToken } from "../helpers/serviceCalls/authService";

export function organisationsRoutes(app: Elysia<any>) {
  app
    .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
    .get("/", async ({ headers: { authorization } }) => {
      const verified = await verifyToken(authorization?.split(" ")[1] ?? "");
      if (!verified || verified.role !== "admin") {
        throw new Error(ErrorType.UNAUTHORIZED);
      }
      const organisations = await dbQuery("organisation", "getAll", {});
      return organisations;
    })
    .get("/:id", async ({ params, headers: { authorization } }) => {
      const verified = await verifyToken(authorization?.split(" ")[1] ?? "");
      if (
        !verified 
      ) {
        throw new Error(ErrorType.UNAUTHORIZED);
      }

      const organisation = await dbQuery("organisation", "getOne", {
        id: params.id,
      });
      return organisation;
    })
    .get("/:id/members", async ({ params, headers: { authorization } }) => {
        const verified = await verifyToken(authorization?.split(" ")[1] ?? "");
        if (
          !verified 
        ) {
          throw new Error(ErrorType.UNAUTHORIZED);
        }

        const members = await dbQuery("organisationMember", "getAll", {
          organisationId: params.id,
        });
        return members;
      })
}
