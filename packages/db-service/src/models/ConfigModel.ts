import type { Knex } from "knex";
import { TABLE_NAMES } from "../db/schema";
import Model from "./Model";

export interface Config {
  key: string;
  value: string;
}

export default class ConfigModel extends Model<Config> {
  constructor(knex: Knex, tableName = TABLE_NAMES.config) {
    super(knex, tableName);
  }

  //Use the "key" field as identifier
  protected getKeys(identifier: Partial<Config>): { key?: string } {
    return { key: identifier.key };
  }

  //Return the data as is
  protected sanitiseData(data: Config): Config;
  protected sanitiseData(data: Config[]): Config[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: Config | Config[] | undefined
  ): Config | Config[] | undefined {
    return data;
  }
}
