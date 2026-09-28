import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateWeek, buildInitialPlan, fromKg, toKg } from '../../domain/planning.ts';
import type { GoalInput, ProfileInput } from '../../domain/planning.ts';

const profile: ProfileInput = {
  age: 30, heightCm: 180, weightKg: 80, equation: 'male', units: 'metric',
  diet: 'non-veg', activity: 'moderate', trainingDays: 3, supportedPopulation: true,
};
const goal: GoalInput = {
  mode: 'cut', targetKg: 75, ratePct: 0.5, distribution: [1, 1, 1, 1, 1, 1, 1],
};

test('initial plan derives a literal Mifflin prior and an uncapped cut from actual mass', () => {
  const result = buildInitialPlan(profile, goal);
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.equal(result.resting, 1780);
  assert.equal(result.prior, 2759);
  assert.equal(result.weeklyBudget, 16233);
  assert.equal(result.averageTarget, 2319);
  assert.equal(result.requestedKgWeek, -0.4);
  assert.equal(result.effectiveKgWeek, -0.4);
  assert.deepEqual(result.days.map(day => day.kcal), [2319, 2319, 2319, 2319, 2319, 2319, 2319]);
  assert.ok(result.explanations.length > 0);
});

test('cut cap slows the effective rate without rewriting the requested rate', () => {
  const result = buildInitialPlan({ ...profile, knownTdee: 2500 }, { ...goal, ratePct: 1 });
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.equal(result.averageTarget, 2000);
  assert.equal(result.requestedKgWeek, -0.8);
  assert.ok(Math.abs(result.effectiveKgWeek + 0.45454545454545453) < 1e-12);
});

test('bulk uses its own startup allowance and ten-percent cap', () => {
  const result = buildInitialPlan({ ...profile, knownTdee: 2500 }, { ...goal, mode: 'bulk', targetKg: 85, ratePct: 0.5 });
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.equal(result.averageTarget, 2750);
  assert.equal(result.weeklyBudget, 19250);
  assert.equal(result.requestedKgWeek, 0.4);
  assert.ok(Math.abs(result.effectiveKgWeek - 0.3181818181818182) < 1e-12);
});

test('maintenance preserves expenditure calories and has no weight-change ETA', () => {
  const result = buildInitialPlan({ ...profile, equation: 'female', trainingDays: 0 }, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 });
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.equal(result.resting, 1614);
  assert.ok(Math.abs(result.prior - 2501.7) < 1e-9);
  assert.equal(result.weeklyBudget, 17512);
  assert.equal(result.requestedKgWeek, 0);
  assert.equal(result.effectiveKgWeek, 0);
  assert.equal(result.days[0]?.protein, 96);
  assert.equal(result.estimatedWeeksRange, undefined);
});

test('percentage planning changes requested kg/week when current mass changes', () => {
  const lighter = buildInitialPlan({ ...profile, weightKg: 60 }, { ...goal, targetKg: 55 });
  assert.equal(lighter.status, 'coached');
  if (lighter.status !== 'coached') return;
  assert.equal(lighter.requestedKgWeek, -0.3);
});

test('duration is a sensitivity range with changing mass, not a fixed-kg deadline', () => {
  const result = buildInitialPlan(profile, goal);
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.ok(result.estimatedWeeksRange);
  assert.ok(result.estimatedWeeksRange[0] > 10 && result.estimatedWeeksRange[0] < 10.1);
  assert.ok(result.estimatedWeeksRange[1] > 15.8 && result.estimatedWeeksRange[1] < 16);
});

test('all day macros conserve energy with stable protein after shifting', () => {
  const result = buildInitialPlan(profile, { ...goal, distribution: [1, 1, 1, 1, 1, 1.1, 1.1] });
  assert.equal(result.status, 'coached');
  if (result.status !== 'coached') return;
  assert.equal(result.days.reduce((sum, day) => sum + day.kcal, 0), result.weeklyBudget);
  for (const day of result.days) {
    assert.equal(day.protein, 144);
    assert.ok(day.carbs >= 0);
    assert.ok(day.fat * 9 >= day.kcal * 0.2 - 1e-8);
    assert.ok(Math.abs(4 * day.protein + 4 * day.carbs + 9 * day.fat - day.kcal) < 1e-8);
  }
});

test('daily safeguards reject an allocation even when its macros could fit', () => {
  assert.throws(() => buildInitialPlan(profile, { ...goal, distribution: [0.6, 1, 1, 1, 1, 1, 1] }), /distribution|flatter/i);
  assert.throws(() => buildInitialPlan(profile, { ...goal, distribution: [3, 1, 1, 1, 1, 1, 1] }), /distribution|flatter/i);
});

test('a supplied TDEE cannot bypass the resting-prior daily minimum', () => {
  assert.throws(() => buildInitialPlan({ ...profile, knownTdee: 1200 }, goal), /distribution|flatter/i);
});

test('macro conflict is rejected instead of producing negative carbohydrate', () => {
  assert.throws(() => buildInitialPlan({ ...profile, weightKg: 250, heightCm: 130, age: 78, equation: 'female', knownTdee: 4000 }, {
    ...goal, targetKg: 240, proteinPerKg: 2.2, fatFraction: 0.35,
  }), /macro|protein/i);
});

test('unsupported population and development ranges produce no targets', () => {
  const unsupported: Partial<ProfileInput>[] = [
    { supportedPopulation: false }, { age: 17 }, { age: 79 }, { weightKg: 39 },
    { weightKg: 251 }, { heightCm: 129 }, { heightCm: 221 },
  ];
  for (const patch of unsupported) {
    const result = buildInitialPlan({ ...profile, ...patch }, goal);
    assert.equal(result.status, 'tracking-only');
    assert.ok('reasons' in result && result.reasons.length > 0);
    assert.equal('days' in result, false);
    assert.equal('weeklyBudget' in result, false);
  }
  assert.equal(buildInitialPlan(profile, { ...goal, targetKg: 35 }).status, 'tracking-only');
});

test('nonfinite values and wrong enums fail before eligibility can bypass validation', () => {
  for (const patch of [
    { age: NaN }, { heightCm: Infinity }, { weightKg: 0 }, { trainingDays: 8 },
    { age: 30.5 }, { trainingDays: 1.5 }, { knownTdee: 1199 }, { knownTdee: 6001 },
    { activity: 'unknown' }, { equation: 'unknown' }, { units: 'unknown' }, { diet: 'unknown' },
    { supportedPopulation: 'yes' },
  ]) {
    assert.throws(() => buildInitialPlan({ ...profile, ...patch } as ProfileInput, goal));
  }
  assert.throws(() => buildInitialPlan({ ...profile, supportedPopulation: false }, { ...goal, ratePct: NaN }));
  assert.throws(() => buildInitialPlan(profile, { ...goal, mode: 'other' } as unknown as GoalInput));
});

test('goal direction, rate and macro preference validation rejects invalid prescriptions', () => {
  for (const patch of [
    { targetKg: 85 }, { targetKg: 80 }, { targetKg: 0 }, { ratePct: 0 }, { ratePct: -1 }, { ratePct: 1.01 },
    { proteinPerKg: 0.9 }, { proteinPerKg: 2.3 }, { fatFraction: 0.19 }, { fatFraction: 0.36 },
  ]) assert.throws(() => buildInitialPlan(profile, { ...goal, ...patch }));
  assert.throws(() => buildInitialPlan(profile, { ...goal, mode: 'bulk', targetKg: 85, ratePct: 0.51 }));
  assert.throws(() => buildInitialPlan(profile, { ...goal, mode: 'bulk', targetKg: 75, ratePct: 0.2 }));
  assert.throws(() => buildInitialPlan(profile, { ...goal, mode: 'maintain', ratePct: 0.5 }));
});

test('allocation preserves exact budget and resolves ties in weekday order', () => {
  assert.deepEqual(allocateWeek(14003, [1, 1, 1, 1, 1, 1, 1]), [2001, 2001, 2001, 2000, 2000, 2000, 2000]);
  assert.deepEqual(allocateWeek(14000, [1, 1, 1, 1, 1, 1, 2]), [1750, 1750, 1750, 1750, 1750, 1750, 3500]);
  for (let budget = 10000; budget < 10100; budget++) {
    const days = allocateWeek(budget, [0.8, 1, 1.2, 1, 0.9, 1.1, 1]);
    assert.equal(days.reduce((sum, day) => sum + day, 0), budget);
    assert.ok(days.every(Number.isInteger));
  }
});

test('allocation validates its shape and resists overflow when weights are large', () => {
  assert.throws(() => allocateWeek(10.2, [1, 1, 1, 1, 1, 1, 1]));
  assert.throws(() => allocateWeek(-1, [1, 1, 1, 1, 1, 1, 1]));
  assert.throws(() => allocateWeek(1000, [1, 1]));
  assert.throws(() => allocateWeek(1000, [0, 1, 1, 1, 1, 1, 1]));
  assert.throws(() => allocateWeek(1000, [Infinity, 1, 1, 1, 1, 1, 1]));
  assert.deepEqual(allocateWeek(14000, Array(7).fill(1e308)), Array(7).fill(2000));
});

test('unit conversion uses the international pound and round-trips without mutating inputs', () => {
  assert.equal(toKg(100, 'imperial'), 45.359237);
  assert.equal(toKg(80, 'metric'), 80);
  assert.equal(fromKg(80, 'metric'), 80);
  assert.ok(Math.abs(fromKg(45.359237, 'imperial') - 100) < 1e-12);
  for (const weight of [40, 80, 250]) assert.ok(Math.abs(toKg(fromKg(weight, 'imperial'), 'imperial') - weight) < 1e-12);
  assert.throws(() => toKg(NaN, 'metric'));
  assert.throws(() => fromKg(-5, 'imperial'));
  assert.throws(() => toKg(80, 'other' as 'metric'));
  const frozenProfile = Object.freeze({ ...profile });
  const frozenGoal = Object.freeze({ ...goal, distribution: Object.freeze([...goal.distribution]) });
  const original = JSON.stringify([frozenProfile, frozenGoal]);
  buildInitialPlan(frozenProfile, frozenGoal);
  assert.equal(JSON.stringify([frozenProfile, frozenGoal]), original);
});

test('integer weekly rounding never pushes a capped plan beyond its energy limit', () => {
  const cut = buildInitialPlan(profile, { ...goal, ratePct: 1 });
  assert.equal(cut.status, 'coached');
  if (cut.status !== 'coached') return;
  assert.ok(cut.averageTarget >= cut.prior * 0.8);
  const bulk = buildInitialPlan({ ...profile, knownTdee: 2501.8 }, { ...goal, mode: 'bulk', targetKg: 85, ratePct: 0.5 });
  assert.equal(bulk.status, 'coached');
  if (bulk.status !== 'coached') return;
  assert.ok(bulk.averageTarget <= bulk.prior * 1.1);
});

test('a vanishing rate cannot return a zero or reversed effective rate and nonfinite ETA', () => {
  assert.throws(() => buildInitialPlan(profile, { ...goal, ratePct: 1e-100 }), /rate|precision/i);
  assert.throws(() => buildInitialPlan({ ...profile, equation: 'female' }, { ...goal, ratePct: 1e-100 }), /rate|precision/i);
});

test('conversion rejects numeric underflow and overflow instead of returning invalid mass', () => {
  assert.throws(() => toKg(Number.MIN_VALUE, 'imperial'));
  assert.throws(() => fromKg(Number.MAX_VALUE, 'imperial'));
});
