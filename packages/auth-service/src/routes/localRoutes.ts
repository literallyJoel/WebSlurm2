import argon2 from "argon2";

import { createInitial, createUser, getUserByEmail } from "../helpers/db/users";
import Elysia, { t } from "elysia";
import {
  CreateUserSchema,
  elysiaErrorHandler,
  ErrorType,
  handleError,
} from "@webslurm2/shared";
import jwt from "@elysiajs/jwt";
import { v4 } from "uuid";
import { getConfigItem } from "../helpers/db/config";

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
  return app.group("/auth", (app) =>
    app
      .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
      .post(
        "/register",
        async ({ body }) => {
          //Generate a random password if required
          const { password } = body;
          const _password = password ?? generatePassword();
          const hashed = await argon2.hash(_password);
          //Create the user
          const user = await createUser({
            ...body,
            password: hashed,
          });

          if (!user) {
            throw new Error("Failed to create user. Check DB Service logs.");
          }
        },
        {
          body: CreateUserSchema,
        }
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
            image: t.Optional(t.String({ format: "uri" })),
          }),
        })
      )
      .post(
        "/login",
        async ({ body, jwt }) => {
          const { email, password } = body;
          const user = await getUserByEmail(email);
          if (!user) {
            throw new Error(ErrorType.UNAUTHORIZED);
          }

          //Am in two minds here about whether to let the user know they should sign in through OAuth.
          //Not convinced allowing any form of existence confirmation is a good idea.
          if (!user.password) {
            throw new Error(ErrorType.UNAUTHORIZED);
          }

          const isPasswordCorrect = await argon2.verify(
            user.password,
            password
          );

          if (!isPasswordCorrect) {
            throw new Error(ErrorType.UNAUTHORIZED);
          }

          const token = await jwt.sign({
            tokenId: v4(),
            userId: user.id,
            role: user.role,
            name: user.name,
            image: user.image,
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
      .onError(({ code, error, set }) => elysiaErrorHandler(code, error, set))
      .post(
        "/initial",
        async ({ body }) => {
          const isSetup = await getConfigItem("setupComplete");
          if (isSetup && isSetup.value === "true") {
            //We make this route non-existent if the setup is complete
            throw new Error(ErrorType.NOT_FOUND);
          }

          const { password } = body;
          const hashed = await argon2.hash(password);

          const result = await createInitial({ ...body, password: hashed });
          if (!result) {
            throw new Error(
              "Failed to create initial user. Check DB Service logs."
            );
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
      .onError(({ code, error, set }) => {
        //We override the general error handling to always return a 401
        return handleError(error, ErrorType.UNAUTHORIZED);
      })
      .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
      .post(
        "/verify",
        async ({ body, jwt }) => {
          const { token } = body;

          const decoded = await jwt.verify(token);
          if (!decoded) {
            throw new Error(ErrorType.UNAUTHORIZED);
          }

          return decoded;
        },
        {
          body: t.Object({
            token: t.String(),
          }),
        }
      )
  );
}
