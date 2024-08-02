import {
  describe,
  expect,
  test,
  beforeAll,
  afterAll,
  mock,
  Mock,
  spyOn,
  afterEach,
} from "bun:test";

import { app } from "..";
import * as dbModule from "../helpers/db";
import { initialiseDatabase } from "../helpers/db";
import { Knex } from "knex";

describe("db_service", () => {
  let db: Knex<any, any[]> | null;
  let setDatabaseSpy: Mock<typeof dbModule.setDatabase>;
  let isDatabaseConfiguredSpy: Mock<typeof dbModule.isDatabaseConfigured>;
  let getDatabaseSpy: Mock<typeof dbModule.getDatabase>;
  beforeAll(async () => {
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

  afterEach(() => {
    db = null;
  });

  afterAll(async () => {
    await db?.destroy();
    setDatabaseSpy.mockRestore();
    isDatabaseConfiguredSpy.mockRestore();
    getDatabaseSpy.mockRestore();
  });
  test("should respond to ping", async () => {
    await initialiseDatabase("sqlite", ":memory:");
    const response = await app.handle(new Request(`${app.server?.url}ping`));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("pong");
  });

  test("should handle a query operation", async () => {
    await initialiseDatabase("sqlite", ":memory:");
    const body = {
      model: "user",
      operation: "getAll",
      params: {},
    };

    const response = await app.handle(
      new Request(`${app.server?.url}query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toBeInstanceOf(Array);
  });

  test("Should handle a transaction operation", async () => {
    await initialiseDatabase("sqlite", ":memory:");
    const body = {
      operations: [
        {
          order: 1,
          model: "user",
          operation: "create",
          params: { name: "Amber", email: "amber@example.com" },
          resultKey: "user1",
          return: ["email", "id"],
        },
        {
          order: 2,
          model: "organisation",
          operation: "create",
          params: { name: "ACME Inc." },
          resultKey: "organisation",
          return: ["id"],
        },
      ],
    };

    const response = await app.handle(
      new Request(`${app.server?.url}transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.user).toBeTruthy();
    expect(json.organisation).toBeTruthy();
  });

  test("Should return an error if database is not configured", async () => {
    const response = await app.handle(
      new Request(`${app.server?.url}query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "user",
          operation: "getAll",
          params: {},
        }),
      })
    );
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Internal server error");
    mock.restore();
  });
});
