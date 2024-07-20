import { Elysia, redirect } from "elysia";
import { dbQuery } from "../helpers/serviceCalls";
import jwt from "@elysiajs/jwt";
import { oauth2 } from "elysia-oauth2";
import { v4 } from "uuid";
import Providers, { parseProfile } from "../helpers/oauth/providers";

//todo: test non-google providers if possible.
export async function oAuthRoutes(app: Elysia) {
  const enabledProviders = (await dbQuery("oAuthProvider", "getAll", {})) as {
    name: string;
    requiredFields: string;
    optionalFields?: string;
  }[];

  const parsedProviders = enabledProviders.map((provider) => ({
    name: provider.name,
    requiredFields: JSON.parse(provider.requiredFields) as string[],
    optionalFields: provider.optionalFields
      ? (JSON.parse(provider.optionalFields) as string[])
      : undefined,
  }));

  const providers: Record<string, string[]> = {};
  for (const provider of parsedProviders) {
    providers[provider.name] = provider.requiredFields;
  }

  return app
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .use(oauth2(providers))
    .get("/auth/:provider", async ({ oauth2, params: { provider }, set }) => {
      const requestedProvider =
        provider.charAt(0).toUpperCase() + provider.slice(1);
      if (!providers[requestedProvider]) {
        set.status = 400;
        return "Invalid provider";
      }
      return oauth2.redirect(
        //We ignore the type error here because we're doing it dynamically, but we check it to ensure its allowed
        //@ts-ignore
        requestedProvider,
        {
          scopes: Providers[requestedProvider].scopes,
        }
      );
    })
    .get(
      "/auth/callback/:provider",
      async ({
        oauth2,
        jwt,
        set,
        cookie: { ws2_token },
        params: { provider },
      }) => {
        const requestedProvider =
          provider.charAt(0).toUpperCase() + provider.slice(1);
        if (!providers[requestedProvider]) {
          set.status = 400;
          return "Invalid provider";
        }

        //@ts-ignore
        const { accessToken } = await oauth2.authorize(requestedProvider);
        const response = await fetch(Providers[requestedProvider].tokenUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const providerData = parseProfile(
          await response.json(),
          requestedProvider
        );

        if (!providerData) {
          set.status = 500;
          return { error: "Internal Server Error" };
        }

        let user = await dbQuery("user", "getUserByEmail", {
          email: providerData.email,
        });

        if (!user) {
          set.status = 401;
          return {
            error:
              "You have not been given access to this service. Please contact the administrator.",
          };
        }

        await dbQuery("user", "update", {
          id: user.id,
          image: providerData.image,
          emailVerified: providerData.emailVerified,
        });

        const token = await jwt.sign({
          tokenId: v4(),
          userId: user.id,
          role: user.role,
          name: user.name,
          image: providerData.image,
          requiresReset: 0,
        });

        ws2_token.value = token;

        return redirect(`${process.env.FRONTEND_URL}`);
      }
    )
    .get("/auth/logout", async ({ cookie: { ws2_token } }) => {
      ws2_token.value = "";
      return redirect(`${process.env.FRONTEND_URL}`);
    });
}
