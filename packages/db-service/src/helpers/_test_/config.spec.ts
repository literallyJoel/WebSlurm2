import { getRuntimeConfig, setRuntimeConfig } from "../config";
import {
  describe,
  expect,
  test,
  beforeAll,
  afterAll,
  mock,
  afterEach,
  Mock,
} from "bun:test";

describe("Runtime Config", () => {
  let originalEnv: NodeJS.ProcessEnv;
  const write = Bun.write;
  beforeAll(() => {
    originalEnv = process.env;
    //@ts-ignore
    Bun.write = mock<typeof Bun.write>();
  });

  afterEach(() => {
    (Bun.write as unknown as Mock<typeof Bun.write>).mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
    Bun.write = write;
    mock.restore();
  });

  test("it should return values from process.env when runtimeConfig is null", () => {
    //Reset the runtimeconfig from previous tests
    setRuntimeConfig("", "");
    const originalDBType = process.env.DB_TYPE;
    const originalConnectionString = process.env.DATABASE_CONNECTION_STRING;

    process.env.DB_TYPE = "sqlite";
    process.env.DATABASE_CONNECTION_STRING = ":memory:";

    const config = getRuntimeConfig();

    expect(config).toEqual({
      dbType: "sqlite",
      connectionString: ":memory:",
    });

    process.env.DB_TYPE = originalDBType;
    process.env.DATABASE_CONNECTION_STRING = originalConnectionString;
  });

  test("it should return values from runtimeConfig when it is set", () => {
    //Reset the runtimeconfig from previous tests
    setRuntimeConfig("", "");
    process.env.DB_TYPE = "sqlite";
    process.env.DATABASE_CONNECTION_STRING = ":memory:";

    const config = getRuntimeConfig();

    expect(config).toEqual({
      dbType: "sqlite",
      connectionString: ":memory:",
    });

    setRuntimeConfig("postgres", "postgres://localhost:5432/mydb");

    const newConfig = getRuntimeConfig();

    expect(newConfig).toEqual({
      dbType: "postgres",
      connectionString: "postgres://localhost:5432/mydb",
    });
  });

  test("it should set runtimeConfig and write to .env file", async () => {
    await setRuntimeConfig("postgres", "postgres://localhost:5432/mydb");

    console.log((Bun.write as unknown as Mock<typeof Bun.write>).mock.calls);
    expect(Bun.write).toHaveBeenCalledWith(
      ".env",
      `DATABASE_TYPE=postgres\nDATABASE_CONNECTION_STRING=postgres://localhost:5432/mydb\n`
    );
  });
});
