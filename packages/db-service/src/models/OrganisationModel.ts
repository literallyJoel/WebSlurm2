import type { Knex } from "knex";
import Model from "./Model";
import { TABLE_NAMES } from "../db/schema";
import { ErrorType } from "@webslurm2/shared";
/*
When you create an organisation, you need to specify a user to be the admin
But when you retrieve an organisation, this data is not included, so we separate the interfaces 
into an input and output interface
*/
export interface OrganisationInput {
  name: string;
  userId: string;
}

export interface Organisation extends Omit<OrganisationInput, "userId"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganisationWithMember extends Organisation {
  userId: string;
}

export default class OrganisationModel extends Model<Organisation> {
  constructor(knex: Knex, tableName = TABLE_NAMES.organisation) {
    super(knex, tableName);
  }

  //Use the id field as identifier
  protected getKeys(identifier: Partial<Organisation>): { id?: string } {
    return { id: identifier.id };
  }

  //Return the data as is
  protected sanitiseData(data: Organisation): Organisation;
  protected sanitiseData(data: Organisation[]): Organisation[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(data: Organisation | Organisation[] | undefined) {
    return data;
  }

  //We override the create method as we need to create an organisationMember (using a transaction)
  async create(data: OrganisationInput): Promise<OrganisationWithMember> {
    return await this.knex.transaction(async (tx) => {
      const [organisation] = await tx(this.tableName)
        .insert({ name: data.name })
        .returning("*");
      if (!organisation) {
        throw new Error(ErrorType.INTERNAL_SERVER_ERROR);
      }

      await tx(TABLE_NAMES.organisationMember).insert({
        organisationId: organisation.id,
        userId: data.userId,
        role: "admin",
      });

      return { ...organisation, userId: data.userId };
    });
  }
}
