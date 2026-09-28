import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiaryLoader, type DiarySnapshot, type DiaryState } from '../../features/food/diaryLoader.ts';

function pending() {
  let resolve!: (data: DiarySnapshot) => void; let reject!: (error: Error) => void;
  const promise = new Promise<DiarySnapshot>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function snapshot(day: string, kcal: number): DiarySnapshot {
  return { day, now: 1000, rows: [], totals: { kcal, protein: 0, carbs: 0, fat: 0, count: 0 }, status: { localDate: day, status: 'MISSING', estimatedKcal: null, confirmedAt: null }, glass: 'balanced' };
}

test('slow earlier diary response cannot replace the selected day', async () => {
  const old = pending(); const current = pending(); const states: DiaryState[] = [];
  const loader = createDiaryLoader(day => day === '2026-09-20' ? old.promise : current.promise, value => states.push(value));
  const a = loader.load('2026-09-20', 30); const b = loader.load('2026-09-21', 30);
  assert.deepEqual(states.at(-1), { phase: 'loading', day: '2026-09-21' });
  current.resolve(snapshot('2026-09-21', 200)); await b;
  old.resolve(snapshot('2026-09-20', 100)); await a;
  assert.deepEqual(states.at(-1), { phase: 'ready', data: snapshot('2026-09-21', 200) });
});

test('cancelled errors cannot replace a screen after navigation', async () => {
  const result = pending(); const states: DiaryState[] = [];
  const loader = createDiaryLoader(() => result.promise, value => states.push(value));
  const request = loader.load('2026-09-20', 30); loader.cancel();
  result.reject(new Error('old query failed')); await request;
  assert.equal(states.length, 1);
});

test('old-date mutations cannot refresh a newly selected diary and current refresh preserves paging', async () => {
  const calls: [string, number][] = []; const states: DiaryState[] = [];
  const loader = createDiaryLoader(async (day, limit) => { calls.push([day, limit]); return snapshot(day, 100); }, value => states.push(value));
  await loader.load('2026-09-21', 60);
  await loader.refresh('2026-09-20');
  assert.equal(calls.length, 1);
  await loader.refresh('2026-09-21');
  assert.deepEqual(calls, [['2026-09-21', 60], ['2026-09-21', 60]]);
  loader.cancel(); await loader.refresh('2026-09-21');
  assert.equal(calls.length, 2);
});
