import { describe, expect, test } from "bun:test";
import { getDbConfig } from "../database";


describe("getDbConfig Function", () => {
  test("should return correct config for SQLite", () => {
    const dbType = "sqlite";
    const connectionString = ":memory:";
    const expectedConfig = {
      client: "sqlite3",
      connection: {
        filename: connectionString,
      },
      useNullAsDefault: true,
    };

    const config = getDbConfig(dbType, connectionString);
    expect(config).toEqual(expectedConfig);
  });

  test("should return correct config for PostgreSQL", () => {
    const dbType = "postgres";
    const connectionString = "postgres://user:password@localhost:5432/mydb";
    const expectedConfig = {
      client: dbType,
      connection: {
        connectionString,
      },
      useNullAsDefault: true,
    };

    const config = getDbConfig(dbType, connectionString);
    expect(config).toEqual(expectedConfig);
  });

  test("should return correct config for SQL Server", () => {
    const dbType = "mssql";
    const connectionString =
      "sqlserver://user:password@localhost:1433;database=mydb";
    const expectedConfig = {
      client: dbType,
      connection: {
        connectionString,
      },
      useNullAsDefault: true,
    };

    const config = getDbConfig(dbType, connectionString);
    expect(config).toEqual(expectedConfig);
  });

  test("should return correct config for OracleDB", () => {
    const dbType = "oracledb";
    const connectionString = "oracledb://user:password@localhost:1521/mydb";
    const expectedConfig = {
      client: dbType,
      connection: {
        connectionString,
      },
      useNullAsDefault: true,
    };

    const config = getDbConfig(dbType, connectionString);
    expect(config).toEqual(expectedConfig);
  });

  test("should throw error for unsupported db type", () => {
    const dbType = "unsupported_db";
    const connectionString = "some_connection_string";
    expect(() => getDbConfig(dbType, connectionString)).toThrow(
      `Unsupported database type: ${dbType}`
    );
  });
});
