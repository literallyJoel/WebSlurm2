import type { Knex } from "knex";
import Model from "./Model";
import { TABLE_NAMES } from "../db/schema";

export interface OrganisationMember {
  organisationId: string;
  userId: string;
  role: "admin" | "moderator" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export default class OrganisationMemberModel extends Model<OrganisationMember> {
  constructor(knex: Knex, tableName = TABLE_NAMES.organisationMember) {
    super(knex, tableName);
  }

  //Use "organisationId" and "userId" as identifier
  protected getKeys(identifier: Partial<OrganisationMember>): {
    organisationId?: string;
    userId?: string;
  } {
    return {
      userId: identifier.userId,
      organisationId: identifier.organisationId,
    };
  }

  //Return the data as is
  protected sanitiseData(data: OrganisationMember): OrganisationMember;
  protected sanitiseData(data: OrganisationMember[]): OrganisationMember[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: OrganisationMember | OrganisationMember[] | undefined
  ) {
    return data;
  }
}
