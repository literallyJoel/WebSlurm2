import {
  dbQuery,
  handleError,
  type OAuthProvider,
  type UnparsedProvider,
} from "@webslurm2/shared";

export async function getEnabledProviders(): Promise<OAuthProvider[]> {
  try {
    const providers = (await dbQuery("oAuthProvider", "getAll", {})) as
      | UnparsedProvider[]
      | null;

    if (!providers) {
      return [];
    }
    return providers.map((provider) => ({
      name: provider.name,
      requiredFields: JSON.parse(provider.requiredFields) as string[],
      optionalFields: provider.optionalFields
        ? (JSON.parse(provider.optionalFields) as string[])
        : undefined,
    }));
  } catch (e) {
    handleError(e as Error);
    return [];
  }
}
