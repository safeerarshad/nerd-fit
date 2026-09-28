# Trend research comparison

## Preregistered protocol

Recorded 2026-09-23 before executing the comparison. This is a research experiment, not production code, clinical validation, or expenditure-engine finalization. The settings below will remain fixed for this run. Any later change must be labeled exploratory and rerun against new held-out seeds.

**[NERD FIT DESIGN DECISION]** Compare causal ordinary EWMA, residual-bounded robust EWMA, and robust local-linear Kalman candidates. EWMA time constant is 7 days and measurement gap influence is capped at 3 days. Robust EWMA clips innovations at 1 kg. Kalman starts with level variance 0.25 kg², slope variance 0.0025 (kg/day)², measurement variance 0.25 kg², level process variance 0.001225 kg²/day, and slope diffusion variance 0.000016 (kg/day)²/day. It inflates observation variance by squared residual magnitude above 1 kg. Forecast slope is zeroed after seven unobserved days. These are deliberately fixed engineering hypotheses, not parameters inferred from competitors or established by trials. Neither filter's internal variance is a calibrated confidence claim.

Data generator: independently specified latent tissue trajectories plus autocorrelated water (AR coefficient 0.85), 28-day water cycle, Gaussian scale noise, and occasional missing readings. Starting masses 55, 80, 110 kg; cut slope −0.06 kg/day; bulk +0.025 kg/day. The generator does not call filter equations. Scale/water noise amplitudes vary deterministically by seed. Horizons: 30, 90, 180, 365, 730 days. Scenarios: stable, cut, bulk, 2 kg one-day spike, 10× weight typo, random missing readings, long observation gap, persistent 1.5 kg water shift, and a true tissue-slope transition. All contain ordinary water/noise, including the otherwise stable scenario. Long cut slopes are bounded by a 45 kg tissue lower limit. Matched clean/corrupted runs share random draws. Primary seeds 101–120 and separately reported held-out seeds 1001–1020 are fixed in advance, with no tuning after primary results.

Metrics: tissue-trend MAE after the first 7 days; trajectory-level p95 MAE; maximum absolute tissue error; paired maximum effect of one corrupted observation; clean noiseless cut lag (error divided by 0.06 kg/day); noiseless slope-transition delay to a seven-day trend slope reaching at least 80% of the true slope for five consecutive days; post-gap mean error during the first seven resumed days; and persistent-water mean bias from 14 days after the step. Missing-day predictions count in error metrics. Initialization is scored separately via untrimmed max error. Censoring is reported when delay is not reached within 90 days. Estimates before the first real observation are null and are not scored as numeric predictions.

Selection criteria, fixed before running:

1. Every candidate must be causal, deterministic, preserve input, produce null before the first observation, and produce finite output thereafter for valid data. Reject invalid, duplicate, or out-of-order days. No fabricated measurement update on a missing day. Zero numerical failures.
2. A robust candidate must reduce the maximum paired 10× typo influence by at least 80% against ordinary EWMA and keep paired one-day 2 kg spike influence at or below 0.35 kg.
3. Relative to ordinary EWMA, its mean tissue MAE across stable/cut/bulk must be no more than 20% worse, and no one of these scenarios may be more than 35% worse, on both primary and held-out seeds.
4. Sustained-cut lag must be at most 10 days and slope-transition delay at most 21 days in the noiseless probe. This is responsiveness evidence, not a guarantee under noisy water.
5. A more complex candidate earns preference only if its equal-scenario mean MAE improves at least 10% over the simpler eligible robust candidate on both seed groups, and its long-gap mean MAE is not more than 20% worse. If neither qualifies, retain a research-only result and state why. No production default is automatically selected.
6. No numeric gate is imposed on persistent-water bias because scale-only filters cannot identify whether a permanent step is water or tissue. This scenario must be reported prominently as an identifiability failure, even if all other criteria pass.

## Execution and results

Executed on Node v24.19.0 on 2026-09-23, with no new dependencies and no parameter tuning after results. All 16,200 filtered trajectories across the primary and held-out seed groups produced finite outputs. The first full comparison took approximately 1.9 seconds in this environment; this is not an Android performance measurement. Combinations share noise draws across masses, scenarios, and nested horizons, so 16,200 is a workload count, not an independent statistical sample size.

Reproduce the results from the repository root:

```powershell
node --test src/tests/simulation/trend-research.test.ts
node scripts/research/compare-trends.ts
node scripts/research/compare-trends.ts --json
npm test
```

The JSON command contains every horizon/scenario/method row, counts, p95 error, maxima, paired influence, gap recovery, and water bias. The plain command prints the tables below. No output file is written by the harness. Repeated runs have the same metric values; elapsed wall time varies.

### Selection against the preregistered gates

| Criterion | Robust EWMA | Robust local-linear Kalman |
|---|---|---|
| Invariants and finite outputs | Passed tested invariants; zero numerical failures | Passed tested invariants; zero numerical failures |
| Typo influence reduction ≥80%; spike influence ≤0.35 kg | Passed; held-out typo influence 0.2662 kg versus 132.8857 kg baseline; spike 0.2616 kg | Passed; held-out typo influence 0.1200 kg; spike 0.2452 kg |
| Basic-scenario MAE degradation limits | Passed both seed groups | Passed both seed groups, but stable-weight mean error is about 28% worse than EWMA |
| Cut lag ≤10 days; slope transition ≤21 days | Passed: 6.5119-day lag, 15-day transition delay | Passed: 0.0001-day steady-state lag, 12-day transition delay |
| Complexity improvement ≥10% in both seed groups | Simpler eligible comparator | Failed: equal-scenario MAE improvement is 7.30% primary, 7.56% held-out |
| Long-gap error within allowed degradation | Baseline for this comparison | Passed; improves mean gap scenario error and recovery |
| Persistent water shift | Cannot identify tissue versus water | Cannot identify tissue versus water; greater overshoot |

**Measured recommendation:** retain robust EWMA as the simpler research candidate under the preregistered rule, while keeping robust Kalman as a challenger for gap recovery and sustained cuts. Do not finalize or ship a production filter from this experiment alone. Kalman's average advantage did not reach the required 10%, and it increased stable-weight noise and permanent-water bias. The ordinary EWMA baseline is unsuitable without a separate typo-handling layer.

Equal-scenario/horizon average MAE was 0.3473 kg (robust EWMA) versus 0.3220 kg (robust Kalman) in primary seeds, and 0.3540 versus 0.3273 kg held-out. Aggregation uses equal weights for each of nine scenarios and five horizons, not weights based on how frequently users experience them. The lowest aggregate error is not by itself a deployment decision.

### Important failure cases and interpretation

- Robust EWMA's slow recovery after long gaps is material: held-out first-seven-resumed-day MAE averages 2.1335 kg versus Kalman's 0.3022 kg. Neither should present a held pre-gap value as current, reliable tissue weight. This motivates a separately tested gap/reacquisition policy, not an unreported tweak to this experiment.
- All filters absorb a sustained +1.5 kg water step. From 14 days after the event, held-out mean bias is +1.4438 kg for robust EWMA and +1.6164 kg for Kalman. Kalman can overshoot because it models slope. A filter level must not be labeled measured fat or tissue mass.
- Holding or limited forecasting during the 730-day scenario's roughly 182-day gap permits worst errors of several kilograms. The harness scores missing days; production should explicitly mark stale estimates. This research contains no expenditure or calorie-adjustment evaluation.
- The first measurement is accepted as initialization. A typo in that first reading, several consecutive typos, observation bias drift, changing noise amplitude within a trajectory, and unexpected slope reversals during a long gap were not tested here. Current results establish isolated post-initialization outlier resistance only.
- The 1 kg clipping/inflation scale is fixed for all three body sizes; water processes do not scale with body mass. Seeds vary noise amplitudes, but parameters are not learned from individuals. The experiment does not establish that this fixed threshold is appropriate for every body size or clinical context.
- Noiseless lag and transition probes describe clean response. They are not evidence of zero lag or a 12-day detection guarantee in real noisy observations. The synthetic long cut is limited at 45 kg; that floor is a generator boundary, not a weight recommendation.
- The p95 column below is the largest horizon-specific p95 trajectory MAE, not a pooled p95 or confidence bound. Warmup removes seven array positions from MAE; generated data have one position per elapsed day. Max error includes initialization. Permanent-water metrics for 30-day runs contain only the final day after the 14-day settling period; compare long horizons through JSON for stable conclusions.
- No clinical data, expenditure model, adaptive tissue partition, nutritional completeness, uncertainty coverage, or treatment effect is tested. Internal Kalman covariance is intentionally not displayed as a confidence percentage or calibrated probability.

### Verification record

The initial API scaffold produced 19 failing behavior tests before implementation. After implementation, all 19 comparator tests passed. The repository test command also passed all 23 tests available at that run (19 research, four migration/integration tests). Type checking later exposed generic inference from `.map(Object.freeze)` in the frozen-input test; using an explicit callback fixes its type without changing behavior.

Final verification: `npm test` passed 23/23; `npm run typecheck` passed; `npm run lint` passed. Because repository lint configuration excludes the research directory, the harness was additionally checked with `npx --no-install eslint scripts/research/compare-trends.ts --no-ignore --max-warnings=0`, which passed. `git diff --check` reported no whitespace errors (unrelated tracked files produced line-ending conversion notices). All comparisons were rerun after the type-only test fix, with unchanged metrics.

Verified SHA-256: harness `BE60E3D900249196E7578B56AF5C138E1C857D02AFBFC06789F27852FE963656`; test `392119B7DA92B75EDC8ABADA5F513528070E7F67AD722CAB6A2D6811D8A7DA02`. No production files were edited and no commits were created for this subtask.

### Raw measured tables
Node v24.19.0; elapsed 1929 ms; numerical failures 0.
Per seed group: 2,700 scenario/mass/seed/horizon combinations, each tested with 3 methods (8,100 filtered trajectories). Paired combinations share noise draws; they are not independent samples.

### primary

| Scenario | Method | MAE kg | Worst horizon p95 MAE | Max error kg | Paired influence kg | Gap recovery MAE kg | Water bias kg |
|---|---|---:|---:|---:|---:|---:|---:|
| stable | ewma | 0.1730 | 0.2781 | 1.0698 | — | — | — |
| stable | robust-ewma | 0.1727 | 0.2781 | 1.0698 | — | — | — |
| stable | robust-kalman | 0.2210 | 0.4114 | 1.2916 | — | — | — |
| cut | ewma | 0.3608 | 0.6194 | 1.3230 | — | — | — |
| cut | robust-ewma | 0.3634 | 0.6203 | 1.3261 | — | — | — |
| cut | robust-kalman | 0.2276 | 0.4904 | 1.2916 | — | — | — |
| bulk | ewma | 0.2224 | 0.3333 | 1.2326 | — | — | — |
| bulk | robust-ewma | 0.2221 | 0.3333 | 1.2326 | — | — | — |
| bulk | robust-kalman | 0.2212 | 0.3794 | 1.2916 | — | — | — |
| spike | ewma | 0.1778 | 0.3517 | 1.0698 | 0.2662 | — | — |
| spike | robust-ewma | 0.1726 | 0.3196 | 1.0698 | 0.2313 | — | — |
| spike | robust-kalman | 0.2211 | 0.4692 | 1.2916 | 0.2980 | — | — |
| typo | ewma | 8.9817 | 38.1692 | 133.1386 | 132.6946 | — | — |
| typo | robust-ewma | 0.1726 | 0.3196 | 1.0698 | 0.2313 | — | — |
| typo | robust-kalman | 0.2205 | 0.4193 | 1.2916 | 0.1882 | — | — |
| missing | ewma | 0.2842 | 0.5442 | 1.2495 | — | — | — |
| missing | robust-ewma | 0.2853 | 0.5443 | 1.2255 | — | — | — |
| missing | robust-kalman | 0.2226 | 0.4938 | 1.2087 | — | — | — |
| long-gap | ewma | 0.6115 | 1.4452 | 8.3637 | — | 1.2197 | — |
| long-gap | robust-ewma | 0.6955 | 1.8199 | 8.3637 | — | 2.1321 | — |
| long-gap | robust-kalman | 0.4538 | 1.2920 | 8.0829 | — | 0.3094 | — |
| persistent-water | ewma | 0.7754 | 0.9361 | 2.4322 | — | — | 1.4526 |
| persistent-water | robust-ewma | 0.7574 | 0.9325 | 2.4320 | — | — | 1.4395 |
| persistent-water | robust-kalman | 0.8673 | 1.2465 | 2.5995 | — | — | 1.6154 |
| activity-transition | ewma | 0.2835 | 0.4096 | 1.3230 | — | — | — |
| activity-transition | robust-ewma | 0.2843 | 0.4114 | 1.3261 | — | — | — |
| activity-transition | robust-kalman | 0.2427 | 0.5153 | 1.2956 | — | — | — |

### heldOut

| Scenario | Method | MAE kg | Worst horizon p95 MAE | Max error kg | Paired influence kg | Gap recovery MAE kg | Water bias kg |
|---|---|---:|---:|---:|---:|---:|---:|
| stable | ewma | 0.1776 | 0.3151 | 0.9623 | — | — | — |
| stable | robust-ewma | 0.1774 | 0.3151 | 0.9545 | — | — | — |
| stable | robust-kalman | 0.2266 | 0.4754 | 1.1322 | — | — | — |
| cut | ewma | 0.3755 | 0.6216 | 1.3334 | — | — | — |
| cut | robust-ewma | 0.3774 | 0.6241 | 1.3338 | — | — | — |
| cut | robust-kalman | 0.2304 | 0.5123 | 1.1322 | — | — | — |
| bulk | ewma | 0.2154 | 0.4206 | 1.1251 | — | — | — |
| bulk | robust-ewma | 0.2153 | 0.4227 | 1.1251 | — | — | — |
| bulk | robust-kalman | 0.2272 | 0.5000 | 1.1322 | — | — | — |
| spike | ewma | 0.1850 | 0.3573 | 0.9623 | 0.2662 | — | — |
| spike | robust-ewma | 0.1792 | 0.3398 | 0.9545 | 0.2616 | — | — |
| spike | robust-kalman | 0.2263 | 0.5119 | 1.1322 | 0.2452 | — | — |
| typo | ewma | 8.9903 | 38.3141 | 133.4466 | 132.8857 | — | — |
| typo | robust-ewma | 0.1792 | 0.3398 | 0.9545 | 0.2662 | — | — |
| typo | robust-kalman | 0.2260 | 0.4806 | 1.1322 | 0.1200 | — | — |
| missing | ewma | 0.2963 | 0.4926 | 1.2756 | — | — | — |
| missing | robust-ewma | 0.2973 | 0.4926 | 1.2756 | — | — | — |
| missing | robust-kalman | 0.2276 | 0.4409 | 1.1453 | — | — | — |
| long-gap | ewma | 0.6248 | 1.3436 | 7.9399 | — | 1.2277 | — |
| long-gap | robust-ewma | 0.7061 | 1.7045 | 7.9399 | — | 2.1335 | — |
| long-gap | robust-kalman | 0.4578 | 1.1159 | 7.5626 | — | 0.3022 | — |
| persistent-water | ewma | 0.7864 | 0.9410 | 2.4427 | — | — | 1.4554 |
| persistent-water | robust-ewma | 0.7678 | 0.9300 | 2.4415 | — | — | 1.4438 |
| persistent-water | robust-kalman | 0.8750 | 1.2820 | 2.6343 | — | — | 1.6164 |
| activity-transition | ewma | 0.2860 | 0.4450 | 1.3334 | — | — | — |
| activity-transition | robust-ewma | 0.2867 | 0.4454 | 1.3338 | — | — | — |
| activity-transition | robust-kalman | 0.2486 | 0.6075 | 1.1322 | — | — | — |

### Noiseless probes

| Method | Cut lag days | Slope transition delay days |
|---|---:|---:|
| ewma | 6.5119 | 15 |
| robust-ewma | 6.5119 | 15 |
| robust-kalman | 0.0001 | 12 |

### Held-out MAE by horizon (equal scenario weights)

| Days | EWMA | Robust EWMA | Robust Kalman |
|---:|---:|---:|---:|
| 30 | 3.4252 | 0.2933 | 0.3286 |
| 90 | 1.3118 | 0.3398 | 0.3239 |
| 180 | 0.8164 | 0.3566 | 0.3077 |
| 365 | 0.5891 | 0.3793 | 0.3273 |
| 730 | 0.4893 | 0.4012 | 0.3488 |
