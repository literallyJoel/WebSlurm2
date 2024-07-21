import UserModel from "../models/UserModel";
import OrganisationModel from "../models/OrganisationModel";
import OrganisationMemberModel from "../models/OrganisationMemberModel";
import { getDatabase } from "./db";
import ConfigModel from "../models/ConfigModel";
import { handleError } from "./errorHandler";
import OAuthProvidersModel from "../models/OAuthProviderModel";
import { t, type Static } from "elysia";
import WhitelistModel from "../models/WhitelistModel";

//Define the model names and Operation Names as TBox Schemas for use in Elysia Validation
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

//Export them as TS types for use in code.
export type ModelName = Static<typeof ModelNameSchema>;
export type OperationName = Static<typeof OperationNameSchema>;

export function getModelClass(model: ModelName) {
  const db = getDatabase();

  if (!db) {
    handleError(new Error("Database not initialised"));
    return null;
  }

  switch (model) {
    case "user":
      return new UserModel(db);
    case "organisation":
      return new OrganisationModel(db);
    case "organisationMember":
      return new OrganisationMemberModel(db);
    case "config":
      return new ConfigModel(db);
    case "oAuthProvider":
      return new OAuthProvidersModel(db);
    case "whitelist":
      return new WhitelistModel(db);
    default:
      return null;
  }
}
