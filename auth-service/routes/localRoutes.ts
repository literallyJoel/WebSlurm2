import Elysia, { t } from "elysia";
import argon2 from "argon2";
import { dbQuery, dbTransaction } from "../helpers/serviceCalls";
import jwt from "@elysiajs/jwt";
import { v4 } from "uuid";

function generatePassword(length: number = 8) {
  const charSets = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "!@#$%^&*()_+[]{}|;:,.<>?",
  ];
  const allChars = charSets.join("");

  const result = new Uint8Array(length);
  crypto.getRandomValues(result);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allChars[result[i] % allChars.length];
  }

  // Ensure all character types are present
  for (let i = 0; i < charSets.length; i++) {
    if (!new RegExp(`[${charSets[i]}]`).test(password)) {
      const pos = result[i] % length;
      password =
        password.slice(0, pos) +
        charSets[i][result[i] % charSets[i].length] +
        password.slice(pos + 1);
    }
  }

  return password;
}
export async function localRoutes(app: Elysia) {
  return app.group("/local", (app) =>
    app
      .post(
        "/register",
        async ({ body, set }) => {
          const { password } = body;
          const _password = password ?? generatePassword();
          const hashed = argon2.hash(_password);

          //Create the user
          const user = (await dbQuery("user", "create", {
            ...body,
            password: hashed,
          })) as {
            id: string;
            email: string;
            name: string;
            image: string;
            role: "admin" | "user";
          } | null;

          if (!user) {
            set.status = 500;
            return { error: "Internal Server Error" };
          }

          return user;
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            name: t.String({ minLength: 1 }),
            role: t.Union([t.Literal("admin"), t.Literal("user")]),
            image: t.Optional(t.String()),
            password: t.Optional(
              t.String({
                minLength: 8,
                pattern:
                  "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
              })
            ),
            organisationId: t.String({ format: "uuid" }),
            organisationRole: t.Union([
              t.Literal("admin"),
              t.Literal("user"),
              t.Literal("moderator"),
            ]),
          }),
        }
        //todo figure out proper secret management
      )
      .use(
        jwt({
          name: "jwt",
          secret: process.env.JWT_SECRET!,
          schema: t.Object({
            tokenId: t.String({ format: "uuid" }),
            userId: t.String({ format: "uuid" }),
            role: t.Union([t.Literal("admin"), t.Literal("user")]),
            name: t.String({ minLength: 1 }),
            image: t.Optional(t.String()),
            requiresReset: t.Boolean(),
          }),
        })
      )
      .post(
        "/login",
        async ({ body, set, jwt }) => {
          const { email, password } = body;
          const user = (await dbQuery("user", "getUserByEmail", {
            email,
          })) as {
            id: string;
            email: string;
            name: string;
            password?: string;
            image?: string;
            role: "admin" | "user";
            requiresReset: boolean;
          } | null;

          if (!user) {
            set.status = 401;
            return { error: "Invalid email or password" };
          }

          //Am in two minds here about whether to let the user know they should sign in through OAuth.
          //Not convinced allowing any form of existence confirmation is a good idea.
          if (!user.password) {
            set.status = 401;
            return { error: "Invalid email or password" };
          }

          const isPasswordCorrect = argon2.verify(password, user.password);
          if (!isPasswordCorrect) {
            set.status = 401;
            return { error: "Invalid email or password" };
          }

          const token = jwt.sign({
            tokenId: v4(),
            userId: user.id,
            role: user.role,
            name: user.name,
            image: user.image,
            requiresReset: user.requiresReset,
          });

          return { token };
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 8 }),
          }),
        }
      )
      .post(
        "/initial",
        async ({ body, set }) => {
          const isSetup = (await dbQuery("config", "getOne", {
            key: "setupComplete",
          })) as {
            key: "setupComplete";
            value: "true" | "false";
          } | null;

          console.log(isSetup);
          if (isSetup && isSetup.value === "true") {
            set.status = 404;
            return { message: "Not Found" };
          }

          const { email, name, image, password, organisationName } = body;
          const hashed = await argon2.hash(password);

          const result = await dbTransaction([
            {
              order: 1,
              model: "user",
              operation: "create",
              params: {
                email,
                name,
                image,
                password: hashed,
              },
              resultKey: "user",
            },
            {
              order: 2,
              model: "organisation",
              operation: "create",
              params: {
                name: organisationName,
              },
              resultKey: "organisation",
            },
            {
              order: 3,
              model: "organisationMember",
              operation: "create",
              params: {
                organisationId: { $ref: "organisation", field: "id" },
                userId: { $ref: "user", field: "id" },
                role: "admin",
              },
            },
          ]);

          if (!result) {
            set.status = 500;
            return { error: "Internal Server Error" };
          }

          return result;
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            name: t.String({ minLength: 1 }),
            image: t.Optional(t.String()),
            password: t.String({
              minLength: 8,
              pattern:
                "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            }),
            organisationName: t.String({ minLength: 1 }),
          }),
        }
      )
  );
}
