import type { Knex } from "knex";
import Model from "./Model";
import { TABLE_NAMES } from "../service-config/schema";

export interface Whitelist {
  email: string;
  role: "admin" | "user";
  organisationId: string;
  organisationRole?: "admin" | "moderator" | "user";
}

export default class WhitelistModel extends Model<Whitelist> {
  constructor(knex: Knex, tableName = TABLE_NAMES.whitelist) {
    super(knex, tableName);
  }

  //Use the "email" field as identifier
  protected getKeys(identifier: Partial<Whitelist>): { email?: string } {
    return { email: identifier.email };
  }

  //Return the data as is
  protected sanitiseData(data: Whitelist): Whitelist;
  protected sanitiseData(data: Whitelist[]): Whitelist[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: Whitelist | Whitelist[] | undefined
  ): Whitelist | Whitelist[] | undefined {
    return data;
  }
}
