import type { Knex } from "knex";
import ModelClass from "./ModelClass";
import { TABLE_NAMES } from "../service-config/schema";
type OAuthProvider = {
  name: string;
  clientId: string;
  clientSecret: string;
  tenantId?: string;
  userPoolDomain?: string;
  enabled: boolean;
};
export default class OAuthProvidersModel extends ModelClass<OAuthProvider> {
  constructor(knex: Knex, tableName = TABLE_NAMES.oAuthProviders) {
    super(knex, tableName);
  }

  protected getKeys(identifier: Partial<OAuthProvider>) {
    return { name: identifier.name };
  }

  protected sanitiseData(data: OAuthProvider): OAuthProvider;
  protected sanitiseData(data: OAuthProvider[]): OAuthProvider[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(data: OAuthProvider | OAuthProvider[] | undefined) {
    return data;
  }
}
