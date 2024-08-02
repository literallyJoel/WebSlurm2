import type { Knex } from "knex";
import { ErrorType } from "@webslurm2/shared";

export default abstract class Model<T extends {}, SanitisedT = T> {
  constructor(protected knex: Knex, protected tableName: string) {}

  //Used to get the primary key(s) of the model for use in operations
  protected abstract getKeys(identifier: Partial<T>): Partial<T>;

  //Used to sanitise data before returning, used in models such as User to remove sensitive data such as password
  protected abstract sanitiseData(data: T): SanitisedT;
  protected abstract sanitiseData(data: T[]): SanitisedT[];
  protected abstract sanitiseData(data: undefined): undefined;
  protected abstract sanitiseData(
    data: T | T[] | undefined
  ): SanitisedT | SanitisedT[] | undefined;

  //Used to retrieve a single row from the database
  async getOne(identifier: Partial<T>): Promise<SanitisedT | undefined> {
    const result = await this.knex(this.tableName)
      .where(this.getKeys(identifier))
      .first();
    return this.sanitiseData(result);
  }

  async getMany(identifier?: Partial<T>): Promise<SanitisedT[]> {
    let query = this.knex(this.tableName);
    query = identifier ? query.where(this.getKeys(identifier)) : query;
    const results = await query.select();
    return results.map((result) => this.sanitiseData(result));
  }

  async getAll(): Promise<SanitisedT[]> {
    const results = await this.knex(this.tableName).select();
    return results.map((result) => this.sanitiseData(result));
  }

  async create(
    data: Omit<T, "id" | "createdAt" | "updatedAt">
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
      throw new Error(ErrorType.BAD_REQUEST);
    }

    return this.sanitiseData(updated);
  }

  async delete(
    identifier: Partial<T>
  ): Promise<{ keys: Partial<T>; message: string }> {
    const keys = this.getKeys(identifier);
    const affected = await this.knex(this.tableName).where(keys).del();
    return { keys, message: `Deleted ${affected} rows` };
  }
}
