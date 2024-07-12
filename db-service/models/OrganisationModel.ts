import { Knex } from "knex";
import ModelClass from "./ModelClass";
import { TABLE_NAMES } from "../service-config/schema";
import { ErrorType } from "../helpers/errorHandler";

export interface OrganisationInput {
  name: string;
  userId: string;
  role: "admin" | "moderator" | "user";
}

export interface Organisation
  extends Omit<OrganisationInput, "userId" | "role"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganisationWithMember extends Organisation {
  userId: string;
}

export default class OrganisationModel extends ModelClass<Organisation> {
  constructor(knex: Knex, tableName = TABLE_NAMES.organisation) {
    super(knex, tableName);
  }

  protected getKeys(identifier: Partial<Organisation>): { id?: string } {
    return { id: identifier.id };
  }

  protected sanitiseData(data: Organisation): Organisation;
  protected sanitiseData(data: Organisation[]): Organisation[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: Organisation | Organisation[] | undefined
  ): Organisation | Organisation[] | undefined {
    return data;
  }

  async create(
    data: Omit<OrganisationInput, "id" | "updatedAt" | "createdAt">
  ): Promise<OrganisationWithMember> {
    return await this.knex.transaction(async (tx) => {
      try {
        const [organisation] = await tx(this.tableName)
          .insert({ name: data.name })
          .returning("*");
        if (!organisation) {
          throw new Error(ErrorType.INTERNAL_SERVER_ERROR);
        }

        await tx("ws2_organisation_members").insert({
          organisationId: organisation.id,
          userId: data.userId,
          role: data.role,
        });

        return { ...organisation, userId: data.userId };
      } catch (error) {
        tx.rollback();
        throw error;
      }
    });
  }
}
