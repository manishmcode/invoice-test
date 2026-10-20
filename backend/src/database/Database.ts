/**
 * Knex instance and connection pool. Schema is owned by migrations — this
 * file never inspects or creates tables. connectDatabase only pings the pool.
 */
import knex, { type Knex } from "knex";
import { knexConfig } from "../config/KnexConfig";

export type DatabaseClient = Knex | Knex.Transaction;

export const database = knex(knexConfig);

/** Fail closed: throw if the pool cannot run a query. */
export async function connectDatabase(): Promise<void> {
  await database.raw("SELECT 1");
}

export async function disconnectDatabase(): Promise<void> {
  await database.destroy();
}
