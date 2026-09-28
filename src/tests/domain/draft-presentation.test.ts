import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInitialPlan, type ProfileInput, type GoalInput } from '../../domain/planning.ts';
import { weightDraftKg, convertMeasurementDraft, buildStepPlan, averageMacros, paceInUnits } from '../../domain/draftPresentation.ts';

const profile: ProfileInput = { age: 30, heightCm: 175, weightKg: 80, equation: 'male', units: 'metric', diet: 'non-veg', activity: 'moderate', trainingDays: 3, supportedPopulation: true };
const uneven = [0.85, 0.85, 0.85, 0.85, 0.85, 1.375, 1.375];
const goal: GoalInput = { mode: 'cut', targetKg: 75, ratePct: 0.5, distribution: uneven };

test('incomplete, zero and overflowing weight drafts stay editable without throwing', () => {
  for (const draft of ['', '0', '.', '1e309', '-1', 'NaN', 'Infinity']) {
    for (const units of ['metric', 'imperial'] as const) {
      assert.equal(weightDraftKg(draft, units), null);
      const next = units === 'metric' ? 'imperial' : 'metric';
      assert.equal(convertMeasurementDraft(draft, 'weight', units, next), draft);
      assert.equal(convertMeasurementDraft(draft, 'height', units, next), draft);
    }
  }
});

test('valid drafts convert units while retaining ordinary decimal editing forms', () => {
  assert.equal(weightDraftKg('80.', 'metric'), 80);
  assert.equal(weightDraftKg('100', 'imperial'), 45.359237);
  assert.equal(convertMeasurementDraft('80', 'weight', 'metric', 'imperial'), '176.4');
  assert.equal(convertMeasurementDraft('175', 'height', 'metric', 'imperial'), '68.9');
  assert.equal(convertMeasurementDraft('80.', 'weight', 'metric', 'metric'), '80.');
});

test('editing a goal can reach distribution even when its old split no longer fits', () => {
  assert.equal(buildInitialPlan(profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 }).status, 'coached');
  assert.throws(() => buildInitialPlan(profile, goal), /Distribution exceeds/);
  for (const step of [1, 2]) assert.equal(buildStepPlan(profile, goal, step).status, 'coached');
  assert.throws(() => buildStepPlan(profile, goal, 3), /Distribution exceeds/);
  assert.deepEqual(goal.distribution, uneven);
  assert.throws(() => buildStepPlan(profile, { ...goal, targetKg: 90 }, 1), /Cut target/);
});

test('profile step does not require an unfinished goal; distribution step uses the chosen split', () => {
  assert.equal(buildStepPlan(profile, null, 0).status, 'coached');
  assert.throws(() => buildStepPlan(profile, null, 1), /goal/i);
  const maintenance: GoalInput = { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 };
  assert.deepEqual(buildStepPlan(profile, maintenance, 3), buildInitialPlan(profile, maintenance));
});

test('preview macros describe the same weekly average as the calorie headline', () => {
  const plan = buildInitialPlan(profile, { ...goal, mode: 'maintain', targetKg: 80, ratePct: 0 });
  assert.equal(plan.status, 'coached');
  if (plan.status !== 'coached') throw new Error('Fixture needs a coached plan');
  const macros = averageMacros(plan);
  assert.ok(Math.abs(4 * macros.protein + 4 * macros.carbs + 9 * macros.fat - plan.averageTarget) < 1e-9);
  assert.notEqual(macros.carbs, plan.days[0]!.carbs);
  assert.ok(Math.abs(macros.protein - 128) < 1e-9);
});

test('pace presentation preserves cut/bulk sign and converts maintenance without error', () => {
  assert.equal(paceInUnits(-0.4, 'metric'), -0.4);
  assert.ok(Math.abs(paceInUnits(-0.4, 'imperial') - (-0.8818490487395103)) < 1e-12);
  assert.ok(Math.abs(paceInUnits(0.4, 'imperial') - 0.8818490487395103) < 1e-12);
  assert.equal(paceInUnits(0, 'imperial'), 0);
});
