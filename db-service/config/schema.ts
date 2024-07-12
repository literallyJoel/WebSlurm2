import { Knex } from "knex";
import { v4 } from "uuid";
import { COLOURS } from "../helpers/colours";
export const TABLE_NAMES = {
  user: "ws2_user",
  organisation: "ws2_organisation",
  organisationMember: "ws2_organisation_member",
};
export async function createSchema(knex: Knex) {
  //Create the users table
  if (!(await knex.schema.hasTable(TABLE_NAMES.user))) {
    await knex.schema.createTable(TABLE_NAMES.user, (table) => {
      table.string("id").primary().notNullable().defaultTo(v4());
      table.string("name").notNullable();
      table.string("email").notNullable().unique();
      table.timestamp("emailVerified");
      table.string("password").nullable();
      table.string("image");
      table.string("role").notNullable().defaultTo("user");
      table.boolean("requiresReset").defaultTo(false);
      table.timestamps(true, true);
    });
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
    console.log(
      `${COLOURS.blue}Table ${COLOURS.magenta}${TABLE_NAMES.organisationMember} ${COLOURS.blue}created${COLOURS.reset}`
    );
  }
}
