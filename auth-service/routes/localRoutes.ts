import Elysia, { t } from "elysia";
import argon2 from "argon2";
import { callDBService } from "../helpers/serviceCalls";
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
export function localRoutes(app: Elysia) {
  app.group("/local", (app) =>
    app
      .post(
        "/register",
        async ({ body, set }) => {
          const { password } = body;
          const _password = password ?? generatePassword();
          const hashed = argon2.hash(_password);

          //Create the user
          const user = (await callDBService("user", "create", {
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
            password: t.Optional(
              t.String({
                minLength: 8,
                pattern: "^(?=.[A-Z])(?=.[a-z])(?=.\\d)(?=.[\\W_]).*$",
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
            image: t.String(),
            requiresReset: t.Boolean(),
          }),
        })
      )
      .post(
        "/login",
        async ({ body, set, jwt }) => {
          const { email, password } = body;
          const user = (await callDBService("user", "getUserByEmail", {
            email,
          })) as {
            id: string;
            email: string;
            name: string;
            password?: string;
            image: string;
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
  );
}
