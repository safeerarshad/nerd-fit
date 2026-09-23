# Nerd Fit deterministic algorithm specification

Version: candidate v1, 2026-09-23. Evidence precedes this specification in ALGORITHM_EVIDENCE. All constants below are **[NERD FIT DESIGN DECISION]**, not competitor formulas or medical safety guarantees. Expenditure/trend tunings are not final until simulation comparisons run.

## Common contracts

All numeric inputs must be finite and physically meaningful; reject NaN, Infinity, negative quantities, zero height/weight and unknown enum values. Canonical units kg/cm/kcal/g. Pure functions receive dates/time explicitly. Use civil-date arithmetic for nutrition days; UTC elapsed time for instants. Preserve raw input, unit, zone and offset separately. No hidden reliance on target adherence.

## Initial plan

Mifflin resting prior: `10*kg + 6.25*cm - 5*age + coefficient`, coefficient +5/-161 selected transparently. Adults only for generated coaching; the tracker can retain data without producing an inappropriate recommendation. General-activity prior factors 1.35/1.55/1.75 describe low/moderate/high overall activity including training; do not also add workout calories. Advanced known TDEE replaces the startup prior, with validation and an estimate label.

Cut rate default0.5%/week, recommended0.25–0.75; bulk0.15, recommended0.10–0.25. Store the rate; derive signed kg/week from current trend. Initial energy implication is a sensitivity estimate, not a prediction: use a declared loss/gain tissue-mixture assumption and constrain cut deficit to at most20% of prior, bulk surplus to at most10%. Proposals beyond bounds report a slower effective rate. Do not imply “safe.” Block an infeasible macro plan. Automatic coaching is not offered as treatment for minors/pregnancy/lactation/eating disorders/clinician-managed conditions; clearly disclose applicability before plan acceptance without collecting unnecessary health history.

Protein planning basis initially current weight, with the basis exposed; extremes require a separately reviewed reference-mass policy before broad release. Defaults 1.2g/kg non-training maintenance/bulk, 1.6 training maintenance/bulk, 1.8 cut; adjustable preferences. Fat preference25% kcal, floor20% each day's kcal (adult AMDR planning rule, not a hormone guarantee). Carbs consume residual. Store precision and round display; reject protein/fat consuming more than target. Tests must independently check `4P+4C+9F` and no negative macros.

### Executable startup policy, revision 1

Automatic planning requires integer age18–78, mass40–250kg, height130–220cm, explicit supported-population acknowledgement, one equation choice, and a goal consistent with current mass. These bounds define this development model's operating range, not medical normality. Unsupported inputs return `status: 'tracking-only'` with no calorie/macro targets. Profile and a manual/no-target goal are still persisted; Home permits logging and shows no recommendation. The engine enforces eligibility regardless of UI.

For this startup calculation only, planning energy coefficients are loss7700 and gain5500 kcal per kg of desired weekly change. Sensitivity ranges are loss6000–9500 and gain3500–9000. These are explicit engineering approximations, not a universal density, full tissue-growth energy cost, or an expenditure estimator. The gain coefficient includes an unvalidated planning allowance rather than pretending stored energy alone is the total cost. The expected rate/date must be labeled approximate. Revisit against dynamic simulations and qualified review before release.

The average target starts at `TDEE + signedKgPerWeek * coefficient / 7`. Cap a cut deficit at20% and a bulk surplus at10% of TDEE and disclose the effective rate. Maintenance starts at TDEE. Cut goal must be lower, bulk higher; maintenance may use current mass. Age/height/mass and rate, activity, enum values and knownTDEE must be finite and validated. KnownTDEE allowed1200–6000kcal/day in development. Rate maximum1% cut and0.5% bulk; recommended ranges above remain distinct.

Each daily target must be at least `max(restingPrior, 0.75*TDEE)` and at most `1.5*TDEE`. This is a conservative product planning constraint, not a proof of safety or energy availability. Reject a distribution violating it and offer flatter weights; never silently change its weekly budget. Macro feasibility is checked independently on all seven days. Protein preference range1.0–2.2g/kg; fat preference20–35%kcal. High-adiposity reference-mass policy remains a release review item, not a claim the defaults suit everyone.

## Weekly allocation

Input weekly integer kcal budget and seven finite positive weights Monday→Sunday. Normalize, floor each allocation, distribute integer residual by descending fractional remainder with weekday tie-break. Exact sum equals budget. Even, weekend-heavy, weekday-heavy, training and custom generate weights; every preview goes through the same allocator. Infeasible low days trigger an explicit conflict. An event-day adjustment is an intentional schedule edit, never automatic punishment for intake.

## Weight candidate comparison

Raw scale values are permanent. Overrides: NORMAL, REDUCED, IGNORED. Display candidates: ordinary time-aware EWMA; robust EWMA with innovation clipping based on rolling median absolute deviation plus measurement floor; local-linear Kalman with robust observation handling. Compare causal results; any retrospective smoothing must be separately labeled. Single outliers require neutral review wording and never a claimed sodium/creatine diagnosis. Gap duration affects smoothing but cannot masquerade as observed weight.

## Nerd Expenditure Engine v1 candidate

Use matched contiguous spans of observed/explicitly estimated intake and sufficient weight endpoints. COMPLETE uses summed actual logs, ESTIMATED uses the confirmed estimate with greater uncertainty, FASTING uses confirmed zero. PARTIAL/MISSING split usable spans; never interpolate missing nutrition. Fit a robust slope to weights in the same interval and compute mean intake minus stored-energy change/day. Compare window candidates28/42/56 days and readiness coverage in independent simulations, rather than choosing a competitor's window.

Use sensitivity ensembles for loss/gain tissue partition and transient/persistent water. Report an assumption range separately from statistical uncertainty. Underlogging bias is not identifiable; no percentage confidence theater. Tune bounded update gain against simulations. Keep the prior until adequate data; once active, do not continually pull back toward activity factors. Hold last credible estimate during gaps and reacquire gradually on return. States LEARNING/ACTIVE/HOLDING/RE-LEARNING depend on coverage, freshness, history and outlier burden, with reasons shown.

## Reviews and maintenance

Continuous estimates never silently replace prescriptions. Weekly review stores input/algorithm-version snapshots and deterministic recommendation, reasons and quality limitations. Low quality recommends collecting data/holding. Acceptance transacts future targets plus append-only action; keep/remind persist too. Maintenance uses a candidate ±1% trend-weight band and capped gentle correction; compare stability/noise behavior before finalizing. Goal transitions always need confirmation. Exact target dates are forbidden; scenario ranges must account for changing mass and uncertainty.

## Validation still required

Select trend/window/estimator update parameters only after published simulation results, sensitivity checks, missing-day invariants and actual persistent UI integration. Candidate defaults are development values. A complete traceability path and appropriate review are required before presenting coaching as release-ready.
