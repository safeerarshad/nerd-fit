# User flows

1. **First launch:** migrate DB → basics → goal → pace/activity → seven-day distribution → summary → transactional Done → Home. Failure retains editable inputs; success survives process death.
2. **Capture:** floating action → method → parse/search → candidates → editable review (amount/nutrients/source/date/time) → confirm → atomic snapshot log → refreshed totals + undo. Multiple submits share one idempotency token.
3. **Barcode:** real camera permission → scan → local cache → explicit network lookup → serving review; unknown → custom food/label. Permission or network failure has a useful alternate path.
4. **Label:** camera → on-device OCR → structured per100g/per-serving basis → sanity check → editable custom food. Unreadable text never becomes invented nutrition.
5. **Recipe:** ingredients/quantities → cooked yield/servings → save → log by serving or finished grams. Edits create future revisions only.
6. **Timeline:** chosen day → time-ordered virtualized entries → edit/move/copy/multi-select. Future entries are plans and not consumed intake. Backfill preserves entered zone/time.
7. **Weight:** kg/lb input → normalize → unusual-reading review → normal/reduced/ignored → save raw reading → derived trend refresh.
8. **Day recovery:** quality status → complete/partial/estimate/confirmed fast → explain effect on coaching → save. Missing and partial never become zero.
9. **Review:** this week → trend → quality → deterministic recommendation/why → accept/keep/remind. Acceptance atomically records action and future targets; history survives.
10. **Goal edit/phase transition:** same prefilled goal flow → preview → explicit confirm. All prior facts/targets/reviews retained.
11. **AI:** opt-in disclosure/key → minimal-context request → validated draft → review/confirm. Provider/offline failure returns control without altering facts. Memories have view/edit/delete/clear.
12. **Settings/data:** units/glass/reminders; export JSON/CSV; restore preview/confirmation; validation then transaction; reset confirmation. Health Connect uses individual permission requests and source-priority deduplication.

Every visible action must have an implementation and failure path. A planned feature belongs in documentation, never as an inert button.
