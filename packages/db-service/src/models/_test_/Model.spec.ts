import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Knex, knex } from "knex";
import Model from "../Model";
import { ErrorType } from "@webslurm2/shared";

// Create a mock class extending the abstract Model class
interface MockEntity {
  id?: number;
  name: string;
  value: string;
}

class MockModel extends Model<MockEntity> {
  protected getKeys(identifier: Partial<MockEntity>): Partial<MockEntity> {
    return { id: identifier.id };
  }

  protected sanitiseData(data: MockEntity): MockEntity;
  protected sanitiseData(data: MockEntity[]): MockEntity[];
  protected sanitiseData(data: undefined): undefined;
  protected sanitiseData(
    data: MockEntity | MockEntity[] | undefined
  ): MockEntity | MockEntity[] | undefined {
    return data;
  }
}

// Set up an in-memory SQLite database for testing
const config = {
  client: "sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
};

let db: Knex<any, unknown[]>;
let mockModel: Model<MockEntity>;

beforeAll(async () => {
  db = knex(config);
  await db.schema.createTable("mock_table", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("value").notNullable();
  });
  mockModel = new MockModel(db, "mock_table");
});

afterAll(async () => {
  await db.destroy();
});

describe("Model Class", () => {
  test("getOne method should return a single row", async () => {
    await db("mock_table").insert({ name: "Test", value: "Value" });
    const result = await mockModel.getOne({ id: 1 });
    expect(result).toEqual({ id: 1, name: "Test", value: "Value" });
  });

  test("getMany method should return multiple rows", async () => {
    await db("mock_table").insert({ name: "Test2", value: "Value2" });
    const result = await mockModel.getMany();
    expect(result).toEqual([
      { id: 1, name: "Test", value: "Value" },
      { id: 2, name: "Test2", value: "Value2" },
    ]);
  });

  test("getAll method should return all rows", async () => {
    const result = await mockModel.getAll();
    expect(result).toEqual([
      { id: 1, name: "Test", value: "Value" },
      { id: 2, name: "Test2", value: "Value2" },
    ]);
  });

  test("create method should insert a new row", async () => {
    const newEntity = { name: "New", value: "Entity" };
    const result = await mockModel.create(newEntity);
    expect(result).toEqual({ id: 3, name: "New", value: "Entity" });
  });

  test("update method should update an existing row", async () => {
    const updatedEntity = { id: 1, name: "Updated", value: "Value" };
    const result = await mockModel.update(updatedEntity);
    expect(result).toEqual(updatedEntity);
  });

  test("delete method should delete an existing row", async () => {
    const result = await mockModel.delete({ id: 1 });
    expect(result).toEqual({ keys: { id: 1 }, message: "Deleted 1 rows" });
    const remaining = await mockModel.getAll();
    expect(remaining.length).toBe(2);
  });

  test("update method should throw error if row doesn't exist", async () => {
    const updatedEntity = { id: 99, name: "NonExistent", value: "Value" };
    expect(mockModel.update(updatedEntity)).rejects.toThrow(
      ErrorType.BAD_REQUEST
    );
  });
});
