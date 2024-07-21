import { dbQuery } from "../services/calls";

type oAuthProvider = {
  name: string;
  requiredFields: string[];
  optioalFields?: string[];
};

type unparsedProvider = {
  name: string;
  requiredFields: string;
  optionalFields?: string;
};

export async function getEnabledProviders() {
  const providers = (await dbQuery("oAuthProvider", "getAll", {})) as
    | unparsedProvider[]
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
}
