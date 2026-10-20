import type { Knex } from "knex";

/** Files attached to an invoice. Bytes live on disk; this table stores the path. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoice_attachments", (table) => {
    table.uuid("id").primary();
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("CASCADE");
    table.string("file_name", 180).notNullable();
    table.string("mime_type", 127).notNullable();
    table.integer("size_bytes").notNullable();
    table.string("storage_path", 500).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable();
    table.index(["invoice_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_attachments");
}
