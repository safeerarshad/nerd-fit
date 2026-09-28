import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { testDatabase } from '../fixtures/sqlite.ts';
import { migrate, migrations } from '../../data/sqlite/migrations.ts';
import { onboardingMigration } from '../../data/sqlite/onboardingMigration.ts';
import { journalMigration } from '../../data/sqlite/journalMigration.ts';
import { completeOnboarding, getProfile } from '../../data/repositories/profile.ts';
import { logFood, listFood, dayTotals, undoFood, logWeight, undoWeight, listWeights, latestWeight, setDayStatus, getDayStatus, getSetting, setSetting } from '../../data/repositories/journal.ts';
import type { FoodInput } from '../../data/repositories/journal.ts';

const now = Date.parse('2026-09-23T20:00:00Z');
const food: FoodInput = { id: 'food-1', name: 'Home meal', quantityLabel: '1 plate', kcal: 500, protein: 25, carbs: 55, fat: 20, occurredAt: now, timeZone: 'Asia/Kolkata' };
async function setup(db: ReturnType<typeof testDatabase>['db']) {
  await migrate(db, [...migrations.filter(m => m.version < 2), onboardingMigration, journalMigration]);
  await completeOnboarding(db, {
    age: 30, heightCm: 180, weightKg: 80, equation: 'male', units: 'metric', diet: 'veg',
    activity: 'moderate', trainingDays: 3, supportedPopulation: true,
  }, { mode: 'cut', targetKg: 75, ratePct: 0.5, distribution: [1, 1, 1, 1, 1, 1, 1] }, { now, timeZone: 'Asia/Kolkata' });
}

test('food snapshot retains instant and local midnight date, time and offset', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await logFood(db, { ...food, name: '  Home meal  ', quantityLabel: ' 1 plate ' });
    const rows = await listFood(db, '2026-09-24');
    assert.equal(rows.length, 1);
    assert.deepEqual({ ...rows[0] }, { ...food, localDate: '2026-09-24', localTime: '01:30:00.000', offsetMinutes: 330, nutritionWarning: null });
    assert.equal((await listFood(db, '2026-09-23')).length, 0);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'PARTIAL');
  } finally { close(); }
});

test('same food token is idempotent but a different payload cannot reuse it', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    assert.equal(await logFood(db, food), food.id);
    assert.equal(await logFood(db, { ...food }), food.id);
    await assert.rejects(logFood(db, { ...food, kcal: 600 }), /idempot|different|token/i);
    assert.equal((await listFood(db, '2026-09-24')).length, 1);
    const audits = await db.first<{ count: number }>("SELECT count(*) AS count FROM audit_events WHERE kind = 'food_logged'");
    assert.equal(audits?.count, 1);
  } finally { close(); }
});

test('diary pages newest first while totals exclude future planned entries', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    for (let index = 0; index < 3; index++) await logFood(db, { ...food, id: `food-${index}`, occurredAt: now + index * 60000 });
    assert.deepEqual((await listFood(db, '2026-09-24', { limit: 1, offset: 1 })).map(row => row.id), ['food-1']);
    assert.deepEqual(await dayTotals(db, '2026-09-24', now), { kcal: 500, protein: 25, carbs: 55, fat: 20, count: 1 });
    assert.equal((await dayTotals(db, '2026-09-24', now + 120000)).count, 3);
  } finally { close(); }
});

test('confirmed completeness is invalidated by a new food, but not an idempotent retry', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await logFood(db, food);
    await setDayStatus(db, '2026-09-24', 'COMPLETE');
    await logFood(db, food);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'COMPLETE');
    await logFood(db, { ...food, id: 'second' });
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'PARTIAL');
    assert.equal((await getDayStatus(db, '2026-09-24')).confirmedAt, null);
  } finally { close(); }
});

test('food and status writes roll back when audit insertion fails', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await db.exec("CREATE TRIGGER fail_food_audit BEFORE INSERT ON audit_events WHEN NEW.kind = 'food_logged' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
    await assert.rejects(logFood(db, food), /injected/);
    assert.equal((await listFood(db, '2026-09-24')).length, 0);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'MISSING');
  } finally { close(); }
});

test('undo deletes food and changes day state atomically with audit', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db); await logFood(db, food);
    await setDayStatus(db, '2026-09-24', 'COMPLETE');
    await db.exec("CREATE TRIGGER fail_undo_audit BEFORE INSERT ON audit_events WHEN NEW.kind = 'food_undone' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
    await assert.rejects(undoFood(db, food.id), /injected/);
    assert.equal((await listFood(db, '2026-09-24')).length, 1);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'COMPLETE');
    await db.exec('DROP TRIGGER fail_undo_audit');
    await undoFood(db, food.id); await undoFood(db, food.id);
    assert.equal((await listFood(db, '2026-09-24')).length, 0);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'MISSING');
    assert.equal((await dayTotals(db, '2026-09-24', now)).kcal, 0);
  } finally { close(); }
});

test('zero-macro quick calories are allowed, discrepancy warns and extreme excess fails', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await logFood(db, { ...food, protein: 0, carbs: 0, fat: 0 });
    await logFood(db, { ...food, id: 'warning', kcal: 500, protein: 0, carbs: 180, fat: 0 });
    const rows = await listFood(db, '2026-09-24');
    assert.equal(rows.length, 2);
    assert.ok(rows.find(row => row.id === 'warning')?.nutritionWarning);
    await assert.rejects(logFood(db, { ...food, id: 'invalid', kcal: 10, protein: 100, carbs: 0, fat: 0 }), /macro/i);
  } finally { close(); }
});

test('journal rejects invalid numbers, labels, civil dates, zones and pagination', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    for (const patch of [{ kcal: NaN }, { protein: -1 }, { kcal: 20001 }, { fat: 2001 }, { name: ' ' }, { quantityLabel: '' }, { name: 'x'.repeat(121) }, { timeZone: '+05:30' }, { timeZone: 'Not/AZone' }, { occurredAt: Infinity }]) {
      await assert.rejects(logFood(db, { ...food, ...patch }));
    }
    await assert.rejects(listFood(db, '2026-02-30'));
    await assert.rejects(listFood(db, '2026-09-24', { limit: 1001 }));
    await assert.rejects(listFood(db, '2026-09-24', { offset: -1 }));
    await assert.rejects(dayTotals(db, '2026-09-24', NaN));
    assert.equal((await listFood(db, '2026-09-24')).length, 0);
  } finally { close(); }
});

test('weight preserves raw mass and influence, handles DST offset, rejects duplicate mismatch', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const weight = { id: 'weight-1', kg: 80, occurredAt: Date.parse('2026-11-01T05:30:00Z'), timeZone: 'America/New_York', influence: 'reduced' as const };
    const afterSecondReading = weight.occurredAt + 3600000;
    await logWeight(db, weight, afterSecondReading); await logWeight(db, weight, afterSecondReading);
    await logWeight(db, { ...weight, id: 'weight-2', kg: 81, occurredAt: afterSecondReading, influence: 'ignored' }, afterSecondReading);
    await assert.rejects(logWeight(db, { ...weight, kg: 82 }, afterSecondReading), /idempot|different|token/i);
    const rows = await listWeights(db);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]!.localTime, rows[1]!.localTime);
    assert.equal(rows[0]!.offsetMinutes, -300);
    assert.equal(rows[1]!.offsetMinutes, -240);
    assert.equal(rows[0]!.kg, 81);
    assert.equal(rows[0]!.influence, 'ignored');
    assert.equal((await latestWeight(db, afterSecondReading))?.id, 'weight-2');
    assert.equal((await listWeights(db, { limit: 1 })).length, 1);
    await assert.rejects(logWeight(db, { ...weight, id: 'bad', kg: 401 }));
    await assert.rejects(logWeight(db, { ...weight, id: 'bad', influence: 'unknown' as 'normal' }));
  } finally { close(); }
});

test('day status requires explicit fasting confirmation without food and explicit estimates', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    assert.equal((await getDayStatus(db, '2026-09-24')).status, 'MISSING');
    await assert.rejects(setDayStatus(db, '2026-09-24', 'ESTIMATED'));
    await setDayStatus(db, '2026-09-24', 'ESTIMATED', 2000);
    assert.equal((await getDayStatus(db, '2026-09-24')).estimatedKcal, 2000);
    await setDayStatus(db, '2026-09-24', 'FASTING');
    assert.ok((await getDayStatus(db, '2026-09-24')).confirmedAt);
    await logFood(db, food);
    await assert.rejects(setDayStatus(db, '2026-09-24', 'FASTING'), /food/i);
    await assert.rejects(setDayStatus(db, '2026-02-30', 'MISSING'));
    await assert.rejects(setDayStatus(db, '2026-09-24', 'COMPLETE', 2000));
  } finally { close(); }
});

test('settings allowlist prevents secret storage and units remain consistent with profile', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    assert.equal(await getSetting(db, 'units'), 'metric');
    await setSetting(db, 'units', 'imperial');
    assert.equal(await getSetting(db, 'units'), 'imperial');
    assert.equal((await getProfile(db))?.units, 'imperial');
    assert.equal((await db.first<{ units: string }>('SELECT units FROM preferences'))?.units, 'imperial');
    await setSetting(db, 'glass', 'tinted');
    assert.equal(await getSetting(db, 'glass'), 'tinted');
    await assert.rejects(setSetting(db, 'apiKey' as 'glass', 'secret'));
    await assert.rejects(getSetting(db, 'apiKey' as 'glass'));
    await assert.rejects(setSetting(db, 'units', 'pounds'));
    await assert.rejects(setSetting(db, 'glass', 'invisible'));
  } finally { close(); }
});

test('database itself rejects orphan journal rows and invalid raw weight', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await logWeight(db, { id: 'w', kg: 80, occurredAt: now, timeZone: 'UTC', influence: 'normal' });
    await assert.rejects(db.run('UPDATE weight_entries SET kg = -1 WHERE id = ?', 'w'));
    await assert.rejects(db.run('UPDATE weight_entries SET profile_id = ? WHERE id = ?', 'missing', 'w'));
    assert.equal((await latestWeight(db))?.kg, 80);
  } finally { close(); }
});

test('journal snapshots and settings survive physical reopen without duplication', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nerdfit-journal-'));
  const file = join(dir, 'journal.db');
  let connection = testDatabase(file);
  try {
    await setup(connection.db);
    await logFood(connection.db, food);
    await setDayStatus(connection.db, '2026-09-24', 'COMPLETE');
    await logWeight(connection.db, { id: 'weight-1', kg: 80.25, occurredAt: now, timeZone: 'Asia/Kolkata', influence: 'normal' });
    await setSetting(connection.db, 'units', 'imperial');
    await setSetting(connection.db, 'glass', 'clear');
    connection.close();
    connection = testDatabase(file);
    await setup(connection.db);
    assert.equal((await listFood(connection.db, '2026-09-24'))[0]?.name, 'Home meal');
    assert.equal((await latestWeight(connection.db))?.kg, 80.25);
    assert.equal(await getSetting(connection.db, 'units'), 'imperial');
    assert.equal(await getSetting(connection.db, 'glass'), 'clear');
    await logFood(connection.db, food);
    assert.equal((await listFood(connection.db, '2026-09-24')).length, 1);
    assert.equal((await getDayStatus(connection.db, '2026-09-24')).status, 'COMPLETE');
  } finally {
    connection.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${file}${suffix}`, { force: true });
    rmdirSync(dir);
  }
});

test('setting failure cannot split unit preference from profile or stored setting', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await db.exec("CREATE TRIGGER fail_setting_audit BEFORE INSERT ON audit_events WHEN NEW.kind = 'setting_changed' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
    await assert.rejects(setSetting(db, 'units', 'imperial'), /injected/);
    assert.equal(await getSetting(db, 'units'), 'metric');
    assert.equal((await getProfile(db))?.units, 'metric');
    assert.equal(await db.first('SELECT value FROM settings WHERE key=?', 'units'), null);
  } finally { close(); }
});

test('future actual weigh-ins are rejected and legacy future rows do not become latest weight', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const weight = { id: 'actual', kg: 80, occurredAt: now, timeZone: 'UTC', influence: 'normal' as const };
    await assert.rejects(logWeight(db, { ...weight, id: 'future', occurredAt: now + 1 }, now), /future/i);
    assert.equal(await latestWeight(db, now), null);
    await logWeight(db, weight, now);
    // Simulate a legacy future row without treating it as a current observation.
    await logWeight(db, { ...weight, id: 'legacy', kg: 85, occurredAt: now + 1000 }, now + 1000);
    assert.equal((await latestWeight(db, now))?.id, 'actual');
    assert.equal((await latestWeight(db, now + 1000))?.id, 'legacy');
    await assert.rejects(logWeight(db, weight, NaN));
    await assert.rejects(latestWeight(db, NaN));
  } finally { close(); }
});

test('undo weight removes only the selected raw reading and rolls back if audit fails', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const weight = { id: 'first', kg: 80, occurredAt: now, timeZone: 'UTC', influence: 'normal' as const };
    await logWeight(db, weight, now);
    await logWeight(db, { ...weight, id: 'second', kg: 81, occurredAt: now + 1 }, now + 1);
    await db.exec("CREATE TRIGGER fail_weight_undo BEFORE INSERT ON audit_events WHEN NEW.kind = 'weight_undone' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
    await assert.rejects(undoWeight(db, 'second'), /injected/);
    assert.equal((await listWeights(db)).length, 2);
    await db.exec('DROP TRIGGER fail_weight_undo');
    await undoWeight(db, 'second'); await undoWeight(db, 'second');
    assert.equal((await listWeights(db)).length, 1);
    assert.equal((await latestWeight(db, now + 1))?.id, 'first');
    assert.equal((await db.first<{ count: number }>("SELECT count(*) AS count FROM audit_events WHERE kind='weight_undone'"))?.count, 1);
  } finally { close(); }
});
