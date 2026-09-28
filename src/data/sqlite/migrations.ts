import type { Migration, SqlDatabase } from './types.ts';
import { onboardingMigration } from './onboardingMigration.ts';
import { journalMigration } from './journalMigration.ts';

export const migrations: Migration[] = [{
  version: 1,
  sql: `
    CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE audit_events (
      id INTEGER PRIMARY KEY,
      kind TEXT NOT NULL,
      entity_id TEXT,
      occurred_at INTEGER NOT NULL
    );
    CREATE INDEX audit_events_time ON audit_events(occurred_at);
  `,
}, onboardingMigration, journalMigration];

export async function migrate(db: SqlDatabase, steps = migrations): Promise<void> {
  await db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const row = await db.first<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  const latest = steps.at(-1)?.version ?? 0;
  if (current > latest) throw new Error('Database is newer than this app. Update the app before opening it.');
  const pending = steps.filter((step) => step.version > current);
  if (pending.some((step, index) => step.version !== current + index + 1)) {
    throw new Error('Invalid migration sequence');
  }
  if (pending.length === 0) return;
  await db.transaction(async (tx) => {
    for (const step of pending) {
      await tx.exec(step.sql);
      await tx.exec(`PRAGMA user_version = ${step.version}`);
    }
  });
}
