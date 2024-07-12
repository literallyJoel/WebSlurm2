import { Knex } from "knex";
import  ModelClass from "./ModelClass";

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
  constructor(knex: Knex, tableName = "ws2_organisations") {
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

  //Override the default create to add the user to the members table
  async create(
    data: Omit<OrganisationInput, "id" | "updatedAt" | "createdAt">
  ): Promise<OrganisationWithMember | { error: string }> {
    return await this.knex.transaction(async (tx) => {
      try {
        const [organisation] = await tx(this.tableName)
          .insert(data.name)
          .returning("*");
        if (!organisation) {
          throw new Error("Failed to fetch organisation id");
        }

        await tx("ws2_organisation_members").insert({
          organisationId: organisation.id,
          userId: data.userId,
          role: data.role,
        });

        return { ...organisation, userId: data.userId };
      } catch (e) {
        tx.rollback();
        console.error(e);
        if (this.isDuplicateKeyError(e as Error)) {
          return { error: "Already exists" };
        }
        return { error: "Internal server error" };
      }
    });
  }
}
