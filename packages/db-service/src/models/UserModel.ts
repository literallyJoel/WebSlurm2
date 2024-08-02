import type { Knex } from "knex";
import Model from "./Model";
import { TABLE_NAMES } from "../db/schema";
import { ErrorType } from "@webslurm2/shared";

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "admin" | "user";
  requiresReset: boolean;
  initial?: boolean;
  organisationId?: string;
  organisationRole?: "admin" | "moderator" | "user";
}

export interface User
  extends Omit<UserInput, "organisationId" | "organisationRole"> {
  id: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SanitisedUser = Pick<
  User,
  "id" | "email" | "name" | "image" | "role"
>;

export default class UserModel extends Model<User, SanitisedUser> {
  constructor(knex: Knex, tableName = TABLE_NAMES.user) {
    super(knex, tableName);
  }

  //Use id as the identifier
  protected getKeys(identifier: Partial<User>): { id?: string } {
    return { id: identifier.id };
  }

  //We remove all fields except id, email, name, image, role
  protected sanitiseData(data: User): SanitisedUser;
  protected sanitiseData(data: User[]): SanitisedUser[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: User | User[] | undefined
  ): SanitisedUser | SanitisedUser[] | undefined {
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

  //Override the create method so we can add the user to an organisation
  async create(data: UserInput): Promise<SanitisedUser> {
    return await this.knex.transaction(async (tx) => {
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
        await tx(TABLE_NAMES.organisationMember).insert({
          organisationId: data.organisationId,
          userId: user.id,
          role: data.organisationRole,
        });
      }

      return this.sanitiseData(user);
    });
  }

  //Custom method for getting a user by email
  async getByEmail(email: string): Promise<SanitisedUser> {
    const user = await this.knex(this.tableName).where({ email }).first();
    //This is mostly used for auth reasons, so we don't sanitise the data. It can be sanitised if required downstream.
    return user;
  }

  //Custom method for getting an unsanitised user, used for auth service where password needs to be checked
  async getUnsanitisedUser(id: string): Promise<User> {
    const user = await this.knex(this.tableName).where({ id }).first();
    return user;
  }
}
