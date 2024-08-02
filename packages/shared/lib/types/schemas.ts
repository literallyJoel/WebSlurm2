import { t } from "elysia";

export const ModelNameSchema = t.Union([
  t.Literal("user"),
  t.Literal("organisation"),
  t.Literal("organisationMember"),
  t.Literal("config"),
  t.Literal("oAuthProvider"),
  t.Literal("whitelist"),
]);

export const OperationNameSchema = t.Union([
  t.Literal("getOne"),
  t.Literal("getMany"),
  t.Literal("getAll"),
  t.Literal("create"),
  t.Literal("update"),
  t.Literal("delete"),
  t.Literal("getUserByEmail"),
]);

export const CreateUserSchema = t.Object({
  email: t.String(),
  name: t.String(),
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
});
