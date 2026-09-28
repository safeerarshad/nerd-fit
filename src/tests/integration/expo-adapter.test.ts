import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SQLiteDatabase } from 'expo-sqlite';
import { adaptExpo } from '../../data/sqlite/expoAdapter.ts';
import { migrate } from '../../data/sqlite/migrations.ts';
import { logFood } from '../../data/repositories/journal.ts';

// Native calls are bridged to real SQLite. Like Expo, the legacy exclusive API
// opens a separate connection with connection-local foreign keys disabled.
function connection(path: string) {
  const sqlite = new DatabaseSync(path, { enableForeignKeyConstraints: false });
  const native = {
    async execAsync(sql: string) { sqlite.exec(sql); },
    async runAsync(sql: string, ...params: (string | number | null)[]) {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]) { return (sqlite.prepare(sql).get(...params) ?? null) as T | null; },
    async getAllAsync<T>(sql: string, ...params: (string | number | null)[]) { return sqlite.prepare(sql).all(...params) as T[]; },
    async withExclusiveTransactionAsync(body: (tx: SQLiteDatabase) => Promise<void>) {
      const child = connection(path);
      try {
        await child.raw.execAsync('BEGIN');
        await body(child.raw);
        await child.raw.execAsync('COMMIT');
      } catch (error) { await child.raw.execAsync('ROLLBACK'); throw error; }
      finally { child.close(); }
    },
  };
  return { raw: native as unknown as SQLiteDatabase, close: () => sqlite.close() };
}
function deferred() { let resolve!: () => void; const promise = new Promise<void>(r => { resolve = r; }); return { promise, resolve }; }

test('transaction food writes enforce profile foreign keys on the actual connection', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'nerdfit-adapter-'));
  const native = connection(join(directory, 'test.db'));
  try {
    const db = adaptExpo(native.raw);
    await migrate(db);
    await assert.rejects(logFood(db, { id: 'orphan', name: 'Meal', quantityLabel: '1 bowl', kcal: 100, protein: 0, carbs: 25, fat: 0, occurredAt: Date.parse('2026-09-25T12:00:00Z'), timeZone: 'UTC' }), /foreign key/i);
    assert.equal((await db.first<{ count: number }>('SELECT count(*) AS count FROM food_entries'))?.count, 0);
    assert.equal((await db.first<{ count: number }>('SELECT count(*) AS count FROM audit_events'))?.count, 0);
  } finally { native.close(); rmSync(directory, { recursive: true }); }
});

test('adapters sharing one connection queue outside writes until rollback then remain usable', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'nerdfit-queue-'));
  const native = connection(join(directory, 'test.db'));
  const entered = deferred(); const release = deferred();
  try {
    const first = adaptExpo(native.raw); const second = adaptExpo(native.raw);
    await first.exec('PRAGMA journal_mode=WAL; CREATE TABLE events (name TEXT NOT NULL)');
    const transaction = first.transaction(async tx => {
      await tx.run('INSERT INTO events VALUES (?)', 'rollback');
      entered.resolve(); await release.promise;
      throw new Error('intentional rollback');
    });
    const failed = assert.rejects(transaction, /intentional rollback/);
    await entered.promise;
    const outside = second.run('INSERT INTO events VALUES (?)', 'outside');
    // Attach error handler immediately: old separate-connection writes lock here.
    const outsideResult = outside.then(() => null, error => error);
    release.resolve(); await failed;
    assert.equal(await outsideResult, null);
    assert.deepEqual((await first.all<{ name: string }>('SELECT name FROM events')).map(row => row.name), ['outside']);
    assert.equal(await second.transaction(async tx => (await tx.first<{ count: number }>('SELECT count(*) AS count FROM events'))!.count), 1);
  } finally { release.resolve(); native.close(); rmSync(directory, { recursive: true }); }
});
