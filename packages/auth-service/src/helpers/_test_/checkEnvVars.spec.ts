import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  Mock,
  mock,
  spyOn,
  test,
} from "bun:test";
import checkEnvVars from "../checkEnvVars";

describe("checkEnvVars", () => {
  let originalEnv: typeof process.env;
  let exitSpy: Mock<any>;
  let errorSpy: Mock<any>;
  beforeAll(() => {
    originalEnv = process.env;
    //@ts-ignore - TS tries to enforce the return being never.
    exitSpy = spyOn(process, "exit").mockImplementation(() => {});
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("should not exit when all required env vars are set", () => {
    process.env.JWT_SECRET = "secret";
    process.env.CORE_SERVICE_URL = "url";

    checkEnvVars();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("should exit and log an error when JWT_SECRET is not set", () => {
    delete process.env.JWT_SECRET;
    checkEnvVars();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  test("should exit and log an error when CORE_SERVICE_URL is not set", () => {
    delete process.env.CORE_SERVICE_URL;
    checkEnvVars();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });
});
