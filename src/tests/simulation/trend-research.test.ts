import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTrend, generateTrajectory, scoreTrajectory, pairedInfluence, runResearch } from '../../../scripts/research/compare-trends.ts';
import type { Method, Observation } from '../../../scripts/research/compare-trends.ts';

const methods: Method[] = ['ewma', 'robust-ewma', 'robust-kalman'];

for (const method of methods) {
  test(`${method}: missing measurements do not initialize a trend or move a constant series`, () => {
    assert.deepEqual(filterTrend([{ day: 0, kg: null }, { day: 1, kg: 80 }, { day: 40, kg: null }], method), [null, 80, 80]);
  });
  test(`${method}: future observations cannot rewrite an earlier result`, () => {
    const prefix = [{ day: 0, kg: 80 }, { day: 1, kg: 79.8 }, { day: 3, kg: null }];
    assert.equal(filterTrend(prefix, method).length, 3);
    assert.deepEqual(filterTrend([...prefix, { day: 4, kg: 95 }], method).slice(0, 3), filterTrend(prefix, method));
  });
  test(`${method}: rejects duplicate dates and nonfinite input instead of corrupting state`, () => {
    assert.throws(() => filterTrend([{ day: 1, kg: 80 }, { day: 1, kg: 81 }], method), /increasing/);
    assert.throws(() => filterTrend([{ day: 0, kg: Number.NaN }], method), /finite/);
    assert.throws(() => filterTrend([{ day: 0, kg: 0 }], method), /positive/);
  });
  test(`${method}: irregular intervals equal explicit missing observations`, () => {
    const sparse = filterTrend([{ day: 0, kg: 80 }, { day: 1, kg: 79.9 }, { day: 20, kg: 78 }], method);
    const daily: Observation[] = Array.from({ length: 21 }, (_, day) => ({ day, kg: day === 0 ? 80 : day === 1 ? 79.9 : day === 20 ? 78 : null }));
    const dense = filterTrend(daily, method);
    assert.ok(Math.abs(sparse[2]! - dense[20]!) < 1e-10);
  });
  test(`${method}: preserves input and is deterministic through a long gap`, () => {
    const input = Object.freeze([{ day: 0, kg: 80 }, { day: 1, kg: 79.9 }, { day: 500, kg: 70 }].map(point => Object.freeze(point)));
    assert.equal(filterTrend(input, method).length, 3);
    assert.deepEqual(filterTrend(input, method), filterTrend(input, method));
    assert.ok(filterTrend(input, method).every(Number.isFinite));
  });
}

test('matched synthetic typo alters only the observation, never latent tissue or water draws', () => {
  const clean = generateTrajectory(90, 'stable', 101, 80);
  const typo = generateTrajectory(90, 'typo', 101, 80);
  assert.deepEqual(clean.map(p => p.tissueKg), typo.map(p => p.tissueKg));
  assert.equal(clean.filter((p, i) => p.kg !== typo[i]!.kg).length, 1);
  assert.deepEqual(clean, generateTrajectory(90, 'stable', 101, 80));
  assert.notDeepEqual(clean, generateTrajectory(90, 'stable', 102, 80));
});

test('metric uses latent tissue truth and excludes only declared warmup', () => {
  const points = [{ day: 0, kg: 90, tissueKg: 80 }, { day: 1, kg: 90, tissueKg: 80 }];
  const score = scoreTrajectory(points, [82, 84], 1);
  assert.equal(score.mae, 4);
  assert.equal(score.maxError, 4);
  assert.equal(pairedInfluence([80, 81, null], [80, 83, null]), 2);
});

test('robust filters contain one typo after stable initialization', () => {
  const clean = Array.from({ length: 45 }, (_, day) => ({ day, kg: 80 }));
  const corrupt = clean.map(p => ({ ...p, kg: p.day === 25 ? 800 : p.kg }));
  const baseline = pairedInfluence(filterTrend(clean, 'ewma'), filterTrend(corrupt, 'ewma'));
  for (const method of ['robust-ewma', 'robust-kalman'] as const) {
    assert.ok(pairedInfluence(filterTrend(clean, method), filterTrend(corrupt, method)) < baseline * 0.2);
  }
});

test('research runner measures each method and scenario without nonfinite aggregate values', () => {
  const result = runResearch([101], [30], [80]);
  assert.equal(result.rows.length, 27);
  assert.equal(result.numericalFailures, 0);
  assert.ok(result.rows.every(row => Number.isFinite(row.meanMae) && row.trajectories === 1));
});
