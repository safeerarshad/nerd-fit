import type { SQLiteDatabase } from 'expo-sqlite';
import type { SqlDatabase } from './types.ts';

// Every adapter made for the provider's connection shares this queue. Reads must
// queue too: otherwise they could observe an uncommitted transaction on it.
const queues = new WeakMap<SQLiteDatabase, Promise<unknown>>();

export function adaptExpo(raw: SQLiteDatabase): SqlDatabase {
  function queued<T>(operation: () => Promise<T>): Promise<T> {
    const result = (queues.get(raw) ?? Promise.resolve()).then(operation);
    queues.set(raw, result.catch(() => {}));
    return result;
  }
  const direct: SqlDatabase = {
    exec: sql => raw.execAsync(sql),
    run: (sql, ...params) => raw.runAsync(sql, ...params),
    first: <T>(sql: string, ...params: (string | number | null)[]) => raw.getFirstAsync<T>(sql, ...params),
    all: <T>(sql: string, ...params: (string | number | null)[]) => raw.getAllAsync<T>(sql, ...params),
    transaction: async () => { throw new Error('Nested transactions are not supported. Use the supplied transaction.'); },
  };
  return {
    exec: sql => queued(() => direct.exec(sql)),
    run: (sql, ...params) => queued(() => direct.run(sql, ...params)),
    first: <T>(sql: string, ...params: (string | number | null)[]) => queued(() => direct.first<T>(sql, ...params)),
    all: <T>(sql: string, ...params: (string | number | null)[]) => queued(() => direct.all<T>(sql, ...params)),
    transaction<T>(body: (tx: SqlDatabase) => Promise<T>): Promise<T> {
      return queued(async () => {
        // Foreign-key enforcement is connection-local and must be enabled before
        // BEGIN. Expo's exclusive helper opens another, unconfigured connection.
        await raw.execAsync('PRAGMA foreign_keys = ON;');
        await raw.execAsync('BEGIN IMMEDIATE');
        try {
          const result = await body(direct);
          await raw.execAsync('COMMIT');
          return result;
        } catch (error) {
          await raw.execAsync('ROLLBACK');
          throw error;
        }
      });
    },
  };
}
