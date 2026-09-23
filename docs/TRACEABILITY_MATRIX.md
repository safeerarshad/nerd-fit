# Traceability matrix

2026-09-23. Status is end-to-end status, not function existence. Paths below are intended ownership until implemented. PLANNED means no runtime claim. COMPLETE requires all ten quality gates in SOURCE_DIRECTIVE §74. A test name here is a requirement, not evidence it ran.

| Feature | User entry | UI | Domain | Database | Derived output | Automated test | Android E2E | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DB boot/migrations | Launch | Root provider/error | schema validation | all migrations | ready state | migration rollback/reopen | fresh/relaunch | PLANNED |
| Responsive Nerd Glass | All routes | shared components/dock | responsive tokens | preferences | adaptive layout | contrast/breakpoint | font/rotation/foldable | PLANNED |
| Onboarding/Done | First launch | onboarding | initial plan | profiles/goals/targets/reviews | roadmap/Home | atomic completion | onboarding/relaunch | PLANNED |
| Goal/rate editing | Strategy | same goal flow | goals | goals/history/phases | future targets | history retention | edit mode/rate | PLANNED |
| Weekly distribution/event | Goal flow | seven-day preview | calorieDistribution | daily_targets | exact weekly sum | budget invariants | edit custom week | PLANNED |
| Macros | Summary/Home | MacroProgress | nutrition | daily_targets | P/C/F | feasibility/rounding | target display | PLANNED |
| Local food packs | Capture/search | SearchField/FoodRow | ranking | foods/servings/sources/FTS | attributed candidates | pack provenance/ranking | offline search | PLANNED |
| OFF online search/cache | Explicit lookup | search/results | response validation | separate OFF cache | attributed candidates | throttle/cache/malformed | offline/rate-limit | PLANNED |
| Text/time parser | Capture | composer/review | deterministic parser | entry timestamp | dated candidates | locale/date/time/ambiguity | yesterday9pm | PLANNED |
| Review/log/undo | Capture review | FoodReview/Toast | nutrient validation | entries/items/audit | daily totals | idempotency/rollback | commit/undo/reload | PLANNED |
| Timeline/copy/move | Food | MealGroup | civil dates | entries/items | paged day totals | copy/move snapshots | backfill/future/multiselect | PLANNED |
| Quick/custom food | Capture | nutrient form | label sanity | custom_foods | food record | impossible nutrients | custom/reload | PLANNED |
| Barcode | Capture/scan | CameraView | barcode normalize | OFF cache | serving review | lookup contract | real scan/denied | PLANNED |
| Label OCR | Capture/label | camera/edit form | label parse | custom_foods | reviewed nutrients | label fixtures | real label/failure | PLANNED |
| Voice | Capture | voice input/review | transcript parser | entries/items | draft | speech/date fixtures | permission/voice | PLANNED |
| Photo | Capture | optional image draft | AI validation | action history | estimated draft | malformed/uncertainty | photo/failure | PLANNED |
| Recipe/yield/snapshot | Capture/recipes | ingredient editor | recipe nutrition | recipes/items/snapshots | per-serving/gram | history immutability | edit/log/reload | PLANNED |
| Favorites/recent/repeat | Capture | personal results | ranking/repeat | favorites/usage | relevant foods | ranking/usual serving | repeat breakfast | PLANNED |
| Weight/outlier | Capture/weight | weight form | outlier policy | entries/overrides | trend inputs | unit/typo/override | unusual reading | PLANNED |
| Trend/progress | Progress | charts/summary | trendWeight | raw/derived cache | causal trend | candidate simulations | ranges/accessible chart | PLANNED |
| Expenditure/calibration | Strategy/Home | status/explanation | expenditure/confidence | estimates | TDEE/state/reasons | matched spans/gaps | holding/return | PLANNED |
| Day-quality recovery | Food day | status sheet | quality policy | nutrition_day_status | usable coverage | partial!=complete | repair/fast | PLANNED |
| Weekly reviews | Home/Strategy | ReviewCard | weeklyReview | reviews/actions | proposal/accepted plan | deterministic/atomic | accept/keep/remind | PLANNED |
| Maintenance/phases | Strategy | plan/confirm | goals/maintenance | phases/history | gentle correction | bands/no silent switch | transition | PLANNED |
| Explain this number | Metrics | info sheet | explanations | version snapshots | transparent rationale | input/reason consistency | open/read | PLANNED |
| AI/BYOK/Wizard | Nerd AI | disclosure/chat/draft | tool validation | SecureStore/actions | confirmed structured draft | malformed/offline | AI off/key/failure | PLANNED |
| Local AI memory | Settings/AI | memory editor | expiry/validation | ai_memory | visible context | edit/delete/expiry | clear/reload | PLANNED |
| Health Connect | Settings | permission/source UI | priority/dedupe | imports/weight | normalized facts | source conflicts | real permission/import | PLANNED |
| Backup/restore/CSV | Settings | export/restore confirm | import schema | all nonsecret facts | portable backup | corruption/rollback | export/restore/reload | PLANNED |
| Units/glass/reset | Settings | settings | conversions | preferences | formatted values | unit roundtrip | units/reset cancel | PLANNED |
| Reminders | Settings | schedule | local scheduling | settings | actual notification | schedule/cancel | OS notification | PLANNED |
| Body metrics/photos | Progress | optional entry | normalization | body_metrics | history | validation | optional entry | PLANNED |
| Performance/security | All flows | failure states | boundaries | indexed/paged | measured QA | load/audit/scan | runtime profiling | PLANNED |
| APK/local Gradle | Install | application | build config | native SQLite | installable artifact | assemble/smoke | device install | PLANNED |
| AAB/Play preparation | Release workflow | store assets | signing gate | none | validated AAB | bundle/signing guard | splits install | BLOCKED |
| Android widgets | Launcher | post-core widget | summaries | queried facts | widget | widget refresh | launcher test | PLANNED |
| Shopping/receipts | Post-core | list/OCR | recipe aggregation | future schema | list | ingredient merge | shopping flow | PLANNED |
