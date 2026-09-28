import test from 'node:test';
import assert from 'node:assert/strict';
import { dateFromParam, localDate } from '../../domain/dates.ts';

test('selected diary date uses local calendar components and retains chosen clock time', () => {
  const reference = new Date(2026, 8, 27, 19, 12, 34, 123);
  const selected = dateFromParam('2024-02-29', reference);
  assert.equal(localDate(selected), '2024-02-29');
  assert.deepEqual([selected.getHours(), selected.getMinutes(), selected.getSeconds(), selected.getMilliseconds()], [19, 12, 34, 123]);
  assert.equal(localDate(reference), '2026-09-27');
});

test('invalid, repeated and absent route dates fall back without calendar overflow', () => {
  const reference = new Date(2026, 8, 27, 8, 30);
  for (const param of ['2026-02-30', '2026-13-01', '2026-00-01', '2026-1-2', 'nonsense', ['2026-09-20'], undefined]) {
    assert.equal(dateFromParam(param, reference).getTime(), reference.getTime());
  }
});
