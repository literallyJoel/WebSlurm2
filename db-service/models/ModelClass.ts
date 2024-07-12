import type { Knex } from "knex";

export default abstract class ModelClass<T extends {}, SanitisedT = T> {
  //Provides the database instance and the table name for the model
  constructor(protected knex: Knex, protected tableName: string) {}

  //Returns the keys to use when querying the database. Allows for both a singular primary key and composite keys
  protected abstract getKeys(identifier: Partial<T>): Partial<T>;

  //Santise function, so that for certain types of data, such as users, we can remove sensitive data
  protected abstract sanitiseData(data: T): SanitisedT;
  protected abstract sanitiseData(data: T[]): SanitisedT[];
  protected abstract sanitiseData(data: undefined): undefined;
  protected abstract sanitiseData(
    data: T | T[] | undefined
  ): SanitisedT | SanitisedT[] | undefined;

  //Return the first result with the given key from the database
  async getOne(
    identifier: Partial<T>
  ): Promise<SanitisedT | { error: string }> {
    const result = await this.knex(this.tableName)
      .where(this.getKeys(identifier))
      .first();
    return result ? this.sanitiseData(result) : { error: "Record not found" };
  }

  //Return all results with the given key from the database
  async getMany(
    identifier: Partial<T> | undefined
  ): Promise<SanitisedT[] | { error: string }> {
    let query = this.knex(this.tableName);
    query = identifier ? query.where(this.getKeys(identifier)) : query;
    const results = await query.select();
    if (results.length === 0) {
      return { error: "No records found" };
    }
    return results.map((result) => this.sanitiseData(result));
  }

  async getAll(): Promise<SanitisedT[] | { error: string }> {
    const results = await this.knex(this.tableName).select();
    if (results.length === 0) {
      return { error: "No records found" };
    }
    return results.map((result) => this.sanitiseData(result));
  }

  async create(
    data: Omit<T, "id" | "updatedAt" | "createdAt">
  ): Promise<SanitisedT | { error: string }> {
    try {
      const [inserted] = await this.knex(this.tableName)
        .insert(data)
        .returning("*");
      return this.sanitiseData(inserted);
    } catch (e) {
      //todo implement proper logging once logging service is done
      console.error(e);
      if (this.isDuplicateKeyError(e as Error)) {
        return { error: "Already exists" };
      }

      return { error: "Internal server error" };
    }
  }

  async update(data: Partial<T>): Promise<SanitisedT> {
    const [updated] = await this.knex(this.tableName)
      .where(this.getKeys(data))
      .update(data)
      .returning("*");
    return this.sanitiseData(updated);
  }

  async delete(
    identifier: Partial<T>
  ): Promise<
    { keys: Partial<T>; message: "Record deleted" } | { error: string }
  > {
    try {
      const keys = this.getKeys(identifier);
      console.log("identifier", identifier);
      console.log("keys", keys);
      const affected = await this.knex(this.tableName).where(keys).delete();
      if (affected === 0) {
        return { error: "Record not found" };
      }
      return { keys, message: "Record deleted" };
    } catch (e) {
      console.error(e);

      return { error: "Internal server error" };
    }
  }

  protected isDuplicateKeyError(e: Error): boolean {
    const errorString = e.toString().toLowerCase();
    return (
      errorString.includes("duplicate") ||
      errorString.includes("unique constraint") ||
      errorString.includes("uniqueviolation") ||
      errorString.includes("primary key constraint") ||
      (e as any).code === "23505" // Common PostgreSQL code for unique violation
    );
  }
}
