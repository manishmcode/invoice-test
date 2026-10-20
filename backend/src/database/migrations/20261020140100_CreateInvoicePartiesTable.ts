import type { Knex } from "knex";

/** One from-party and one to-party per invoice. Role is from | to. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoice_parties", (table) => {
    table.uuid("id").primary();
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("CASCADE");
    table.string("role", 8).notNullable();
    table.string("name", 120).notNullable();
    table.text("address").notNullable();
    table.string("email", 254).notNullable();
    table.string("phone", 40).notNullable().defaultTo("");
    table.unique(["invoice_id", "role"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_parties");
}
