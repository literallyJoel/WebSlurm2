import * as shared from "@webslurm2/shared";
import { getConfigItem } from "../config";
import {
  spyOn,
  beforeAll,
  Mock,
  afterAll,
  describe,
  test,
  expect,
} from "bun:test";

describe("getConfigItem", () => {
  let querySpy: Mock<any>;
  let handleErrorSpy: Mock<any>;
  beforeAll(() => {
    querySpy = spyOn(shared, "dbQuery");
    handleErrorSpy = spyOn(shared, "handleError");
  });

  afterAll(() => {
    querySpy.mockRestore();
  });

  test("should return a config item when it exists", async () => {
    querySpy.mockImplementationOnce(async () => ({
      key: "testKey",
      value: "testValue",
    }));

    const result = await getConfigItem("testKey");
    expect(result).toEqual({ key: "testKey", value: "testValue" });
    expect(querySpy).toHaveBeenCalledWith("config", "getOne", {
      key: "testKey",
    });
  });

  test("should return undefined when the config item does not exists", async () => {
    querySpy.mockImplementationOnce(async () => null);
    const result = await getConfigItem("testKey");
    expect(result).toBeUndefined();
    expect(querySpy).toHaveBeenCalledWith("config", "getOne", {
      key: "testKey",
    });
  });

  test("should handle error and return undefined when query fails", async () => {
    querySpy.mockImplementationOnce(async () => {
      throw new Error("test error");
    });
    expect(await getConfigItem("testKey")).toBeUndefined();
    expect(handleErrorSpy).toHaveBeenCalled();
    expect(querySpy).toHaveBeenCalledWith("config", "getOne", {
      key: "testKey",
    });
  });
});
