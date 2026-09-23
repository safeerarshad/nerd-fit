# Algorithm evidence and research decisions

Research date: 2026-09-23. Milestone 0 research artifact. Status: evidence reviewed; candidate algorithms and numeric tuning parameters remain unvalidated. No simulation or clinical validation is claimed by this document.

## Scope and evidence vocabulary

Nerd Fit is an original nutrition tracker and coach. This document derives proposals from public research, elementary energy accounting, and explicitly identified engineering judgments. It does not reconstruct any competitor's undisclosed algorithm.

- **[PEER-REVIEWED EVIDENCE]** identifies a study, mathematical paper, synthesis, or peer-reviewed consensus. Study type and limits matter; a consensus is not an experiment.
- **[AUTHORITATIVE GUIDANCE]** identifies a government or National Academies reference. It is distinguished from experimental evidence.
- **[NERD FIT DESIGN DECISION]** identifies a proposed product policy, approximation, or parameter requiring implementation and testing.

The intended automatic-coaching population is adults. Evidence below does not establish suitability for children, pregnancy/lactation, eating-disorder treatment, illness causing fluid changes, or clinician-managed diets. This is an applicability boundary, not a claim that a calorie threshold can detect these conditions. [NIDDK's Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner) likewise limits its use to adults and excludes pregnancy/breastfeeding. **[AUTHORITATIVE GUIDANCE]**

## 1. Resting expenditure as an initial prior

**[PEER-REVIEWED EVIDENCE]** Mifflin et al. derived resting energy expenditure (REE) from indirect calorimetry in 498 healthy adults aged 19–78, including normal-weight and obese participants. The simplified published equations are:

```text
REE, kcal/day = 10 × mass_kg + 6.25 × height_cm − 5 × age_years + coefficient
coefficient = +5 for the study's male equation; −161 for its female equation
```

These estimate resting expenditure, not total daily energy expenditure (TDEE). A population fit does not establish individual accuracy, and the study's binary sex term does not validate an equation for every hormonal or physiological context. Source: Mifflin MD et al., 1990, *American Journal of Clinical Nutrition*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/2305711/?dopt=Abstract), DOI [10.1093/ajcn/51.2.241](https://doi.org/10.1093/ajcn/51.2.241).

**[NERD FIT DESIGN DECISION]** Use Mifflin as a transparent startup estimate, with a separately documented activity assumption. Label the result “starting estimate.” Allow a user-supplied known TDEE. Store the equation coefficient choice separately from gender identity; explain the limitation without inferring it from a name or appearance. A lean-mass equation is optional only when its required measurement and uncertainty are available. Activity factors are uncertain engineering priors, not measured exercise calories. Avoid adding wearable exercise calories on top of a factor that already includes training.

**[NERD FIT DESIGN DECISION]** As adequate observations accrue, empirical information should outweigh the initial prior. Do not continuously drag an experienced user's estimate back to Mifflin. After gaps, retain the last reliable estimate but mark it stale and widen uncertainty.

## 2. Dynamic energy balance and what can be inferred

**[PEER-REVIEWED EVIDENCE]** Hall et al. model changes in energy expenditure and allocation between fat and lean tissue. Their work explains why a permanent fixed calorie deficit does not produce indefinitely linear weight loss and why the same scale change can imply different stored-energy changes. Their tissue-energy parameters are 39.5 MJ/kg fat and 7.6 MJ/kg lean mass, approximately 9,440 and 1,816 kcal/kg. These are compartment parameters, not a conversion for every kilogram on a bathroom scale. Source: Hall KD et al., 2011, *The Lancet*, [article](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/), DOI [10.1016/S0140-6736(11)60812-X](https://doi.org/10.1016/S0140-6736(11)60812-X); [NIH research context](https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner).

**[PEER-REVIEWED EVIDENCE]** Hall and Chow estimated *changes in intake* from longitudinal weight and a public energy-balance model. In their simulated free-living conditions, more than 28 days of daily weights were required for their stated precision criterion. They identify water shifts near diet transitions and unknown activity changes as limitations. This supports using extended observations and uncertainty; it does not validate Nerd Fit, a universal 28-day readiness rule, or absolute TDEE from weight alone. Source: Hall KD, Chow CC, 2011, *AJCN*, [article](https://pmc.ncbi.nlm.nih.gov/articles/PMC3127505/), DOI [10.3945/ajcn.111.014399](https://doi.org/10.3945/ajcn.111.014399).

**[NERD FIT DESIGN DECISION]** Use the accounting identity over matched intervals:

```text
mean expenditure = mean actual intake − change in stored energy / elapsed days
```

A positive tissue gain subtracts from intake; a loss adds to it. The identity is not enough to identify expenditure: logged intake can be biased, water is not measured, and tissue partition is unknown. Consequently the output is an estimate conditional on logging and model assumptions. Persistent underlogging can appear as low expenditure; no trend smoother can discover the true missing calories from weight alone.

**[NERD FIT DESIGN DECISION]** Do not describe an estimator as a full Hall physiology model unless that model is independently implemented and verified. Do not adopt 7,700 kcal/kg as a universal law. A fixed-density estimator is a comparison baseline. Candidate production estimation should use an ensemble of plausible fat/lean partitions, permit different loss/gain assumptions, and show how this changes the estimate. Do not infer a precise body-fat fraction from BMI or scale weight. For sensitivity tests, span the published compartment endpoints plus persistent water shifts; do not call the endpoints a clinically validated personal interval. Synthesis costs and adaptive thermogenesis must have an explicit accounting convention to avoid counting them twice.

## 3. Goal rate evidence

**[PEER-REVIEWED EVIDENCE]** Garthe et al. randomized 24 athletes to intended loss rates of 0.7% or 1.4% body mass/week with resistance training. Actual rates were approximately 0.7% and 1.0%; the slower group had more favorable lean-mass outcomes. This small athlete study supports caution about rapid loss but cannot establish a universally safe maximum for all adults. Source: Garthe I et al., 2011, *International Journal of Sport Nutrition and Exercise Metabolism*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/21558571/), DOI [10.1123/ijsnem.21.2.97](https://doi.org/10.1123/ijsnem.21.2.97).

**[PEER-REVIEWED EVIDENCE]** Helms et al. studied intended maintenance, 5%, and 15% energy surpluses during eight weeks of resistance training. There were 21 entrants and 17 completers, mostly men. Faster weight gain primarily tracked higher skinfold gains; evidence for additional muscle gains was limited and some strength results differed. It does not establish an optimal gain rate for everyone or show that surplus is always required for hypertrophy. Source: Helms ER et al., 2023, *Sports Medicine - Open*, [article](https://link.springer.com/article/10.1186/s40798-023-00651-y), DOI [10.1186/s40798-023-00651-y](https://doi.org/10.1186/s40798-023-00651-y).

**[NERD FIT DESIGN DECISION]** Candidate recommended zones are cut 0.25–0.75% bodyweight/week, default 0.5%; bulk 0.10–0.25%, default 0.15%, with slower gain for experienced trainees. These are conservative product judgments, not experimentally established safe zones. Faster selections need an explanation and independent guardrails; merely choosing “mini-cut” changes no physiology. Do not promise gained weight is muscle. Maintenance has a zero desired rate and a gentle correction band.

**[NERD FIT DESIGN DECISION]** Store percentage/week and derive mass/week from current trend weight: `weekly_mass_change = trend_mass × signed_percentage / 100`. Display estimated dates as approximate windows. Recompute as weight and expenditure change. Initial calorie implications depend on tissue assumptions and are bounded; weekly reviews use new observations rather than repeatedly increasing deficits to chase a noisy scale reading.

## 4. Protein and dietary fat

**[PEER-REVIEWED EVIDENCE]** Morton's meta-analysis of resistance-training trials found diminishing additional fat-free-mass benefit around 1.6 g protein/kg/day; the estimated breakpoint has uncertainty. This is synthesis evidence, not a hard absorption limit, toxicity threshold, or proof that everybody needs exactly 1.6. Source: Morton RW et al., 2018, *British Journal of Sports Medicine*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/28698222/?dopt=Abstract), DOI [10.1136/bjsports-2017-097608](https://doi.org/10.1136/bjsports-2017-097608).

**[PEER-REVIEWED EVIDENCE]** Longland et al. compared 2.4 versus 1.2 g/kg/day during a substantial energy deficit plus intensive training. The higher intake produced better lean-mass and fat-loss outcomes. This short trial in young men supports considering higher protein during demanding cuts, not prescribing its severe deficit or training protocol to typical users. Source: Longland TM et al., 2016, *AJCN*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/26817506/?dopt=Abstract), DOI [10.3945/ajcn.115.119339](https://doi.org/10.3945/ajcn.115.119339).

**[AUTHORITATIVE GUIDANCE]** The 2005 US Dietary Reference Intakes set the healthy-adult protein RDA at 0.8 g/kg/day and the adult fat AMDR at 20–35% of energy. The RDA is not a sports-performance optimum, and the AMDR lower bound is not a demonstrated hormone-safe gram threshold. References: [National Academies protein context](https://www.nationalacademies.org/read/11325/chapter/4), [National Academies AMDR explanation](https://www.nationalacademies.org/read/10872/chapter/7). Current US 2025–2030 dietary guidance instead describes protein serving goals of 1.2–1.6 g/kg/day; keep policy targets distinct from the historical DRI and trial evidence. [US government guidance](https://realfood.gov/).

**[NERD FIT DESIGN DECISION]** Candidate defaults: 1.2 g/kg for a non-training maintenance/bulk user, 1.6 g/kg for resistance-training maintenance/bulk, and 1.8 g/kg for a cut, with preference adjustments informed by the evidence. These defaults do not address renal disease or other clinician-managed requirements. Scaling actual mass at extremes of adiposity can overprescribe; the specification must expose the mass basis and define a reviewed reference-mass policy before shipping, without pretending a consumer body-fat reading is precise.

**[NERD FIT DESIGN DECISION]** Use 25% of target calories as a normal fat preference and 20% as the initial planning lower bound, explicitly derived from the adult AMDR. It is an operational constraint, not a universal physiological minimum. Fat quality and essential fatty-acid adequacy are separate from total grams. With calorie shifting, enforce the bound on every day. Protein remains approximately stable and carbohydrate receives the residual: `(energy − 4 × protein_g − 9 × fat_g) / 4`. An infeasible or negative residual must return a conflict, not silently erase protein or fat. Store unrounded calculations and allocate rounding residuals explicitly.

## 5. Low energy availability and safeguards

**[PEER-REVIEWED EVIDENCE]** Loucks and Thuma manipulated energy availability for five days in 29 regularly menstruating young women and observed disrupted LH pulsatility below a study-specific level. This experiment does not establish a universal safe calorie floor for men, adolescents, all women, or long-term dieting. Source: 2003, *Journal of Clinical Endocrinology & Metabolism*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/12519869/), DOI [10.1210/jc.2002-020369](https://doi.org/10.1210/jc.2002-020369).

**[PEER-REVIEWED EVIDENCE]** The 2023 IOC consensus defines energy availability using intake minus exercise expenditure, divided by fat-free mass. It describes limitations of a universal 30 kcal/kg FFM/day threshold and greater uncertainty in males. It is a clinical consensus informed by varied evidence, not a validated consumer screening algorithm. Source: Mountjoy M et al., [IOC consensus](https://doi.org/10.1136/bjsports-2023-106994), DOI 10.1136/bjsports-2023-106994.

**[NERD FIT DESIGN DECISION]** Do not equate `(intake − TDEE)/FFM` with energy availability: TDEE includes resting and other energy expenditure. Do not issue a “safe” badge from unreliable wearable exercise calories or inferred FFM. No universal sex-based calorie number proves nutrition adequacy. Automatic plans need conservative rate and deficit limits, macro feasibility, population exclusions, and a hold path for unexpectedly rapid changes or concerning symptoms. Any numeric calorie floor is a disclosed product policy requiring review, not a biological guarantee. Confirmed fasting is valid historical intake data, not an automatically recommended fasting plan.

## 6. Scale noise and trends

**[PEER-REVIEWED EVIDENCE]** Bhutani et al. studied two-week free-living changes in 46 adults from two cohorts. Their average short-term change was predominantly fat-free mass; their reported energy density was much lower than a pure-fat conversion. This is evidence against interpreting short-term scale fluctuations as fat changes, not a reason to replace 7,700 with their group mean as another universal constant. Source: 2017, *Physiological Reports*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/28676555/), DOI [10.14814/phy2.13336](https://doi.org/10.14814/phy2.13336).

**[PEER-REVIEWED EVIDENCE]** Shiose et al. measured increased muscle glycogen and total body water after a controlled 72-hour carbohydrate-loading protocol in eight participants. It supports explicitly testing diet-related water transitions, but its hydration relationship does not identify the cause or exact water content of one user's weight change. Source: 2016, *Journal of Applied Physiology*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/27231310/), DOI [10.1152/japplphysiol.00126.2016](https://doi.org/10.1152/japplphysiol.00126.2016).

**[NERD FIT DESIGN DECISION]** Raw entries remain permanent; trend and outlier influence are derived and versioned. Users can use normally, reduce influence, or ignore for trend. Never label an unusual point “sodium,” “glycogen,” or “fat gain” without supporting information. Validate units and numeric values before statistical checks. Multiple entries on one day must not count as independent days of evidence.

**[NERD FIT DESIGN DECISION]** Compare these causal candidates, with all tuning recorded:

| Candidate | Strength | Failure mode to test |
|---|---|---|
| Ordinary time-aware EWMA | Small state, interpretable, stable | Spikes influence it; persistent slope lags |
| Robust time-aware EWMA | Limits isolated innovation influence | Can wrongly suppress sustained change |
| Local-linear Kalman filter | Explicit level/slope and missing-observation propagation | Process noise, Gaussian assumptions, and covariance can produce false certainty |
| Robust state-space filter | Can handle heavy-tail residuals | Extra assumptions and complexity must earn their cost |

**[NERD FIT DESIGN DECISION]** A practical starting candidate is robust EWMA for display. At an observed reading use `alpha = 1 − exp(−min(gap_days, gap_cap)/tau_days)` and update with a bounded residual. Derive residual scale robustly from prior observations only, with a documented minimum scale. No measurement means no fabricated weigh-in and no residual-scale update. Gap cap prevents the first post-break point gaining nearly total influence. A persistent same-direction residual must trigger adaptation/reinitialization of the derived level rather than permanent clipping. The exact tau, clipping rule, warmup, and persistence rule are unresolved until comparison tests. Interpolated chart points must remain distinguishable from observations. Causal historical values change only when past inputs/overrides or algorithm versions change; a future non-causal smoother must disclose routine historical revision.

## 7. Missing intake and statistical uncertainty

**[PEER-REVIEWED EVIDENCE]** Subar et al.'s OPEN study compared self-reported intake with energy/protein biomarkers in 484 adults. It demonstrated systematic reporting error in recalls and questionnaires. The participants and tools differ from real-time app logging, so its error percentages must not be used as an automatic correction factor for every Nerd Fit user. Source: 2003, *American Journal of Epidemiology*, [PubMed](https://pubmed.ncbi.nlm.nih.gov/12835280/), DOI [10.1093/aje/kwg092](https://doi.org/10.1093/aje/kwg092).

**[PEER-REVIEWED EVIDENCE]** Rubin's missing-data theory formalizes conditions under which the missingness process can be ignored. A missing-at-random assumption is not established merely because an app lacks data. Food logs can be selectively missing around holidays or high-intake days. Source: Rubin DB, 1976, *Biometrika*, [author's institutional record](https://dash.harvard.edu/entities/publication/73120378-8764-6bd4-e053-0100007fdf3b), DOI [10.1093/biomet/63.3.581](https://doi.org/10.1093/biomet/63.3.581).

**[NERD FIT DESIGN DECISION]** Each local date has one explicit nutrition status:

| Status | Estimator policy |
|---|---|
| COMPLETE | Use actual total; completeness does not guarantee accuracy |
| ESTIMATED | Use user-confirmed estimate with greater uncertainty |
| PARTIAL | Exclude until corrected |
| MISSING | Unknown, never zero or prescribed target |
| FASTING | Zero only after explicit confirmation of a complete fast |

**[NERD FIT DESIGN DECISION]** Interval alignment is mandatory. An estimate from weight change across 28 days requires intake for that same span. Averaging 23 complete nutrition days against a 28-day weight slope silently assumes the missing five resemble the observed days. Reject that shortcut. Start with contiguous eligible spans, or a future interval likelihood that leaves gaps unobserved and propagates uncertainty. The latter must not persist imputed food entries. A strict contiguous-span approach trades availability for defensibility and may often hold; measure that tradeoff before selecting it.

**[NERD FIT DESIGN DECISION]** Separate sources of uncertainty: observation noise, slope uncertainty, systematic intake bias, tissue-energy assumptions, gaps/freshness, and regime changes. Regression standard errors alone omit several of these. Overlapping daily windows are correlated; do not treat each as fresh independent evidence and collapse variance. Use qualitative states LEARNING, ACTIVE, HOLDING, RE-LEARNING with diagnostics, rather than an invented percent confidence. A numeric range is “model sensitivity range” until nominal statistical coverage has been tested; even a calibrated conditional interval does not cover unmodeled intake bias automatically.

## 8. Candidate Nerd Expenditure Engine v1

All steps below are **[NERD FIT DESIGN DECISION]**, proposed for evaluation rather than declared finalized.

1. Normalize inputs to local dates with immutable timestamps, units, provenance, and user overrides. Resolve duplicate weight imports before reducing to a daily observation. Food backfills invalidate affected derived estimates and pending reviews.
2. Keep display trend separate from expenditure fitting. Fit a robust local linear slope to accepted raw daily weights using actual elapsed times over matched eligible nutrition spans. Do not use heavily smoothed endpoint differences without accounting for their lag and correlation. Define morning-to-morning interval boundaries so a day's food is not offset from the corresponding weight change.
3. Evaluate candidate history spans of 21, 28, 42, and 56 days. Require coverage at both ends, adequate distinct weigh-in days, and recent observations. These are tuning alternatives, not literature-mandated windows. Longer history reduces noise but delays real activity changes.
4. Compute `candidate_expenditure = mean_actual_intake − rho × fitted_kg_per_day` over each admissible span and tissue-partition scenario. `rho` is a scenario-dependent net storage coefficient, not calories needed to grow one kilogram of muscle. Include loss/gain and water-shift sensitivity. Report which assumptions dominate uncertainty.
5. Blend into the previous reliable estimate cautiously, with per-update and weekly movement caps. Count new information, not repeated overlapping windows. Startup may mix with a broad Mifflin/activity prior; established estimates use that prior only as contextual plausibility evidence. Out-of-range candidates return a data-review/hold result rather than being silently clamped into apparent validity.
6. On missing spans, stale observations, large unresolved outlier burden, or diet-transition residuals, hold the last reliable estimate and explain why. Preserve old history. Re-enter adaptation gradually after renewed eligible observations. A goal change does not reset measured history or instantly change inferred expenditure.
7. Produce deterministic estimate, state, reasons, source interval, diagnostics, and algorithm version. Keep plan changes separate: weekly review recommends, the user accepts or keeps, and a persisted action creates future targets. Target adherence is descriptive and is never substituted for actual intake.

A fixed density plus smoothing may be useful as a deliberately simple baseline but would not satisfy a claim of accurately identifying dynamic tissue and water compartments. If the original conservative candidate cannot reliably resolve a scenario, holding is an acceptable modeled outcome. The UI must communicate reduced availability honestly.

## 9. Comparison simulation strategy and acceptance evidence

**[NERD FIT DESIGN DECISION]** No simulations have been run as part of this research document. Before default selection, implement reproducible experiments with fixed seeds and versioned fixtures for 30, 90, 180, 365, and 730 days. Generate physiological truth independently of the estimator; an estimator tested only against its own exact equation is insufficient.

Use at least three generators: a simple known slope/TDEE baseline; a public dynamic energy-balance model implemented from its published equations; and adversarial tissue/water/storage trajectories that deliberately violate estimator assumptions. Run a factorial or clearly documented sampled sweep over body size, starting-prior error, activity, noise, logging accuracy, and observation cadence. Do not assume a population's demographic variables determine its true metabolic response.

| Scenario family | Required variations |
|---|---|
| Goals | Stable maintenance, slow/aggressive cut, lean/fast bulk, maintenance corrections, cut-to-maintain-to-bulk |
| Scale observations | Independent noise, autocorrelated water noise, single spikes, persistent step, drifting offset, decimal/unit typo, consecutive unusual values |
| Physiological transitions | Activity steps and ramps, changing expenditure with mass, creatine-like water step, carbohydrate depletion/repletion, cyclic water changes, illness-like fluid disturbance |
| Missingness | Random missing weights, weekly-only weighing, long breaks, clustered missing food, systematically missing high-intake days |
| Intake quality | Confirmed complete, estimated totals, partial logs, confirmed fasting, systematic underlogging and changes in logging bias |
| Product history | Backfill, outlier override, unit change, timezone/day boundary, duplicate import, phase transition, returning after a long break |

Compare ordinary EWMA, robust EWMA, local-linear Kalman, and robust state-space candidates under the same seeds. Compare fixed-density expenditure, partition-sensitivity expenditure, and hold-last/prior-only baselines. Include both uninterrupted ideal data and routine incomplete-user patterns.

Report trend MAE and slope bias, TDEE bias/MAE against interval-average truth, worst-case deviation, spike influence, sustained-change detection delay, recovery after breaks, unnecessary target changes, holding frequency, numeric failure rate, runtime, and memory. Report group distributions and tails, not only average performance. If intervals are claimed, assess empirical coverage and interval width separately under each generator, especially correlated noise and biased intake. Use held-out seeds and parameter settings for final evaluation; do not tune and report on the same scenarios.

Predeclare comparative selection rules before running: zero violations of missing/partial/fasting invariants; no NaN or infinite output for valid bounded inputs; bounded adjustments; evidence that added complexity improves important errors without unacceptable delay; transparent failure cases. Define numeric accuracy and latency acceptance thresholds in the test specification before looking at results. Publish commands, seeds, parameters, metrics, plots, and limitations. Simulation performance is not clinical validation or a guarantee for individual users.

## 10. Outstanding decisions before shipping coaching

- Select trend and expenditure candidates from measured comparison results; resolve startup, gap, and persistence constants.
- Define interval boundaries, eligibility coverage, estimated-day uncertainty, and correlated-window update rules precisely.
- Decide a transparent tissue-partition policy and clarify what the displayed range means.
- Define reference mass for macro calculations at high adiposity and safeguards for unsupported populations.
- Review calorie/rate bounds and infeasibility behavior; no numeric safeguard is established by this document as universally safe.
- Test maintenance-band width and weekly correction caps against noise and delayed response.
- Validate on appropriately consented real-world data when available; obtain qualified nutrition review before representing the coaching as validated.

These are implementation and review work items. The cited studies inform the design but do not certify the final Nerd Fit algorithm.
