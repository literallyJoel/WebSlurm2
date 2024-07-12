import UserModel from "../models/UserModel";
import OrganisationModel from "../models/OrganisationModel";
import OrganisationMemberModel from "../models/OrganisationMemberModel";
import { getDatabase } from "./db";
import ConfigModel from "../models/ConfigModel";

export function getModelClass(model: string) {
  const db = getDatabase();

  if (!db) {
    console.error("Database not initialized");
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
    default:
      return null;
  }
}
