import { Knex } from "knex";
import ModelClass from "./ModelClass";
import { TABLE_NAMES } from "../service-config/schema";
import { ErrorType } from "../helpers/errorHandler";

export interface UserInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "admin" | "user";
  requiresReset: boolean;
  initial?: boolean;
  organisationId?: string;
  organisationRole?: "admin" | "user" | "moderator";
}

export interface User
  extends Omit<UserInput, "organisationId" | "organisationRole"> {
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
  constructor(knex: Knex, tableName = TABLE_NAMES.user) {
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

  async create(data: UserInput): Promise<SantisedUser> {
    return await this.knex.transaction(async (tx) => {
      try {
        const [user] = await tx(this.tableName)
          .insert({
            name: data.name,
            email: data.email,
            password: data.password,
            image: data.image,
            role: data.role,
            requiresReset: data.requiresReset,
          })
          .returning("*");

        if (!user) {
          throw new Error(ErrorType.INTERNAL_SERVER_ERROR);
        }

        if (data.organisationId) {
          await tx("webslurm2_organisation_members").insert({
            organisationId: data.organisationId,
            userId: user.id,
            role: data.organisationRole,
          });
        }

        return this.sanitiseData(user);
      } catch (error) {
        tx.rollback();
        throw error;
      }
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.knex(this.tableName).where({ email }).first();
    if (!user) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return user;
  }

  async getUnsanitisedUser(id: string): Promise<User> {
    const user = await this.knex(this.tableName).where({ id }).first();
    if (!user) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return user;
  }
}
