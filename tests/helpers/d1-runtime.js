import { applyD1Migrations, env } from 'cloudflare:test';
import { readD1Migrations } from '@cloudflare/vitest-plugin';

const DEFAULT_MIGRATIONS_PATH = 'migrations';

/**
 * Apply the repository's versioned D1 migrations to the isolated test DB.
 * Workers Vitest provisions a fresh binding per test file, so callers can
 * safely use this helper in beforeAll without leaking state between files.
 */
export async function applyTestMigrations(
  database = env.DB,
  migrationsPath = DEFAULT_MIGRATIONS_PATH
) {
  const migrations = await readD1Migrations(migrationsPath);
  await applyD1Migrations(database, migrations);
  return database;
}

export function getTestDatabase() {
  return env.DB;
}

export { DEFAULT_MIGRATIONS_PATH };
