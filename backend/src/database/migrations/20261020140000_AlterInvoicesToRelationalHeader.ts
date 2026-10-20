import type { Knex } from "knex";

/** Replace the JSON payload column with a real invoice header. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("invoices", (table) => {
    table.string("number", 40).notNullable().defaultTo("");
    table.date("issue_date").notNullable().defaultTo("1970-01-01");
    table.date("due_date").notNullable().defaultTo("1970-01-01");
    table.text("notes").notNullable().defaultTo("");
    table.decimal("discount_amount", 12, 2).notNullable().defaultTo(0);
    table.decimal("tax_rate_percent", 6, 3).notNullable().defaultTo(0);
    table.decimal("subtotal", 12, 2).notNullable().defaultTo(0);
    table.decimal("tax_amount", 12, 2).notNullable().defaultTo(0);
    table.decimal("grand_total", 12, 2).notNullable().defaultTo(0);
  });

  const hasCamelCreatedAt = await knex.schema.hasColumn("invoices", "createdAt");
  if (hasCamelCreatedAt) {
    await knex.schema.alterTable("invoices", (table) => {
      table.renameColumn("createdAt", "created_at");
      table.renameColumn("updatedAt", "updated_at");
    });
  }

  const hasPayload = await knex.schema.hasColumn("invoices", "payload");
  if (hasPayload) {
    await knex.schema.alterTable("invoices", (table) => {
      table.dropColumn("payload");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasPayload = await knex.schema.hasColumn("invoices", "payload");
  if (!hasPayload) {
    await knex.schema.alterTable("invoices", (table) => {
      table.jsonb("payload").notNullable().defaultTo("{}");
    });
  }

  await knex.schema.alterTable("invoices", (table) => {
    table.dropColumn("number");
    table.dropColumn("issue_date");
    table.dropColumn("due_date");
    table.dropColumn("notes");
    table.dropColumn("discount_amount");
    table.dropColumn("tax_rate_percent");
    table.dropColumn("subtotal");
    table.dropColumn("tax_amount");
    table.dropColumn("grand_total");
  });

  const hasSnakeCreatedAt = await knex.schema.hasColumn("invoices", "created_at");
  if (hasSnakeCreatedAt) {
    await knex.schema.alterTable("invoices", (table) => {
      table.renameColumn("created_at", "createdAt");
      table.renameColumn("updated_at", "updatedAt");
    });
  }
}
