import { describe, expect, test, beforeAll, afterAll, mock } from "bun:test";
import { Knex, knex } from "knex";
import { createSchema, TABLE_NAMES } from "../schema";

const config = {
  client: "sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
};

let db: Knex<any, unknown[]>;
const log = console.log;
beforeAll(async () => {
  console.log = mock();
  db = knex(config);
  await createSchema(db);
});

afterAll(async () => {
  console.log = log;
  await db.destroy();
});

describe("Database Schema Creation", () => {
  test("should create the user table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.user);
    expect(exists).toBe(true);
  });

  test("should create the organisation table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.organisation);
    expect(exists).toBe(true);
  });

  test("should create the organisationMember table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.organisationMember);
    expect(exists).toBe(true);
  });

  test("should create the config table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.config);
    expect(exists).toBe(true);
  });

  test("should create the oAuthProvider table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.oAuthProvider);
    expect(exists).toBe(true);
  });

  test("should create the whitelist table", async () => {
    const exists = await db.schema.hasTable(TABLE_NAMES.whitelist);
    expect(exists).toBe(true);
  });

  test("should insert setupComplete into the config table", async () => {
    const setupComplete = await db(TABLE_NAMES.config)
      .where({ key: "setupComplete" })
      .first();
    expect(setupComplete).toBeTruthy();
    expect(setupComplete.value).toBe("false");
  });
});
