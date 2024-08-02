import type { Knex } from "knex";
import Model from "./Model";
import { TABLE_NAMES } from "../db/schema";

type OAuthProvider = {
  name: string;
  requiredFields: string[];
  optionalFields?: string[];
};

export default class OAuthProviderModel extends Model<OAuthProvider> {
  constructor(knex: Knex, tableName = TABLE_NAMES.oAuthProvider) {
    super(knex, tableName);
  }

  //use the "name" field as identifier
  protected getKeys(identifier: Partial<OAuthProvider>): { name?: string } {
    return { name: identifier.name };
  }

  //Return the data as is
  protected sanitiseData(data: OAuthProvider): OAuthProvider;
  protected sanitiseData(data: OAuthProvider[]): OAuthProvider[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(data: OAuthProvider | OAuthProvider[] | undefined) {
    return data;
  }
}
