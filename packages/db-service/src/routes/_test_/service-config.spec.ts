import { describe, afterAll, mock, beforeAll, test, expect } from "bun:test";
import { app } from "../../index";
import { getDatabase, isDatabaseConfigured } from "../../helpers/db";
import { ErrorType } from "@webslurm2/shared";

beforeAll(async () => {
  isDatabaseConfigured();
  mock.module("@webslurm2/shared", () => ({
    restart: async () => {},
  }));
});
afterAll(async () => {
  const db = getDatabase();
  await db?.destroy();
  mock.restore();
});
describe("Service Config Routes", () => {
  test("Should initialise database configuration", async () => {
    mock.module("../../helpers/config", () => ({
      getRuntimeConfig: () => ({}),
      setRuntimeConfig: async () => {},
    }));
    const body = {
      dbType: "sqlite",
      connectionString: ":memory:",
      test: true,
    };

    const response = await app.handle(
      new Request(`${app.server?.url}service-config/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe(
      "Database configured successfully with type sqlite. Service will restart."
    );
    mock.restore();
  });

  test("Should return bad request if dbType and connectionString are already set", async () => {
    mock.module("../../helpers/config", () => ({
      getRuntimeConfig: () => ({
        dbType: "sqlite",
        connectionString: ":memory:",
      }),
      setRuntimeConfig: async () => {},
    }));
    const body = {
      dbType: "sqlite",
      connectionString: ":memory:",
      test: true,
    };

    const response = await app.handle(
      new Request(`${app.server?.url}service-config/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Bad request");
    mock.restore();
  });

  test("Should return error if invalid body is provided", async () => {
    mock.module("../../helpers/config", () => ({
      getRuntimeConfig: () => ({}),
      setRuntimeConfig: async () => {},
    }));
    const body = {
      dType: "sqlite",
      connectionStrin: ":memory:",
    };

    const response = await app.handle(
      new Request(`${app.server?.url}service-config/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Bad request");
    mock.restore();
  });

  test("Should return error if invalid dbType is provided", async () => {
    mock.module("../../helpers/config", () => ({
      getRuntimeConfig: () => ({}),
      setRuntimeConfig: async () => {},
    }));
    const body = {
      dbType: "invalid",
      connectionString: ":memory:",
    };

    const response = await app.handle(
      new Request(`${app.server?.url}service-config/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Bad request");
    mock.restore();
  });
});
