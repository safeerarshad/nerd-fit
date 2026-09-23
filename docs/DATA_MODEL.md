# Data model and migration contract

All dates use ISO local civil dates; instants use epoch milliseconds. Units are canonical kg, cm, kcal and grams internally. IDs are opaque text. Every mutable fact has created/updated timestamps or an immutable revision. Foreign keys, transactions, bounds checks, uniqueness and date indexes are required.

| Aggregate | Tables | Contract |
| --- | --- | --- |
| Person | profiles, preferences, settings | One active local profile; equation inputs and display units separate; no secrets |
| Planning | goals, goal_phases, goal_history, daily_targets | Forward-looking revisions; phase confirmation; one accepted target/date |
| Weight | weight_entries, weight_entry_overrides | Preserve raw kg, instant and source; normal/reduced/ignored overrides |
| Derived coaching | trend_weight_points, expenditure_estimates | Optional versioned caches with input revision; rebuildable |
| Food catalog | food_sources, foods, food_servings, custom_foods | Source ID/license/provenance; nutrients per100g; source-separated OFF cache |
| Timeline | food_entries, food_entry_items | Header contains idempotency key, instant/date/time/zone; child immutable nutrition snapshot |
| Recipes | recipes, recipe_items | Ingredient snapshot, cooked yield, servings, revision; history unaffected by edits |
| Personal relevance | favorites, recent_foods, food_usage_stats | User/food uniqueness; stats rebuildable from entries; avoid redundant recent cache initially |
| Day quality | nutrition_day_status | One row/date; explicit status, optional estimated kcal and confirmation time |
| Reviews | weekly_reviews, weekly_review_actions | Input/result snapshot; append-only accept/keep/remind decisions |
| Measurements | body_metrics | Optional measurement type/value/unit; never required by primary algorithm |
| Imports | health_connect_imports | Unique source/app/record ID and update version; idempotent ingestion |
| AI | ai_action_history, ai_memory | Visible local memories with expiry; validated draft/confirmed actions, no key |
| Audit | audit_events | Event kind/entity/date; minimal personal data, no raw API secrets |

Milestone migrations create only tables actively consumed; later migrations add remaining aggregates before their feature appears. This avoids unused tables masquerading as implementation. A complete schema is a target, not a completeness claim.

## Migration rules

`PRAGMA user_version` advances only inside the same exclusive transaction as schema changes. Enable foreign_keys per connection and WAL outside migrations. Reject newer unknown schemas. Test fresh DB, repeat open, upgrade from every shipped fixture, failed migration rollback and foreign-key integrity. FTS5 indexing and triggers transact with catalog writes; rebuilding from catalog is supported.

## Restore

Validate version, object shapes, row counts, byte limits, dates, finite numeric bounds, allowed fields, referential integrity, nutrient sanity and unique IDs before opening the replacement transaction. Stage/validate separately, then replace in dependency order with constraints on. Roll back on any exception. Keys never enter JSON. Export includes canonical units, source licenses and a schema version. User confirms before replacing data; corrupt backup leaves the existing DB untouched.
