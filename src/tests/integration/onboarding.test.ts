import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate, migrations } from '../../data/sqlite/migrations.ts';
import { onboardingMigration } from '../../data/sqlite/onboardingMigration.ts';
import { getProfile, getActiveGoal, getTarget, completeOnboarding, savePlan } from '../../data/repositories/profile.ts';
import type { ProfileInput, GoalInput } from '../../domain/planning.ts';
import { testDatabase } from '../fixtures/sqlite.ts';

const profile: ProfileInput = { age: 30, heightCm: 175, weightKg: 80, equation: 'male', units: 'metric', diet: 'non-veg', activity: 'moderate', trainingDays: 3, supportedPopulation: true };
const goal: GoalInput = { mode: 'cut', targetKg: 75, ratePct: 0.5, distribution: [1, 1, 1, 1, 1, 1, 1] };
const context = { now: Date.parse('2026-09-23T20:00:00Z'), timeZone: 'Asia/Kolkata' };
const setup = async (db: ReturnType<typeof testDatabase>['db']) => migrate(db, [...migrations.filter(m => m.version < 2), onboardingMigration]);

test('Done atomically persists a trusted plan and local dated targets through file reopen', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nerdfit-onboarding-'));
  const file = join(dir, 'test.db');
  let connection = testDatabase(file);
  try {
    await setup(connection.db);
    const saved = await completeOnboarding(connection.db, profile, goal, context);
    assert.equal(saved.plan.status, 'coached');
    assert.equal(saved.targets.length, 7);
    assert.equal(saved.targets[0]!.date, '2026-09-24');
    assert.equal(saved.nextReviewDate, '2026-10-01');
    assert.ok(saved.targets[0]!.kcal > 1500);
    connection.close();
    connection = testDatabase(file);
    await setup(connection.db);
    assert.deepEqual(await getProfile(connection.db), profile);
    assert.deepEqual((await getActiveGoal(connection.db))?.input, goal);
    assert.equal((await getTarget(connection.db, '2026-09-24'))?.kcal, saved.targets[0]!.kcal);
    assert.equal((await connection.db.first<{ value: number }>('SELECT COUNT(*) AS value FROM preferences'))?.value, 1);
  } finally { connection.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('duplicate Done returns the stored plan without replacing profile or duplicating goals', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const first = await completeOnboarding(db, profile, goal, context);
    const second = await completeOnboarding(db, { ...profile, weightKg: 90 }, { ...goal, targetKg: 70 }, { ...context, now: context.now + 1000 });
    assert.deepEqual(second, first);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM goals'))?.count, 1);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM daily_targets'))?.count, 7);
  } finally { close(); }
});

test('injected target insert failure rolls back profile, goal, preferences and review schedule', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await db.exec("CREATE TRIGGER fail_target BEFORE INSERT ON daily_targets BEGIN SELECT RAISE(ABORT, 'injected target failure'); END;");
    await assert.rejects(completeOnboarding(db, profile, goal, context), /injected target failure/);
    for (const table of ['profiles', 'preferences', 'goals', 'goal_history', 'daily_targets', 'weekly_reviews']) assert.equal((await db.first<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table}`))?.count, 0);
  } finally { close(); }
});

test('tracking-only saves profile and goal with no automatic targets or coaching review', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const saved = await completeOnboarding(db, { ...profile, supportedPopulation: false }, goal, context);
    assert.equal(saved.plan.status, 'tracking-only');
    assert.deepEqual(saved.targets, []);
    assert.equal(saved.nextReviewDate, null);
    assert.ok(await getProfile(db));
    assert.ok(await getActiveGoal(db));
    assert.equal(await getTarget(db, '2026-09-24'), null);
  } finally { close(); }
});

test('goal edit starts tomorrow and retains past targets, prior future revisions and reviews', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const original = await completeOnboarding(db, profile, goal, context);
    const todayBefore = await getTarget(db, '2026-09-24');
    const edited = await savePlan(db, profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 }, context);
    assert.equal(edited.goal.effectiveFrom, '2026-09-25');
    assert.deepEqual(await getTarget(db, '2026-09-24'), todayBefore);
    assert.notEqual((await getTarget(db, '2026-09-25'))?.goalId, original.goal.id);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM daily_targets'))?.count, 14);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM goal_history'))?.count, 2);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM weekly_reviews'))?.count, 2);
    assert.equal((await getActiveGoal(db))?.id, edited.goal.id);
  } finally { close(); }
});

test('failed edit restores the previous active goal and all its future targets', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const original = await completeOnboarding(db, profile, goal, context);
    const before = await getTarget(db, '2026-09-25');
    await db.exec("CREATE TRIGGER fail_review BEFORE INSERT ON weekly_reviews BEGIN SELECT RAISE(ABORT, 'injected review failure'); END;");
    await assert.rejects(savePlan(db, profile, { ...goal, targetKg: 74 }, context), /injected review failure/);
    assert.equal((await getActiveGoal(db))?.id, original.goal.id);
    assert.deepEqual(await getTarget(db, '2026-09-25'), before);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM goals'))?.count, 1);
  } finally { close(); }
});

test('civil-day scheduling crosses DST without skipping a target day and aligns weekday allocation', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const saved = await completeOnboarding(db, profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0, distribution: [1, 1, 1, 1, 1, 1.1, 1.1] }, { now: Date.parse('2026-03-07T23:30:00-05:00'), timeZone: 'America/New_York' });
    assert.deepEqual(saved.targets.map((target: { date: string }) => target.date), ['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13']);
    assert.ok(saved.targets[0]!.kcal > saved.targets[2]!.kcal);
    assert.equal(saved.nextReviewDate, '2026-03-14');
    assert.ok(saved.plan.status === 'coached');
    assert.equal(saved.targets.reduce((sum: number, t: { kcal: number }) => sum + t.kcal, 0), saved.plan.weeklyBudget);
  } finally { close(); }
});

test('invalid timezone or domain inputs leave onboarding uncommitted', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    await assert.rejects(completeOnboarding(db, profile, goal, { ...context, timeZone: 'bad/zone' }));
    await assert.rejects(completeOnboarding(db, { ...profile, weightKg: Number.NaN }, goal, context));
    assert.equal(await getProfile(db), null);
    await assert.rejects(getTarget(db, '2026-02-30'), /date/i);
  } finally { close(); }
});

test('accepted weekday schedule materializes day eight and week two once without changing its budget', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const saved = await completeOnboarding(db, profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0, distribution: [1, 1, 1, 1, 1, 1.1, 1.1] }, context);
    const dayEight = await getTarget(db, '2026-10-01');
    assert.ok(dayEight);
    assert.equal(dayEight.goalId, saved.goal.id);
    assert.equal(dayEight.kcal, saved.targets[0]!.kcal);
    assert.deepEqual(await getTarget(db, '2026-10-01'), dayEight);
    const weekTwo = await Promise.all(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'].map(date => getTarget(db, date)));
    assert.ok(saved.plan.status === 'coached');
    assert.equal(weekTwo.reduce((sum, target) => sum + target!.kcal, 0), saved.plan.weeklyBudget);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM daily_targets'))?.count, 14);
  } finally { close(); }
});

test('unmaterialized historical date uses the goal effective then, not the latest accepted edit', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const original = await completeOnboarding(db, profile, goal, context);
    const edited = await savePlan(db, profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 }, { ...context, now: Date.parse('2026-10-06T12:00:00Z') });
    assert.equal(edited.goal.effectiveFrom, '2026-10-07');
    const historical = await getTarget(db, '2026-10-03');
    assert.ok(historical);
    assert.equal(historical.goalId, original.goal.id);
    // October 3 and September 26 are both Saturday; integer rounding is weekday-specific.
    assert.equal(historical.kcal, original.targets[2]!.kcal);
    assert.equal((await getTarget(db, '2026-10-14'))?.goalId, edited.goal.id);
    assert.equal(await getTarget(db, '2026-09-23'), null);
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM goal_history'))?.count, 2);
  } finally { close(); }
});

test('tracking-only edit ends future materialization while prior coached dates stay available', async () => {
  const { db, close } = testDatabase();
  try {
    await setup(db);
    const original = await completeOnboarding(db, profile, goal, context);
    const farFuture = await getTarget(db, '2026-11-01');
    assert.ok(farFuture);
    await savePlan(db, { ...profile, supportedPopulation: false }, goal, { ...context, now: Date.parse('2026-10-06T12:00:00Z') });
    assert.equal(await getTarget(db, '2026-11-01'), null);
    assert.equal(await getTarget(db, '2026-10-14'), null);
    assert.equal((await getTarget(db, '2026-10-03'))?.goalId, original.goal.id);
    assert.equal((await db.first<{ active: number }>('SELECT is_active AS active FROM daily_targets WHERE id = ?', farFuture.id))?.active, 0);
  } finally { close(); }
});
