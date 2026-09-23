# Nerd Fit implementation plan

> For agentic workers: use superpowers:executing-plans and test-driven-development. This repository's user-directed autonomous milestone execution overrides routine plan approval pauses. Read PRODUCT_SPEC and SOURCE_DIRECTIVE first.

**Goal:** Deliver the complete Android product described by the 81-section directive through verified milestones.

**Architecture:** Expo Router routes consume feature services backed by SQLite repositories. Domain functions remain pure. Native capabilities and optional network adapters do not own nutrition calculations.

**Stack:** Expo57, RN0.86, React19.2, TypeScript, SQLite/FTS5, Android JDK17/Gradle. Exact compatible pins come from Expo install/lockfile.

**Spec:** PRODUCT_SPEC.md, ALGORITHM_SPEC.md, DATA_MODEL.md, DESIGN_SYSTEM.md.

## Global constraints

Use astra-v1, no changes on main. No mandatory paid infrastructure. No secrets or unlicensed foods in Git. No fake controls. Do not mark features complete before real Android persistence/UI evidence. Development ID dev.nerdfit.preview blocks publication. Preserve all historical raw facts and snapshots.

## Review focus

Civil time across midnight/DST; duplicate submissions/process death; missing/partial data mislabeled as zero; corrupted/oversized imports; denied permissions/offline and font-scaled small windows. Add named behavioral tests in the owning task below.

## Execution ledger contract

BUILD_STATE records completed tasks, exact test evidence, known failures and next step after each milestone. TRACEABILITY_MATRIX contains end-to-end status. Documents persist even if native build cannot proceed. Each milestone ends with a scoped commit after verification; no generated credentials enter staging.

## Task 0 — Evidence and architecture

- [x] Research official competitors, inspect actual repo/license contents, and distinguish documentation claims.
- [x] Research nutrition evidence, food licenses, Expo compatibility/native paths.
- [x] Write first documents and preserve source directive.
- [ ] Review source URLs, document architecture assumptions and commit evidence.

## Task 1 — Installable scaffold and real SQLite foundation

Files: package.json/lockfile, app.config.ts, tsconfig.json, eslint.config.js, app/_layout.tsx, app/index.tsx, src/data/sqlite/{adapter,migrations}.ts, src/tests/integration/migrations.test.ts, scripts/android-build.mjs, native config plugin.

Consumes: selected stack; produces `Database` adapter (`exec`, `run`, `first`, `all`, `transaction`) and `migrate(db)`.

- [ ] Install Expo57 with matching React/RN/Router/SQLite/blur/safe-area dependencies, lockfile and local build scripts.
- [ ] RED real SQLite migration tests: fresh/reopen version1, invalid schema rollback, FK enforcement, FTS query, newer DB rejected. Run `npm test`; expected missing migration behavior failure.
- [ ] Implement transaction-safe migrations, db startup/error boundary and minimally reachable shell. No product tables without consumers.
- [ ] Run typecheck/lint/tests/Expo compatibility and prebuild. Inspect native package/permission/signing config.
- [ ] Build an early APK using Gradle; record full failure if unavailable. Device/emulator smoke launch and DB reopen are separate gates.
- [ ] Commit scaffold after evidence is recorded; PARTIAL if native QA unavailable.

## Task 2 — Nerd Glass components and navigation

Files: src/design/{tokens,responsive,motion}.ts, src/components/{Screen,Surface,Button,Field,GlassDock}.tsx, app routes; Figma IDs in FIGMA_STATE.

- [ ] Create Figma variables/components first, verify screenshots and contrast.
- [ ] Implement safe-area shell, responsive max widths, reachable dock and capture sheet; no inert destinations.
- [ ] Check reduced motion, font scaling/keyboard, accessibility roles and live navigation in Android.

## Task 3 — Onboarding and initial plan

Files: src/domain/{metabolism,goals,nutrition,calorieDistribution}/*.ts, src/features/onboarding/*, repositories/profile.ts, tests/domain/plan.test.ts, tests/integration/onboarding.test.ts.

Interface: `buildInitialPlan(input)` returns prior, requested/effective rate, seven day targets, macros and explanation; `completeOnboarding(db,input,plan)` writes profile/goal/targets/review schedule atomically.

- [ ] RED: invalid inputs/nonfinite rejected, literal Mifflin fixture, signed percentage recalculated with mass, exact weekly sum/rounding, negative macro conflict, transaction rollback and reopen.
- [ ] Implement four-step flow, summary and Done; same editor prefilled for future goal changes.
- [ ] E2E fresh install→Done→Home correct civil-day target→relaunch retains state. Record acceptance limits.

## Task 4 — Food pipeline/search

Files: scripts/food-pack/*, src/data/foodSources/*, repositories/foods.ts, services/openFoodFacts/*, tests/integration/search.test.ts.

- [ ] Build reproducible attributed compact USDA pack from official download with checksums, original IDs and nutrient basis. Never invent nutrients for nulls.
- [ ] RED FTS exact-name/brand/favorite/recent ranking and 10k query corpus; implement indexed search with safe tokenization and bounded result size.
- [ ] Source-separated OFF cache, explicit throttled lookup and response validator. Test malformed/missing nutrients/429/offline.

## Task 5 — Capture/timeline/recipes/native scans

- [ ] RED parser fixtures: all five directive examples, multiple foods, yesterday9pm, last night, ambiguous Monday, timezone/date preservation, unresolved serving review.
- [ ] Implement draft→editable review→idempotent transactional snapshots→undo; verify duplicate button presses do not duplicate entries.
- [ ] Recipe yield/fractional servings/edit history invariants, timeline backfill/future/copy/move, search/recent/favorite/repeat and quick add.
- [ ] Add real Expo Camera barcode, native OCR compatibility proof, label sanity validator and optional voice transcript. Actual camera denied/unrecognized/offline tests.

## Tasks 6–9 — Weight, expenditure, weekly plan/reviews

- [ ] RED raw-unit/override/typo tests; compare three trend candidates with reproducible independent generators and write simulation report.
- [ ] RED complete matched intervals/partial split/confirmed zero/long-gap holds/water shift cases. Implement selected expenditure candidate with diagnostics and explicit states.
- [ ] RED weekly budget/macro properties; apply accepted weekly review only to future targets, persist keep/remind actions.
- [ ] Maintenance band/phase transition confirmation/history retention E2E; no AI involved in decisions.

## Tasks 10–11 — Optional AI and platform data

- [ ] Verify current Gemini free-tier-compatible model/terms; SecureStore BYOK disclosure and strict schema tools. Malformed/rate-limited/offline never changes facts. Local memory CRUD.
- [ ] Health Connect native compatibility, granular permissions/manual priority/dedupe. Never add wearable calories.
- [ ] JSON/CSV versioned export, bounded validated restore with rollback, key exclusion and reset confirmation. Test corrupt/oversized/referential failures against real SQLite.

## Tasks 12–15 — Polish, QA and release artifacts

- [ ] Twelve Figma screen families and all meaningful states match implemented components; accessibility/resizing/native motion/haptics pass.
- [ ] Full simulations at30/90/180/365/730 days, 10k-entry latency/runtime profiling, Android E2E, dependency audit and connected Codex Security.
- [ ] Actual APK real-device flows and offline restart; document measured evidence and unresolved failures.
- [ ] Prepare signing-ready AAB, fail closed for missing signing and temporary ID in store mode, validate with bundletool and follow ANDROID_RELEASE_PLAN. Do not publish.

Later task details are expanded into scoped executable plans before their implementation; this roadmap does not count as completed software or as finalized untested algorithms.
