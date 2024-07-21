import { dbQuery } from "../services/calls";

export async function getConfigItem(key: string) {
  return (await dbQuery("config", "getOne", { key })) as {
    key: string;
    value: string;
  } | null;
}
