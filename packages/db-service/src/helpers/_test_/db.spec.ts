import * as dbModule from "../db";
import { Knex } from "knex";

import * as schemaModule from "../../db/schema";
import {
  describe,
  expect,
  test,
  afterEach,
  afterAll,
  spyOn,
  mock,
  beforeAll,
  Mock,
} from "bun:test";
import { unlink } from "node:fs/promises";
describe("Database Helpers", () => {
  const fileSpy = spyOn(Bun, "file");
  const writeSpy = spyOn(Bun, "write");
  let setDatabaseSpy: Mock<typeof dbModule.setDatabase>;
  let isDatabaseConfiguredSpy: Mock<typeof dbModule.isDatabaseConfigured>;
  let getDatabaseSpy: Mock<typeof dbModule.getDatabase>;
  const createSchemaSpy = spyOn(schemaModule, "createSchema");
  let db: Knex<any, any[]> | null = null;
  beforeAll(() => {
    // console.log = mock();
    setDatabaseSpy = spyOn(dbModule, "setDatabase").mockImplementation(
      (_db: Knex<any, any[]> | null) => {
        db = _db;
        return _db;
      }
    );

    isDatabaseConfiguredSpy = spyOn(
      dbModule,
      "isDatabaseConfigured"
    ).mockImplementation(() => db !== null);
    getDatabaseSpy = spyOn(dbModule, "getDatabase").mockImplementation(
      () => db
    );
  });

  const log = console.log;
  afterEach(async () => {
    writeSpy.mockRestore();
    fileSpy.mockRestore();
    createSchemaSpy.mockRestore();
    console.log = log;
    db = null;
    //todo: figure out why this isn't working
    try {
      await unlink("/tmp/ws2/test.db");
    } catch (e) {}
  });
  afterAll(async () => {
    setDatabaseSpy.mockRestore();
    isDatabaseConfiguredSpy.mockRestore();
    getDatabaseSpy.mockRestore();
  });

  describe("Database Initialisation", () => {
    test("should initialise sqlite database and create file", async () => {
      expect(dbModule.isDatabaseConfigured()).toBe(false);
      await dbModule.initialiseDatabase("sqlite", "/tmp/ws2/test.db");
      expect(fileSpy).toHaveBeenCalledWith("/tmp/ws2/test.db");
      expect(writeSpy).toHaveBeenCalledWith("/tmp/ws2/test.db", "");
      expect(dbModule.isDatabaseConfigured()).toBe(true);
    });

    test("should initalise other database types without creating a file", async () => {
      expect(dbModule.isDatabaseConfigured()).toBe(false);

      createSchemaSpy.mockImplementation(async (_db: Knex<any, any[]>) => {});

      await dbModule.initialiseDatabase(
        "postgres",
        "postgres://localhost:5432/test"
      );

      expect(fileSpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();
      expect(dbModule.isDatabaseConfigured()).toBe(true);
      createSchemaSpy.mockRestore();
    });
  });

  describe("getDatabase", () => {
    test("should return null before initialisation", () => {
      expect(dbModule.getDatabase()).toBeNull();
    });

    test("Should return database instance after initalisation", async () => {
      await dbModule.initialiseDatabase("sqlite", ":memory:");
      expect(dbModule.getDatabase()).not.toBeNull();
      await dbModule.getDatabase()?.destroy();
    });
  });

  describe("isDatabaseConfigured", () => {
    test("should return false before initialisation", () => {
      expect(dbModule.isDatabaseConfigured()).toBe(false);
    });

    test("should return true after initialisation", async () => {
      await dbModule.initialiseDatabase("sqlite", "./test.db");
      expect(dbModule.isDatabaseConfigured()).toBe(true);
    });
  });
});
