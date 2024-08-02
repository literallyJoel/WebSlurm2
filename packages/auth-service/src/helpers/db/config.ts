import { type ConfigItem, dbQuery, handleError } from "@webslurm2/shared";

export async function getConfigItem(
  key: string
): Promise<ConfigItem | undefined> {
  try {
    return (await dbQuery("config", "getOne", { key })) ?? undefined;
  } catch (e) {
    handleError(e as Error);
    return undefined;
  }
}
