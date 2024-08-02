import * as shared from "@webslurm2/shared";
import {
  getUserById,
  getUserByEmail,
  createInitial,
  createUser,
  updateUser,
} from "../users";

import {
  describe,
  beforeAll,
  afterAll,
  spyOn,
  test,
  expect,
  Mock,
} from "bun:test";

describe("User database functions", () => {
  let querySpy: Mock<any>;
  let handleErrorSpy: Mock<any>;
  let transactionSpy: Mock<any>;
  beforeAll(() => {
    querySpy = spyOn(shared, "dbQuery");
    handleErrorSpy = spyOn(shared, "handleError");
    transactionSpy = spyOn(shared, "dbTransaction");
  });

  afterAll(() => {
    querySpy.mockRestore();
    handleErrorSpy.mockRestore();
  });

  describe("getUserById", () => {
    test("should return a user when the user exists", async () => {
      const mockUser = {
        id: "testId",
        name: "testName",
        email: "test@example.com",
        role: "user" as "user" | "admin",
      };

      querySpy.mockImplementationOnce(async () => mockUser);

      const result = await getUserById("testId");

      expect(result).toEqual(mockUser);
      expect(querySpy).toHaveBeenCalledWith("user", "getOne", { id: "testId" });
    });

    test("should return undefined when the user is not found", async () => {
      querySpy.mockImplementationOnce(async () => null);

      const result = await getUserById("testId");

      expect(result).toBeUndefined();
      expect(querySpy).toHaveBeenCalledWith("user", "getOne", { id: "testId" });
    });

    test("Should handle error and return undefined when an error occurs", async () => {
      querySpy.mockImplementationOnce(async () => {
        throw new Error("test error");
      });

      expect(await getUserById("testId")).toBeUndefined();
      expect(handleErrorSpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalledWith("user", "getOne", { id: "testId" });
    });
  });

  describe("getUserByEmail", () => {
    test("should return a user when the user exists", async () => {
      const mockUser = {
        id: "testId",
        name: "testName",
        email: "test@example.com",
        role: "user" as "user" | "admin",
        password: "testPassword",
        requiresReset: false,
      };

      querySpy.mockImplementationOnce(async () => mockUser);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(querySpy).toHaveBeenCalledWith("user", "getUserByEmail", {
        email: "test@example.com",
      });
    });

    test("should return undefined when the user is not found", async () => {
      querySpy.mockImplementationOnce(async () => null);

      const result = await getUserByEmail("test@example.com");

      expect(result).toBeUndefined();
      expect(querySpy).toHaveBeenCalledWith("user", "getUserByEmail", {
        email: "test@example.com",
      });
    });

    test("Should handle error and return undefined when an error occurs", async () => {
      querySpy.mockImplementationOnce(async () => {
        throw new Error("test error");
      });

      expect(await getUserByEmail("test@example.com")).toBeUndefined();
      expect(handleErrorSpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalledWith("user", "getUserByEmail", {
        email: "test@example.com",
      });
    });
  });

  describe("createInitial", () => {
    test("should create initial user, organisation, and membership", async () => {
      const mockResult = {
        user: [{ id: "1", email: "test@example.com" }],
        organisation: [{ id: "2", name: "Test Org" }],
        organisationMember: [{ role: "admin" as "admin" | "user" }],
      };

      transactionSpy.mockImplementationOnce(async () => mockResult);

      const input = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        organisationName: "Test Org",
      };

      const result = await createInitial(input);

      //@ts-ignore it complains about the type of user and I'm not really sure why
      expect(result).toEqual(mockResult);

      expect(transactionSpy).toHaveBeenCalledWith([
        {
          order: 1,
          model: "user",
          operation: "create",
          params: {
            email: "test@example.com",
            name: "Test User",
            password: "password123",
            role: "admin",
          },
          resultKey: "user",
          return: ["id"],
        },
        {
          order: 2,
          model: "organisation",
          operation: "create",
          params: {
            name: "Test Org",
          },
          resultKey: "organisation",
          return: ["id"],
        },
        {
          order: 3,
          model: "organisationMember",
          operation: "create",
          params: {
            organisationId: { $ref: "organisation", field: "id" },
            userId: { $ref: "user", field: "id" },
            role: "admin",
          },
          return: ["role"],
        },
      ]);
    });
  });

  describe("createUser", () => {
    test("should create a user", async () => {
      const mockUser = {
        id: "testId",
        name: "testName",
        email: "test@example.com",
        role: "user" as "user" | "admin",
      };

      const input = {
        email: "test@example.com",
        name: "Test User",
        role: "user" as "user" | "admin",
        organisationId: "1",
        organisationRole: "user" as "user" | "admin" | "moderator",
        password: "password123",
      };

      querySpy.mockImplementationOnce(async () => mockUser);

      const result = await createUser(input);

      expect(result).toEqual(mockUser);
      expect(querySpy).toHaveBeenCalledWith("user", "create", input);
    });
  });

  describe("updateUser", () => {
    test("should update an existing user", async () => {
      const mockUpdatedUser = {
        id: "1",
        email: "updated@example.com",
        name: "Updated User",
        role: "admin" as "user" | "admin",
      };

      querySpy.mockImplementationOnce(async () => mockUpdatedUser);

      const result = await updateUser(mockUpdatedUser);
      expect(result).toEqual(mockUpdatedUser);
      expect(querySpy).toHaveBeenCalledWith("user", "update", mockUpdatedUser);
    });
  });
});
