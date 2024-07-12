import { Knex } from "knex";
import ModelClass from "./ModelClass";

export interface OrganisationMember {
  organisationId: string;
  userId: string;
  role: "admin" | "moderator" | "user";
}

export default class OrganisationMemberModel extends ModelClass<OrganisationMember> {
  constructor(knex: Knex, tableName = "ws2_organisation_members") {
    super(knex, tableName);
  }

  protected getKeys(identifier: Partial<OrganisationMember>): {
    userId?: string;
    organisationId?: string;
  } {
    return {
      userId: identifier.userId,
      organisationId: identifier.organisationId,
    };
  }

  protected sanitiseData(data: OrganisationMember): OrganisationMember;
  protected sanitiseData(data: OrganisationMember[]): OrganisationMember[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: OrganisationMember | OrganisationMember[] | undefined
  ): OrganisationMember | OrganisationMember[] | undefined {
    return data;
  }
}
