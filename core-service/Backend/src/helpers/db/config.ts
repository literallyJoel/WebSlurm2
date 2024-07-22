import { dbQuery } from "../services/calls";

interface Config {
  key: string;
  value: string;
}

export async function getConfig(key: string): Promise<Config | null> {
  const config = (await dbQuery("config", "getOne", { key })) as Config | null;
  return config;
}

export async function updateConfig(
  key: string,
  value: string
): Promise<Config | null> {
  const config = (await dbQuery("config", "update", {
    key,
    value,
  })) as Config | null;
  return config;
}

export async function createConfig(
  key: string,
  value: string
): Promise<Config | null> {
  const config = (await dbQuery("config", "create", {
    key,
    value,
  })) as Config | null;
  return config;
}
