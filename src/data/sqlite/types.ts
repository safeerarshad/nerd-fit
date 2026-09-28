export type SqlValue = string | number | null;
export interface SqlDatabase {
  exec(sql: string): Promise<void>;
  run(sql: string, ...values: SqlValue[]): Promise<{ changes: number; lastInsertRowId: number }>;
  first<T>(sql: string, ...values: SqlValue[]): Promise<T | null>;
  all<T>(sql: string, ...values: SqlValue[]): Promise<T[]>;
  transaction<T>(body: (tx: SqlDatabase) => Promise<T>): Promise<T>;
}
export interface Migration { version: number; sql: string }
