# Test and quality strategy

Tests follow behavior, not implementation text. Write regression/domain expectations before product code and observe RED→GREEN. Typechecking is a build gate, never UI proof.

## Layers

- Pure TypeScript tests: equations, unit roundtrips, percentage rates, macro feasibility, weekly exact-sum allocation, date/time parser, weight overrides, missing/partial/fasting, uncertainty, review decisions and source priority.
- Actual SQLite integration: migrations, transaction rollback, constraints, onboarding atomicity/reopen, idempotent capture, recipe snapshot immutability, FTS relevance, history-preserving edits and corrupt restore rollback.
- Seeded simulations at 30/90/180/365/730 days: stable maintenance, slow/aggressive cut, lean/fast bulk, noise, water spike, typo, missing weight/intake, partial days, holiday, long gap/return, goal/activity change, creatine and diet-induced water transitions. Generate latent tissue and transient water independently of estimator. Compare plain/robust EWMA and local-linear state-space candidates; measure bias, RMSE, lag, outlier influence and hold behavior. Synthetic performance is not clinical validation.
- Android E2E: actual APK fresh install/onboarding/Done/relaunch, time-aware capture, custom food, recipes, barcode, OCR, weight/outlier, review/goal/unit change, backup/restore, AI failure and permissions. Use Maestro if installable and compatible; no unexecuted flow labeled passed.
- Performance: 10,000 entries, multi-year weight, large catalog/recipes. Record hardware/build/data size, p50/p95 search/query/startup, long-list frame behavior and chart timing. Prefer indexed/paged reads; no whole-table React state.
- Accessibility: screen reader, large font/display size, 48dp targets, contrast, reduced motion, keyboard, gesture/three-button navigation, rotation/split-screen/foldables.

## Completion gate

Reachable UI → interaction → domain consumption → SQLite persistence → visibly refreshed output → process reload → relevant automated checks → real Android flow → traceability updated. A missing link means PARTIAL. Security scan and dependency/license audit precede release. Signing, permanent ID and store disclosures remain separate release gates.
