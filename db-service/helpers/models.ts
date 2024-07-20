import UserModel from "../models/UserModel";
import OrganisationModel from "../models/OrganisationModel";
import OrganisationMemberModel from "../models/OrganisationMemberModel";
import { getDatabase } from "./db";
import ConfigModel from "../models/ConfigModel";
import { handleError } from "./errorHandler";
import OAuthProvidersModel from "../models/OAuthProviderModel";

export function getModelClass(model: string) {
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
    default:
      return null;
  }
}
