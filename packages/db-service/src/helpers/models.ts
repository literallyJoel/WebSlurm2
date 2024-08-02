import { handleError, type ModelName } from '@webslurm2/shared';
import { getDatabase } from './db';
import UserModel from '../models/UserModel';
import OrganisationModel from '../models/OrganisationModel';
import OrganisationMemberModel from '../models/OrganisationMemberModel';
import ConfigModel from '../models/ConfigModel';
import OAuthProvidersModel from '../models/OAuthProviderModel';
import WhitelistModel from '../models/WhitelistModel';
export function getModelClass(model: ModelName) {
  const db = getDatabase();

  if (!db) {
    handleError(new Error('Database not initialised'));
    return null;
  }

  switch (model) {
    case 'user':
      return new UserModel(db);
    case 'organisation':
      return new OrganisationModel(db);
    case 'organisationMember':
      return new OrganisationMemberModel(db);
    case 'config':
      return new ConfigModel(db);
    case 'oAuthProvider':
      return new OAuthProvidersModel(db);
    case 'whitelist':
      return new WhitelistModel(db);
    default:
      return null;
  }
}
