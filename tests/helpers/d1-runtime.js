import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

/**
 * Apply the repository's versioned D1 migrations to the isolated test DB.
 * Workers Vitest provisions a fresh binding per test file, so callers can
 * safely use this helper in beforeAll without leaking state between files.
 */
export async function applyTestMigrations(
  database = env.DB,
  migrations = env.TEST_MIGRATIONS
) {
  if (!migrations) {
    throw new Error('TEST_MIGRATIONS binding is required for D1 tests');
  }
  await applyD1Migrations(database, migrations);
  return database;
}

export function getTestDatabase() {
  return env.DB;
}
