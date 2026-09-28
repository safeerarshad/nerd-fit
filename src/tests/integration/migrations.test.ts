import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate, migrations } from '../../data/sqlite/migrations.ts';
import { testDatabase } from '../fixtures/sqlite.ts';

test('fresh database persists settings through migration rerun and physical reopen', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nerdfit-test-'));
  const path = join(dir, 'test.db');
  let connection = testDatabase(path);
  try {
    await migrate(connection.db);
    await connection.db.run('INSERT INTO settings(key,value) VALUES (?,?)', 'units', 'kg');
    await migrate(connection.db);
    connection.close();
    connection = testDatabase(path);
    await migrate(connection.db);
    assert.equal((await connection.db.first<{ value: string }>('SELECT value FROM settings WHERE key=?', 'units'))?.value, 'kg');
    assert.equal((await connection.db.first<{ user_version: number }>('PRAGMA user_version'))?.user_version, migrations.at(-1)!.version);
  } finally { connection.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('failed migration rolls back schema and version without deleting existing data', async () => {
  const { db, close } = testDatabase();
  try {
    await migrate(db);
    await db.run('INSERT INTO settings VALUES (?,?)', 'keep', 'yes');
    await assert.rejects(migrate(db, [...migrations, { version: migrations.at(-1)!.version + 1, sql: 'CREATE TABLE damaged(id INTEGER); INVALID SQL;' }]));
    assert.equal((await db.first<{ user_version: number }>('PRAGMA user_version'))?.user_version, migrations.at(-1)!.version);
    assert.equal(await db.first("SELECT name FROM sqlite_master WHERE name='damaged'"), null);
    assert.equal((await db.first<{ value: string }>("SELECT value FROM settings WHERE key='keep'"))?.value, 'yes');
  } finally { close(); }
});

test('newer database and out-of-order migrations are rejected without downgrade', async () => {
  const { db, close } = testDatabase();
  try {
    await db.exec('PRAGMA user_version=99');
    await assert.rejects(migrate(db), /newer/i);
    assert.equal((await db.first<{ user_version: number }>('PRAGMA user_version'))?.user_version, 99);
    await db.exec('PRAGMA user_version=0');
    await assert.rejects(migrate(db, [{ version: 2, sql: 'SELECT 1;' }]), /sequence/i);
  } finally { close(); }
});

test('boot enables foreign keys and proves FTS5 capability', async () => {
  const { db, close } = testDatabase();
  try {
    await migrate(db);
    await db.exec('CREATE TABLE parent(id TEXT PRIMARY KEY); CREATE TABLE child(parent_id TEXT REFERENCES parent(id));');
    await assert.rejects(db.run('INSERT INTO child VALUES (?)', 'missing'), /FOREIGN KEY/);
    await db.exec('CREATE VIRTUAL TABLE temp.search_probe USING fts5(name);');
    await db.run('INSERT INTO search_probe(name) VALUES (?)', 'cooked rice');
    assert.equal((await db.all('SELECT name FROM search_probe WHERE search_probe MATCH ?', 'rice')).length, 1);
  } finally { close(); }
});
