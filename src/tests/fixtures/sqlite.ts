import { DatabaseSync } from 'node:sqlite';
import type { SqlDatabase, SqlValue } from '../../data/sqlite/types.ts';

export function testDatabase(path = ':memory:') {
  const raw = new DatabaseSync(path);
  const db: SqlDatabase = {
    async exec(sql) { raw.exec(sql); },
    async run(sql, ...values: SqlValue[]) {
      const result = raw.prepare(sql).run(...values);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async first<T>(sql: string, ...values: SqlValue[]) {
      return (raw.prepare(sql).get(...values) as T | undefined) ?? null;
    },
    async all<T>(sql: string, ...values: SqlValue[]) { return raw.prepare(sql).all(...values) as T[]; },
    async transaction<T>(body: (tx: SqlDatabase) => Promise<T>) {
      raw.exec('BEGIN IMMEDIATE');
      try { const result = await body(db); raw.exec('COMMIT'); return result; }
      catch (error) { raw.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, close: () => raw.close() };
}
