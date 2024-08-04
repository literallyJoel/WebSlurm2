import type Elysia from "elysia";
import { getEnabledProviders } from "../helpers/db/providers";
import jwt from "jsonwebtoken";
import { oauth2 } from "elysia-oauth2";
import { ErrorType, handleError, User } from "@webslurm2/shared";
import Providers, { parseProfile } from "../helpers/oauth/providers";
import { createUser, getUserByEmail, updateUser } from "../helpers/db/users";
import { v4 } from "uuid";
import { t } from "elysia";
import { getWhitelistedUser, whitelistUser } from "../helpers/db/whitelist";

export async function oAuthRoutes(app: Elysia) {
  const enabledProviders = await getEnabledProviders();

  const providers: Record<string, string[]> = {};
  for (const provider of enabledProviders) {
    //todo figure out the format for the optional fields
    providers[provider.name] = provider.requiredFields;
  }

  function signToken(
    user: User,
    providerData: NonNullable<ReturnType<typeof parseProfile>>
  ) {
    return jwt.sign(
      {
        tokenId: v4(),
        userId: user.id,
        role: user.role,
        name: user.name,
        image: providerData.image,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );
  }

  return app.group("/auth", (app) =>
    app
      .use(oauth2(providers))
      .get("/:provider", async ({ oauth2, params: { provider }, set }) => {
        //Format the provider to ensure uppercase first letter
        const requestedProvider =
          provider.charAt(0).toUpperCase() + provider.slice(1);

        //Ensure the provider is valid
        if (!providers[requestedProvider]) {
          const error = handleError(
            new Error("Invalid Provider"),
            ErrorType.BAD_REQUEST
          );
          set.status = error.status;
          return error;
        }

        return oauth2.redirect(
          //We ignore the type error here because we're doing it dynamically so it complains
          //But we do a manual check to ensure it's valid
          //@ts-ignore
          requestedProvider,
          {
            scopes: Providers[requestedProvider].scopes,
          }
        );
      })
      .get(
        "/callback/:provider",
        async ({ oauth2, set, params: { provider } }) => {
          const requestedProvider =
            provider.charAt(0).toUpperCase() + provider.slice(1);

          if (!providers[requestedProvider]) {
            const error = handleError(
              new Error("Invalid Provider"),
              ErrorType.BAD_REQUEST
            );
            set.status = error.status;
            return error;
          }

          const { accessToken } = await oauth2.authorize(requestedProvider);
          const response = await fetch(Providers[requestedProvider].tokenUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const providerData = parseProfile(
            await response.json(),
            requestedProvider
          );

          if (!providerData) {
            const error = handleError(
              new Error("Failed to get profile data"),
              ErrorType.BAD_REQUEST
            );
            set.status = error.status;
            return error;
          }

          const user = await getUserByEmail(providerData.email);

          if (!user) {
            const whitelisted = await getWhitelistedUser(providerData.email);
            if (!whitelisted) {
              const error = handleError(
                new Error("User not whitelisted"),
                ErrorType.UNAUTHORIZED
              );
              set.status = error.status;
              return error;
            }

            const user = await createUser({
              email: providerData.email,
              name: providerData.name,
              role: whitelisted.role,
              image: providerData.image,
              organisationId: whitelisted.organisationId,
              organisationRole: whitelisted.organisationRole,
              emailVerified: providerData.emailVerified,
            });

            if (!user) {
              const error = handleError(
                new Error("Failed to create user"),
                ErrorType.INTERNAL_SERVER_ERROR
              );
              set.status = error.status;
              return error;
            }

            const token = signToken(user, providerData);

            return { token };
          } else {
            await updateUser({
              id: user.id,
              image: providerData.image,
              emailVerified: providerData.emailVerified,
            });

            const token = signToken(user, providerData);
            return { token };
          }
        }
      )
      .post(
        "/whitelist",
        async ({ body, headers: { authorization }, set }) => {
          //Todo figure out better handling of auth status
          if (!authorization) {
            const error = handleError(
              new Error("Unauthorized"),
              ErrorType.UNAUTHORIZED
            );
            set.status = error.status;
            return error;
          }

          const token = authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET!);
          if (!decoded) {
            const error = handleError(
              new Error("Unauthorized"),
              ErrorType.UNAUTHORIZED
            );
            set.status = error.status;
            return error;
          }

          const user = await whitelistUser(body);
          if (!user) {
            const error = handleError(
              new Error("Failed to whitelist user"),
              ErrorType.INTERNAL_SERVER_ERROR
            );
            set.status = error.status;
            return error;
          }

          return { message: "User whitelisted successfully" };
        },
        {
          body: t.Object({
            email: t.String(),
            role: t.Union([t.Literal("admin"), t.Literal("user")]),
            organisationId: t.String(),
            organisationRole: t.Union([
              t.Literal("admin"),
              t.Literal("user"),
              t.Literal("moderator"),
            ]),
          }),
        }
      )
  );
}
