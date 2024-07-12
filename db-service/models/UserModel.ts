import { Knex } from "knex";
import ModelClass  from "./ModelClass";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "admin" | "user";
  requiresReset: boolean;
}

export interface User extends UserInput {
  id: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SantisedUser = Pick<
  User,
  "id" | "email" | "name" | "image" | "role"
>;

export default class UserModel extends ModelClass<User, SantisedUser> {
  constructor(knex: Knex, tableName = "webslurm2_users") {
    super(knex, tableName);
  }

  protected getKeys(identifier: Partial<User>): { id?: string } {
    return { id: identifier.id };
  }

  protected sanitiseData(data: User): SantisedUser;
  protected sanitiseData(data: User[]): SantisedUser[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: User | User[] | undefined
  ): SantisedUser | SantisedUser[] | undefined {
    if (!data) {
      return undefined;
    }
    if (Array.isArray(data)) {
      return data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      }));
    }
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      image: data.image,
      role: data.role,
    };
  }

  async getUserByEmail(email: string): Promise<User | { error: string }> {
    try {
      return await this.knex(this.tableName).where({ email }).first();
    } catch (e) {
      if (e instanceof Error) {
        if (
          e.message.includes("duplicate key value violates unique constraint")
        ) {
          return { error: "User already exists" };
        }
      }
      console.error(e);
      return { error: "Internal server error" };
    }
  }

  async getUnsanitisedUser(id: string): Promise<User | { error: string }> {
    return await this.knex(this.tableName).where({ id }).first();
  }
}
