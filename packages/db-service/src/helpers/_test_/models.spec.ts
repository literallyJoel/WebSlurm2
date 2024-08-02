import { getModelClass } from "../models";
import { initialiseDatabase, isDatabaseConfigured } from "../db";
import {
  describe,
  test,
  expect,
  afterAll,
  spyOn,
  beforeAll,
  afterEach,
  mock,
  Mock,
} from "bun:test";
import * as dbModule from "../db";
import { ModelName } from "@webslurm2/shared";
import UserModel from "../../models/UserModel";
import OrganisationModel from "../../models/OrganisationModel";
import OrganisationMemberModel from "../../models/OrganisationMemberModel";
import ConfigModel from "../../models/ConfigModel";
import WhitelistModel from "../../models/WhitelistModel";
import OAuthProviderModel from "../../models/OAuthProviderModel";
import type { Knex } from "knex";

describe("models", () => {
  const log = console.log;
  let setDatabaseSpy: Mock<typeof dbModule.setDatabase>;
  let isDatabaseConfiguredSpy: Mock<typeof dbModule.isDatabaseConfigured>;
  let getDatabaseSpy: Mock<typeof dbModule.getDatabase>;
  let db: Knex<any, any[]> | null = null;

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
    console.log = mock();
  });

  afterAll(async () => {
    console.log = log;
  });

  afterEach(() => {
    db = null;
  });
  test("returns null and errors if the database is not initialised", async () => {
    const errorSpy = spyOn(console, "error");
    expect(getModelClass("user")).toBeNull();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockReset();
  });

  test("Returns null if the model is not found", () => {
    expect(getModelClass("invalid" as ModelName)).toBeNull();
  });

  test("Returns the correct model class", async () => {
    await initialiseDatabase("sqlite", "/tmp/test.db");
    expect(getModelClass("user")).toBeInstanceOf(UserModel);
    expect(getModelClass("organisation")).toBeInstanceOf(OrganisationModel);
    expect(getModelClass("organisationMember")).toBeInstanceOf(
      OrganisationMemberModel
    );
    expect(getModelClass("config")).toBeInstanceOf(ConfigModel);
    expect(getModelClass("oAuthProvider")).toBeInstanceOf(OAuthProviderModel);
    expect(getModelClass("whitelist")).toBeInstanceOf(WhitelistModel);
    isDatabaseConfigured();
  });
});
