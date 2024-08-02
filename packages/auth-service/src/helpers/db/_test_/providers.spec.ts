import * as shared from "@webslurm2/shared";
import { getEnabledProviders } from "../providers";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  Mock,
  spyOn,
  test,
} from "bun:test";

describe("getEnabledProviders", () => {
  let querySpy: Mock<any>;
  let handleErrorSpy: Mock<any>;
  beforeAll(() => {
    querySpy = spyOn(shared, "dbQuery");
    handleErrorSpy = spyOn(shared, "handleError");
  });

  afterAll(() => {
    querySpy.mockRestore();
  });

  test("should return an empty array when there are no providers", async () => {
    querySpy.mockImplementationOnce(async () => null);

    const result = await getEnabledProviders();
    expect(result).toEqual([]);
    expect(querySpy).toHaveBeenCalledWith("oAuthProvider", "getAll", {});
  });

  test("should correctly parse and return enabled providers", async () => {
    querySpy.mockImplementationOnce(async () => [
      {
        name: "provider1",
        requiredFields: `["field1", "field2"]`,
        optionalFields: `["optionalField1"]`,
      },
      {
        name: "provider2",
        requiredFields: `["field3"]`,
        optionalFields: null,
      },
    ]);

    const result = await getEnabledProviders();

    expect(result).toEqual([
      {
        name: "provider1",
        requiredFields: ["field1", "field2"],
        optionalFields: ["optionalField1"],
      },
      {
        name: "provider2",
        requiredFields: ["field3"],
        optionalFields: undefined,
      },
    ]);

    expect(querySpy).toHaveBeenCalledWith("oAuthProvider", "getAll", {});
  });

  test("should handle error and return an empty array if a query fails", async () => {
    querySpy.mockImplementationOnce(async () => {
      throw new Error("test error");
    });
    expect(await getEnabledProviders()).toEqual([]);
    expect(handleErrorSpy).toHaveBeenCalled();
    expect(querySpy).toHaveBeenCalledWith("oAuthProvider", "getAll", {});
  });

  test("should handle error and return an empty array if invalid JSON is provided", async () => {
    querySpy.mockImplementationOnce(async () => [
      {
        name: "provider1",
        requiredFields: "invalid json",
        optionalFields: null,
      },
    ]);
    expect(await getEnabledProviders()).toEqual([]);
    expect(handleErrorSpy).toHaveBeenCalled();
    expect(querySpy).toHaveBeenCalledWith("oAuthProvider", "getAll", {});
  })
});
