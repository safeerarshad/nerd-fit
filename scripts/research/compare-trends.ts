/** Research only. No app imports, persisted user data, dependencies, or clinical claims. */
import { pathToFileURL } from 'node:url';

export type Method = 'ewma' | 'robust-ewma' | 'robust-kalman';
export type Observation = Readonly<{ day: number; kg: number | null }>;
export type Scenario = 'stable' | 'cut' | 'bulk' | 'spike' | 'typo' | 'missing' | 'long-gap' | 'persistent-water' | 'activity-transition';
export type SyntheticPoint = Observation & { tissueKg: number };
export const METHODS: readonly Method[] = ['ewma', 'robust-ewma', 'robust-kalman'];
export const SCENARIOS: readonly Scenario[] = ['stable', 'cut', 'bulk', 'spike', 'typo', 'missing', 'long-gap', 'persistent-water', 'activity-transition'];
export const HORIZONS = [30, 90, 180, 365, 730];
export const MASSES = [55, 80, 110];

export function filterTrend(points: readonly Observation[], method: Method): (number | null)[] {
  if (!METHODS.includes(method)) throw new Error('Unknown filter');
  let priorDay = -1;
  let lastObservedDay = -1;
  let level: number | null = null;
  let velocity = 0;
  let p00 = 0.25;
  let p01 = 0;
  let p11 = 0.0025;
  const result: (number | null)[] = [];
  for (const point of points) {
    if (!Number.isSafeInteger(point.day) || point.day < 0 || point.day <= priorDay) throw new Error('Days must be nonnegative integers in strictly increasing order');
    if (point.kg !== null && !Number.isFinite(point.kg)) throw new Error('Weight must be finite');
    if (point.kg !== null && point.kg <= 0) throw new Error('Weight must be positive');
    if (level === null) {
      if (point.kg !== null) { level = point.kg; lastObservedDay = point.day; }
    } else if (method === 'robust-kalman') {
      // Daily propagation makes omitted days and explicit null observations equivalent.
      for (let day = priorDay + 1; day <= point.day; day++) {
        if (day - lastObservedDay > 7) velocity = 0;
        level += velocity;
        p00 += 2 * p01 + p11 + 0.001225 + 0.000016 / 3;
        p01 += p11 + 0.000016 / 2;
        p11 += 0.000016;
      }
      if (point.kg !== null) {
        const residual = point.kg - level;
        // Robust approximation: an unlikely observation gets a larger R.
        // This covariance is not a calibrated posterior credible interval.
        const r = 0.25 * Math.max(1, Math.abs(residual)) ** 2;
        const innovationVariance = p00 + r;
        const k0 = p00 / innovationVariance;
        const k1 = p01 / innovationVariance;
        level += k0 * residual;
        velocity += k1 * residual;
        const a = p00;
        const b = p01;
        const c = p11;
        // Joseph-form update prevents subtractive covariance instability.
        p00 = (1 - k0) ** 2 * a + k0 ** 2 * r;
        p01 = (1 - k0) * (b - k1 * a) + k0 * k1 * r;
        p11 = c - 2 * k1 * b + k1 ** 2 * (a + r);
        lastObservedDay = point.day;
      }
    } else if (point.kg !== null) {
      const alpha = 1 - Math.exp(-Math.min(point.day - lastObservedDay, 3) / 7);
      const residual = point.kg - level;
      level += alpha * (method === 'robust-ewma' ? Math.max(-1, Math.min(1, residual)) : residual);
      lastObservedDay = point.day;
    }
    result.push(level);
    priorDay = point.day;
  }
  return result;
}

function randomSource(seed: number) {
  let state = seed >>> 0;
  const uniform = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return { uniform, normal: () => Math.sqrt(-2 * Math.log(Math.max(uniform(), Number.EPSILON))) * Math.cos(2 * Math.PI * uniform()) };
}

export function generateTrajectory(days: number, scenario: Scenario, seed: number, mass: number): SyntheticPoint[] {
  if (!Number.isSafeInteger(days) || days < 1 || !SCENARIOS.includes(scenario) || !Number.isFinite(mass) || mass < 45 || !Number.isSafeInteger(seed)) throw new Error('Invalid generator inputs');
  const rng = randomSource(seed);
  let water = 0;
  let tissueKg = mass;
  const eventDay = Math.floor(days / 2);
  const points: SyntheticPoint[] = [];
  for (let day = 0; day < days; day++) {
    // All random draws happen in every scenario, preserving matched observations.
    const waterInnovation = rng.normal();
    const scaleNoise = rng.normal();
    const missingDraw = rng.uniform();
    water = 0.85 * water + (0.10 + (Math.abs(seed) % 5) * 0.03) * waterInnovation;
    const cycle = 0.2 * Math.sin(2 * Math.PI * (day + Math.abs(seed) % 28) / 28);
    const slope = scenario === 'cut' ? -0.06 : scenario === 'bulk' ? 0.025 : scenario === 'missing' || scenario === 'long-gap' ? -0.04 : scenario === 'activity-transition' ? (day < eventDay ? 0.025 : -0.06) : 0;
    if (day > 0) tissueKg = Math.max(45, tissueKg + slope);
    let kg: number | null = tissueKg + water + cycle + (0.07 + (Math.abs(seed) % 3) * 0.04) * scaleNoise;
    if (scenario === 'spike' && day === eventDay) kg += 2;
    if (scenario === 'typo' && day === eventDay) kg *= 10;
    if (scenario === 'persistent-water' && day >= eventDay) kg += 1.5;
    if (scenario === 'missing' && day > 0 && missingDraw < 0.35) kg = null;
    if (scenario === 'long-gap' && day >= Math.floor(days * 0.35) && day < Math.floor(days * 0.60)) kg = null;
    points.push({ day, kg, tissueKg });
  }
  return points;
}

function average(values: readonly number[]) { return values.reduce((a, b) => a + b, 0) / values.length; }
function quantile(values: readonly number[], q: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(q * sorted.length) - 1)]!;
}

export function scoreTrajectory(points: readonly { tissueKg: number }[], trend: readonly (number | null)[], warmup = 7) {
  if (points.length !== trend.length || !Number.isInteger(warmup) || warmup < 0) throw new Error('Metric length/warmup mismatch');
  const allErrors = trend.flatMap((value, index) => value === null ? [] : [Math.abs(value - points[index]!.tissueKg)]);
  const errors = trend.flatMap((value, index) => value === null || index < warmup ? [] : [Math.abs(value - points[index]!.tissueKg)]);
  if (!errors.length) throw new Error('No scored observations');
  return { mae: average(errors), maxError: Math.max(...allErrors) };
}

export function pairedInfluence(a: readonly (number | null)[], b: readonly (number | null)[]) {
  if (a.length !== b.length) throw new Error('Paired length mismatch');
  return Math.max(0, ...a.flatMap((value, index) => value === null || b[index] === null ? [] : [Math.abs(value - b[index]!)]));
}

type Row = { scenario: Scenario; method: Method; days: number; trajectories: number; meanMae: number; p95Mae: number; maxError: number; maxInfluence: number | null; gapRecoveryMae: number | null; persistentWaterBias: number | null };

export function runResearch(seeds: readonly number[], horizons: readonly number[], masses: readonly number[]) {
  const rows: Row[] = [];
  let numericalFailures = 0;
  for (const days of horizons) for (const scenario of SCENARIOS) for (const method of METHODS) {
    const errors: number[] = [];
    const maxima: number[] = [];
    const influences: number[] = [];
    const recovery: number[] = [];
    const waterBias: number[] = [];
    for (const seed of seeds) for (const mass of masses) {
      const points = generateTrajectory(days, scenario, seed, mass);
      const trend = filterTrend(points, method);
      if (trend.some(value => value !== null && !Number.isFinite(value))) { numericalFailures++; continue; }
      const score = scoreTrajectory(points, trend);
      errors.push(score.mae);
      maxima.push(score.maxError);
      if (scenario === 'spike' || scenario === 'typo') influences.push(pairedInfluence(trend, filterTrend(generateTrajectory(days, 'stable', seed, mass), method)));
      if (scenario === 'long-gap') {
        const resume = Math.floor(days * 0.60);
        recovery.push(average(points.slice(resume, resume + 7).map((point, index) => Math.abs(trend[resume + index]! - point.tissueKg))));
      }
      if (scenario === 'persistent-water') {
        const start = Math.floor(days / 2) + 14;
        waterBias.push(average(points.slice(start).map((point, index) => trend[start + index]! - point.tissueKg)));
      }
    }
    rows.push({ scenario, method, days, trajectories: errors.length, meanMae: average(errors), p95Mae: quantile(errors, 0.95), maxError: Math.max(...maxima), maxInfluence: influences.length ? Math.max(...influences) : null, gapRecoveryMae: recovery.length ? average(recovery) : null, persistentWaterBias: waterBias.length ? average(waterBias) : null });
  }
  return { rows, numericalFailures };
}

function noiselessProbes() {
  return METHODS.map(method => {
    const cut = Array.from({ length: 180 }, (_, day) => ({ day, kg: 80 - day * 0.06 }));
    const cutTrend = filterTrend(cut, method);
    const cutLagDays = average(cut.slice(120).map((point, i) => Math.abs(cutTrend[120 + i]! - point.kg) / 0.06));
    const step = Array.from({ length: 180 }, (_, day) => ({ day, kg: 80 - Math.max(0, day - 60) * 0.06 }));
    const trend = filterTrend(step, method);
    let transitionDelayDays: number | null = null;
    for (let day = 67; day <= 150; day++) {
      if (Array.from({ length: 5 }, (_, offset) => (trend[day + offset]! - trend[day + offset - 7]!) / 7).every(slope => slope <= -0.048)) { transitionDelayDays = day - 60; break; }
    }
    return { method, cutLagDays, transitionDelayDays };
  });
}

function summarize(result: ReturnType<typeof runResearch>) {
  return SCENARIOS.flatMap(scenario => METHODS.map(method => {
    const rows = result.rows.filter(row => row.scenario === scenario && row.method === method);
    return { scenario, method, meanMae: average(rows.map(row => row.meanMae)), maxHorizonP95Mae: Math.max(...rows.map(row => row.p95Mae)), maxError: Math.max(...rows.map(row => row.maxError)), maxInfluence: rows[0]!.maxInfluence === null ? null : Math.max(...rows.map(row => row.maxInfluence!)), gapRecoveryMae: rows[0]!.gapRecoveryMae === null ? null : average(rows.map(row => row.gapRecoveryMae!)), persistentWaterBias: rows[0]!.persistentWaterBias === null ? null : average(rows.map(row => row.persistentWaterBias!)) };
  }));
}

export function main() {
  const started = performance.now();
  const primary = runResearch(Array.from({ length: 20 }, (_, i) => 101 + i), HORIZONS, MASSES);
  const heldOut = runResearch(Array.from({ length: 20 }, (_, i) => 1001 + i), HORIZONS, MASSES);
  const probes = noiselessProbes();
  const result = { protocol: '2026-09-23-fixed-v1', node: process.version, elapsedMs: performance.now() - started, primary, heldOut, probes, summaries: { primary: summarize(primary), heldOut: summarize(heldOut) } };
  if (process.argv.includes('--json')) { console.log(JSON.stringify(result, null, 2)); return; }
  console.log(`Node ${result.node}; elapsed ${result.elapsedMs.toFixed(0)} ms; numerical failures ${primary.numericalFailures + heldOut.numericalFailures}.`);
  console.log('Per seed group: 2,700 scenario/mass/seed/horizon combinations, each tested with 3 methods (8,100 filtered trajectories). Paired combinations share noise draws; they are not independent samples.');
  for (const [name, rows] of Object.entries(result.summaries)) {
    console.log(`\n### ${name}\n\n| Scenario | Method | MAE kg | Worst horizon p95 MAE | Max error kg | Paired influence kg | Gap recovery MAE kg | Water bias kg |\n|---|---|---:|---:|---:|---:|---:|---:|`);
    for (const row of rows) console.log(`| ${row.scenario} | ${row.method} | ${[row.meanMae, row.maxHorizonP95Mae, row.maxError, row.maxInfluence, row.gapRecoveryMae, row.persistentWaterBias].map(value => value === null ? '—' : value.toFixed(4)).join(' | ')} |`);
  }
  console.log('\n### Noiseless probes\n\n| Method | Cut lag days | Slope transition delay days |\n|---|---:|---:|');
  for (const probe of probes) console.log(`| ${probe.method} | ${probe.cutLagDays.toFixed(4)} | ${probe.transitionDelayDays ?? '>90 (censored)'} |`);
  console.log('\n### Held-out MAE by horizon (equal scenario weights)\n\n| Days | EWMA | Robust EWMA | Robust Kalman |\n|---:|---:|---:|---:|');
  for (const days of HORIZONS) console.log(`| ${days} | ${METHODS.map(method => average(heldOut.rows.filter(row => row.days === days && row.method === method).map(row => row.meanMae)).toFixed(4)).join(' | ')} |`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
