import type { Knex } from "knex";

/** Ordered line items for an invoice. Amounts are computed in the service. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoice_line_items", (table) => {
    table.uuid("id").primary();
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("CASCADE");
    table.string("description", 200).notNullable();
    table.decimal("quantity", 12, 4).notNullable();
    table.decimal("unit_price", 12, 2).notNullable();
    table.integer("position").notNullable();
    table.index(["invoice_id", "position"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_line_items");
}
