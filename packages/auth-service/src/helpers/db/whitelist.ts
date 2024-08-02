import { dbQuery, type WhitelistUser } from '@webslurm2/shared';

export async function getWhitelistedUser(
  email: string
): Promise<WhitelistUser | undefined> {
  return await dbQuery('whitelist', 'getOne', { email });
}

export async function whitelistUser(
  input: WhitelistUser
): Promise<WhitelistUser | undefined> {
  return await dbQuery('whitelist', 'create', input);
}
