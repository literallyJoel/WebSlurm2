import allowedDbTypes from "../../constants/allowedDbTypes";
import { checkEnvVars } from "../checkEnvVars";
import {
  describe,
  expect,
  mock,
  test,
  spyOn,
  beforeAll,
  afterAll,
} from "bun:test";
describe("checkEnvVars Function", () => {
  let dbType: string | undefined;
  beforeAll(() => {
    process.exit = mock<typeof process.exit>();
    dbType = process.env.DB_TYPE;
    //We do this so we don't get a bunch of errors in the console during testing
    console.error = mock<typeof console.error>();
  });

  afterAll(() => {
    process.env.DB_TYPE = dbType;
    mock.restore();
  });
  test("should not exit if DB_TYPE is a valid value", () => {
    process.env.DB_TYPE = allowedDbTypes[0];
    const exitMock = spyOn(process, "exit");
    expect(exitMock).toHaveBeenCalledTimes(0);
  });

  test("should exit with an error if DB_TYPE is invalid", () => {
    // Simulate an invalid DB_TYPE
    process.env.DB_TYPE = "invalid_db_type";
    const exitMock = spyOn(process, "exit");

    checkEnvVars();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("DB_TYPE is not set to a valid value."),
      expect.stringContaining(allowedDbTypes.join(", "))
    );
    expect(exitMock).toHaveBeenCalledWith(1);

    exitMock.mockRestore();
  });

  test("should not exit if DB_TYPE is not set", () => {
    // Simulate DB_TYPE not being set
    delete process.env.DB_TYPE;
    let exitMock = spyOn(process, "exit");

    checkEnvVars();

    expect(exitMock).not.toHaveBeenCalled();
    exitMock.mockRestore();
  });
});
