import type { Knex } from "knex";

/** Ordered custom fields. Hidden rows stay in the database for editor restore. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoice_custom_fields", (table) => {
    table.uuid("id").primary();
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("CASCADE");
    table.string("label", 80).notNullable();
    table.string("value", 500).notNullable().defaultTo("");
    table.boolean("visible").notNullable().defaultTo(true);
    table.integer("position").notNullable();
    table.index(["invoice_id", "position"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_custom_fields");
}
