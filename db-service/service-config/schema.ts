import { Knex } from "knex";
import { v4 } from "uuid";
import { COLOURS } from "../helpers/colours";

export const TABLE_NAMES = {
  user: "ws2_user",
  organisation: "ws2_organisation",
  organisationMember: "ws2_organisation_member",
  config: "ws2_config",
  oAuthProviders: "ws2_oauth_providers",
};
export async function createSchema(knex: Knex) {
  let count = 0;
  //Create the users table
  if (!(await knex.schema.hasTable(TABLE_NAMES.user))) {
    await knex.schema.createTable(TABLE_NAMES.user, (table) => {
      table.string("id").primary().notNullable().defaultTo(v4());
      table.string("name").notNullable();
      table.string("email").notNullable().unique();
      table.boolean("emailVerified").defaultTo(false);
      table.string("password").nullable();
      table.string("image");
      table.string("role").notNullable().defaultTo("user");
      table.boolean("requiresReset").defaultTo(false);
      table.timestamps(true, true);
    });
    count++;
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.user} ${COLOURS.blue}created${COLOURS.reset}`
    );
  }

  //Create the organisations table
  if (!(await knex.schema.hasTable(TABLE_NAMES.organisation))) {
    await knex.schema.createTable(TABLE_NAMES.organisation, (table) => {
      table.string("id").primary().notNullable().defaultTo(v4());
      table.string("name").notNullable();
      table.timestamps(true, true);
    });
    count++;
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.organisation} ${COLOURS.blue}created${COLOURS.reset}`
    );
  }

  //Create the organisation members table
  if (!(await knex.schema.hasTable(TABLE_NAMES.organisationMember))) {
    await knex.schema.createTable(TABLE_NAMES.organisationMember, (table) => {
      table
        .string("organisationId")
        .notNullable()
        .references("ws2_organisations.id");
      table.string("userId").notNullable().references("ws2_users.id");
      table.string("role").notNullable().defaultTo("user");
      table.timestamps(true, true);
    });
    count++;
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.organisationMember} ${COLOURS.blue}created${COLOURS.reset}`
    );
  }

  //Create the config table
  if (!(await knex.schema.hasTable(TABLE_NAMES.config))) {
    await knex.schema.createTable(TABLE_NAMES.config, (table) => {
      table.string("key").primary().notNullable();
      table.string("value").notNullable();
      table.timestamps(true, true);
    });
    count++;
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.config} ${COLOURS.blue}created${COLOURS.reset}`
    );
    //Insert isSetup into the config table
    await knex(TABLE_NAMES.config).insert({
      key: "setupComplete",
      value: "false",
    });
  }

  if (!(await knex.schema.hasTable(TABLE_NAMES.oAuthProviders))) {
    await knex.schema.createTable(TABLE_NAMES.oAuthProviders, (table) => {
      table.string("name").primary().notNullable();
      table.string("requiredFields").notNullable();
      table.string("optionalFields").nullable();
    });

    count++;
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.oAuthProviders} ${COLOURS.blue}created${COLOURS.reset}`
    );
  }

  if (count !== 0) {
    console.log(
      `${COLOURS.blue}Schema ${
        count === Object.keys(TABLE_NAMES).length ? "created" : "updated"
      } succesfully${COLOURS.reset}`
    );
  }
}
