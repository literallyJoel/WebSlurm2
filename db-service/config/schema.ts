import { Knex } from "knex";
import { v4 } from "uuid";

export async function createSchema(knex: Knex) {
  //Create the users table
  if (!(await knex.schema.hasTable("ws2_users"))) {
    await knex.schema.createTable("ws2_users", (table) => {
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
    console.log("Table users created");
  }

  //Create the organisations table
  if (!(await knex.schema.hasTable("ws2_organisations"))) {
    await knex.schema.createTable("ws2_organisation", (table) => {
      table.string("id").primary().notNullable().defaultTo(v4());
      table.string("name").notNullable();
      table.timestamps(true, true);
    });
  }

  //Create the organisation members table
  if(!(await knex.schema.hasTable("ws2_organisation_members"))){
    await knex.schema.createTable("ws2_organisation_members", (table) => {
      table.string("organisationId").notNullable().references("ws2_organisations.id");
      table.string("userId").notNullable().references("ws2_users.id");
      table.string("role").notNullable().defaultTo("user");
      table.timestamps(true, true);
    })
  }
}
