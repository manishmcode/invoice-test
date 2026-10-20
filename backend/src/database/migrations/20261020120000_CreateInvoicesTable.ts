import type { Knex } from "knex";

/** First schema change: invoices table with a JSON payload column. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoices", (table) => {
    table.uuid("id").primary();
    table.jsonb("payload").notNullable();
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoices");
}
