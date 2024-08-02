import { dbQuery } from "../database";
import type { ConfigItem } from "../../types";

export async function getConfig(key: string): Promise<ConfigItem | null> {
  return await dbQuery("config", "getOne", { key });
}

export async function updateConfig(
  key: string,
  value: string
): Promise<ConfigItem | null> {
  return await dbQuery("config", "update", {
    key,
    value,
  });
}

export async function createConfig(
  key: string,
  value: string
): Promise<ConfigItem | null> {
  return await dbQuery("config", "create", {
    key,
    value,
  });
}
