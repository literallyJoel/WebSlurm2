import type { Knex } from "knex";
import ModelClass from "./ModelClass";
import { TABLE_NAMES } from "../service-config/schema";

export interface Config {
  key: string;
  value: string;
}

export default class ConfigModel extends ModelClass<Config> {
  constructor(knex: Knex, tableName = TABLE_NAMES.config) {
    super(knex, tableName);
  }

  protected getKeys(identifier: Partial<Config>): { key?: string } {
    return { key: identifier.key };
  }

  protected sanitiseData(data: Config): Config;
  protected sanitiseData(data: Config[]): Config[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: Config | Config[] | undefined
  ): Config | Config[] | undefined {
    return data;
  }
}
