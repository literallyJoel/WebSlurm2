import type { Knex } from "knex";
import { ErrorType } from "../helpers/errorHandler";

export default abstract class ModelClass<T extends {}, SanitisedT = T> {
  constructor(protected knex: Knex, protected tableName: string) {}

  protected abstract getKeys(identifier: Partial<T>): Partial<T>;

  protected abstract sanitiseData(data: T): SanitisedT;
  protected abstract sanitiseData(data: T[]): SanitisedT[];
  protected abstract sanitiseData(data: undefined): undefined;
  protected abstract sanitiseData(
    data: T | T[] | undefined
  ): SanitisedT | SanitisedT[] | undefined;

  async getOne(identifier: Partial<T>): Promise<SanitisedT> {
    const result = await this.knex(this.tableName)
      .where(this.getKeys(identifier))
      .first();
    if (!result) {
      console.log(this.tableName);
      console.log(identifier);
      throw new Error(ErrorType.NOT_FOUND);
    }
    return this.sanitiseData(result);
  }

  async getMany(identifier: Partial<T> | undefined): Promise<SanitisedT[]> {
    let query = this.knex(this.tableName);
    query = identifier ? query.where(this.getKeys(identifier)) : query;
    const results = await query.select();
    if (results.length === 0) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return results.map((result) => this.sanitiseData(result));
  }

  async getAll(): Promise<SanitisedT[]> {
    const results = await this.knex(this.tableName).select();
    if (results.length === 0) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return results.map((result) => this.sanitiseData(result));
  }

  async create(
    data: Omit<T, "id" | "updatedAt" | "createdAt">
  ): Promise<SanitisedT> {
    const [inserted] = await this.knex(this.tableName)
      .insert(data)
      .returning("*");
    return this.sanitiseData(inserted);
  }

  async update(data: Partial<T>): Promise<SanitisedT> {
    const [updated] = await this.knex(this.tableName)
      .where(this.getKeys(data))
      .update(data)
      .returning("*");
    if (!updated) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return this.sanitiseData(updated);
  }

  async delete(
    identifier: Partial<T>
  ): Promise<{ keys: Partial<T>; message: string }> {
    const keys = this.getKeys(identifier);
    const affected = await this.knex(this.tableName).where(keys).delete();
    if (affected === 0) {
      throw new Error(ErrorType.NOT_FOUND);
    }
    return { keys, message: "Record deleted" };
  }
}
