import {
  describe,
  expect,
  test,
  beforeEach,
  afterEach,
  spyOn,
  beforeAll,
  mock,
  afterAll,
} from "bun:test";
import { Knex } from "knex";
import { getDatabase, isDatabaseConfigured } from "../db";
import transaction from "../transaction";
import {
  ErrorType,
  OperationName,
  TransactionOperation,
} from "@webslurm2/shared";
import { initialiseDatabase } from "../db";
let db: Knex<any, any[]> | null;
const log = console.log;
beforeAll(() => {
  console.log = mock();
});

afterAll(() => {
  console.log = log;
});
beforeEach(async () => {
  await initialiseDatabase("sqlite", ":memory:");
  db = getDatabase();
  if (!db) throw new Error("Database not initialised");
  spyOn(db, "transaction");
});

afterEach(async () => {
  if (db) await db.destroy();
  //Reset the database to null
  isDatabaseConfigured();
});

describe("Transaction Function", () => {
  test("should fail on invalid order", async () => {
    const operations: TransactionOperation[] = [
      {
        order: 2,
        model: "user",
        operation: "create",
        params: { name: "James", email: "james@example.com" },
      },
      {
        order: 3,
        model: "user",
        operation: "getOne",
        params: { email: "james@example.com" },
        resultKey: "user1",
      },
    ];
    expect(transaction(operations)).rejects.toThrow(ErrorType.BAD_REQUEST);
  });

  test("should resolve references correctly", async () => {
    const operations: TransactionOperation[] = [
      {
        order: 1,

        model: "user",

        operation: "create",

        params: { name: "John Doe", email: "john@example.com" },

        resultKey: "user",
        return: ["id", "email"],
      },

      {
        order: 2,

        model: "organisation",

        operation: "create",

        params: { name: "ACME Inc." },

        resultKey: "organisation",

        return: ["id"],
      },
      {
        order: 3,
        model: "organisationMember",
        operation: "create",
        params: {
          organisationId: { $ref: "organisation", field: "id" },
          userId: { $ref: "user", field: "id" },
          role: "user",
        },
        return: ["role"],
      },
    ];
    const result = await transaction(operations);

    expect(result.user).toBeTruthy();
  });

  test("should perform operations correctly", async () => {
    const operations: TransactionOperation[] = [
      {
        order: 1,
        model: "user",
        operation: "create",
        params: { name: "Jane", email: "jane@example.com" },
        resultKey: "user1",
        return: ["email", "id"],
      },
      {
        order: 2,
        model: "user",
        operation: "getOne",
        params: { email: "jane@example.com" },
        resultKey: "user2",
        return: ["email", "id"],
      },
    ];
    const result = await transaction(operations);
    expect(result.user).toBeTruthy();
  });

  test("should throw error on unsupported operation", async () => {
    const operations: TransactionOperation[] = [
      {
        order: 1,
        model: "user",
        operation: "unsupportedOperation" as OperationName,
        params: { name: "John" },
      },
    ];
    expect(transaction(operations)).rejects.toThrow(ErrorType.BAD_REQUEST);
  });
});
