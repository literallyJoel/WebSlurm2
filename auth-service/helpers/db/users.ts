import { dbQuery, dbTransaction } from "../services/calls";

type User = {
  id: string;
  email: string;
  name: string;
  image: string;
  role: "admin" | "user";
};
export async function getUserById(userId: string) {
  const user = (await dbQuery("user", "getOne", { id: userId })) as User | null;
  return user;
}

export async function getUserByEmail(email: string) {
  const user = (await dbQuery("user", "getUserByEmail", {
    email,
  })) as (User & { requiresReset: boolean; password?: string }) | null;
  return user;
}

export async function createInitial(input: {
  email: string;
  name: string;
  image?: string;
  password: string;
  organisationName: string;
}) {
  const { email, name, image, password, organisationName } = input;
  const result = await dbTransaction([
    {
      order: 1,
      model: "user",
      operation: "create",
      params: {
        email,
        name,
        image,
        password,
        role: "admin",
      },
      resultKey: "user",
      return: ["id"],
    },
    {
      order: 2,
      model: "organisation",
      operation: "create",
      params: {
        name: organisationName,
      },
      resultKey: "organisation",
      return: ["id"],
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
      return: ["role"],
    },
  ]);

  return result as {
    user: [
      {
        id: string;
        email: string;
      }
    ];
    organisation: [{ id: string; name: string }];
    organisationMember: [{ role: "admin" | "user" }];
  } | null;
}

export async function createUser(input: {
  email: string;
  name: string;
  role: "admin" | "user";
  image?: string;
  password?: string;
  organisationId: string;
  organisationRole: "admin" | "moderator" | "user";
  emailVerified?: boolean;
}) {
  const user = (await dbQuery("user", "create", input)) as User;
  return user;
}

export async function updateUser(
  input: Partial<User> & { emailVerified?: boolean }
) {
  const user = (await dbQuery("user", "update", input)) as User;
  return user;
}
