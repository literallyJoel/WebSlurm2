import { dbQuery } from "../services/calls";
type whitelistUser = {
  email: string;
  role: "admin" | "user";
  organisationId: string;
  organisationRole: "admin" | "moderator" | "user";
} | null;
export async function isUserWhitelisted(email: string) {
  const user = (await dbQuery("whitelist", "getOne", {
    email,
  })) as whitelistUser;
  return user;
}

export async function whitelistUser(input: {
  email: string;
  role: "admin" | "user";
  organisationId: string;
  organisationRole: "admin" | "moderator" | "user";
}) {
  const user = (await dbQuery("whitelist", "create", input)) as whitelistUser;
  return user;
}
