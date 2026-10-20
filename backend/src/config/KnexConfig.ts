import path from "node:path";
import type { Knex } from "knex";
import { env } from "./Env";

export const knexConfig: Knex.Config = {
  client: "pg",
  connection: env.databaseUrl,
  pool: { min: env.databasePoolMin, max: env.databasePoolMax },
  migrations: {
    directory: path.join(__dirname, "../database/migrations"),
    extension: "ts",
    loadExtensions: [".ts"],
  },
};
