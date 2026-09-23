# Food data: licenses, provenance and build plan

Research checked: **2026-09-23**. Milestone 0 evidence and engineering decisions; no production food pack has been built or validated by this document. Sources below are the publishers' documentation and license texts. Recommendations are labeled **Nerd Fit decision** and do not establish a legal exemption.

## Source decisions

| Source | Published terms / evidence | Nerd Fit v1 decision |
| --- | --- | --- |
| USDA FoodData Central (FDC) | USDA states its data are public domain, not copyrighted, and published under CC0 1.0. Source acknowledgment is requested. [USDA API guide, Licensing section](https://fdc.nal.usda.gov/api-guide/) | Build and bundle a versioned offline generic-food SQLite pack. Keep USDA attribution and original identifiers. No shared USDA API key in the APK. |
| Open Food Facts (OFF) | Database: ODbL 1.0; individual contents: Database Contents License; images: CC BY-SA 3.0, with possible separate packaging/artwork rights. [Publisher's terms source](https://raw.githubusercontent.com/openfoodfacts/openfoodfacts-web/main/lang/en/texts/terms-of-use.html) | Optional network packaged-product lookup, with a distinct OFF cache and explicit provenance. Preserve applicable notices on normalized records and exports. Do not import OFF into the USDA pack. |
| IFCT 2017 | Copyright notice permits acknowledged personal reproduction but requires prior written NIN permission for electronic reproduction/storage to create a product. [NIN's IFCT 2017 PDF, copyright page](https://www.nin.res.in/ebooks/IFCT2017.pdf) | Excluded from bundled data, scripts, fixtures and prompts used to generate a pack until redistribution permission is recorded. Public PDF availability is not permission to ship it. |
| User-created foods and recipes | User input has no external dataset license automatically attached. Ingredients can retain external provenance. | Private local records. Keep ingredient source links and any OFF-derived lineage; relabeling an OFF record as “custom” does not erase its origin. |
| Future Indian composition pack | No approved source or permission currently recorded. | Independently versioned adapter and pack manifest; import disabled until terms cover the actual distribution and use. |

## USDA offline pack

### Verified release candidates

The current [USDA download index](https://fdc.nal.usda.gov/download-datasets/) lists these releases and approximate archive sizes. These are publisher-reported sizes, not measurements from this repository:

| Dataset | Listed release | JSON archive / expanded | Role |
| --- | --- | --- | --- |
| Foundation Foods | April 2026 | 459K / 6.5M | Generic ingredients with analytical detail |
| FNDDS | 2021–2023, published October 2024 | 3.7M / 64M | Survey foods and household portions |
| SR Legacy | April 2018, final release | 12.3M / 205M | Selective coverage fallback |

The same index lists a much larger FNDDS CSV download (200M / 1.6G) and April 2026 branded JSON (195M / 3.1G). **Nerd Fit decision:** start with Foundation and FNDDS JSON; evaluate SR Legacy only for demonstrated gaps. Do not ship the full branded or all-data archives in v1. Confirm actual bytes, member names and record counts when downloading; do not infer final pack size from these figures. The index has some stale prose in its notes, so identify releases using the explicit release rows and filenames.

Pinned candidate URLs discovered from the index:

- [Foundation JSON, 2026-04-30](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2026-04-30.zip)
- [FNDDS JSON, 2024-10-31](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_survey_food_json_2024-10-31.zip)
- [SR Legacy CSV, 2018-04, optional](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip)

### Reproducible pipeline — proposed, not yet implemented

1. A maintainer explicitly selects releases in a source lock manifest. Record exact URL, retrieval time, original filename, SHA-256, declared license URL and release date. Download during food-pack maintenance, not normal application startup or every app build. No API credential is required for these static downloads. Keep original archives outside the app bundle and normal source history.
2. Validate ZIP entry paths, declared/actual sizes and input limits before extraction. Preserve the release documentation beside the raw source cache. Pin input hashes after the first inspected retrieval; a changed upstream archive requires a deliberate lock update.
3. Parse on the build machine into staging tables. Map by source nutrient identifiers, not translated nutrient names. Keep source food IDs, food type, original descriptions, source nutrient IDs/units, derivation metadata where supplied, and complete portion descriptions/gram weights. USDA's [Foundation documentation](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/) describes nutrient derivations, sample details and serving information; its [download field dictionary](https://fdc.nal.usda.gov/portal-data/external/dataDictionary) defines interchange fields.
4. Normalize food composition to an explicitly labeled basis. Preserve both the selected value and which source nutrient supplied it. Missing is null, never zero. Keep energy alternatives (for example general versus specific Atwater energy) distinguishable; define and test the selection rule before finalizing nutrition calculations. Never sum alternative energy nutrients. Preserve source carbohydrate/fiber definitions; do not invent a universal “net carbs” transformation.
5. Keep raw/cooked forms and distinct foods separate even when names are similar. Do not average Foundation/FNDDS duplicates. Add search aliases only through independently authored, reviewed mappings, retaining the original name. Regional alias matching must not claim the source measured an Indian recipe. Display dish estimates and recipe assumptions explicitly.
6. Emit a deterministic `usda-<release-set>-<schema-version>.sqlite` with food, nutrient, serving, source and source-specific FTS tables. Stable identity is `(source, data_type, source_food_id)`; pack version is separate. Include minimum tracking nutrients plus useful available micronutrients only when validated. Ship compact provenance sufficient to explain each selected nutrient; retain full raw source in the reproducible build cache.
7. Run referential-integrity checks, uniqueness checks, serving-weight validation, missing-value reports and source spot comparisons. Report accepted/rejected records and reasons. Measure compressed bundle bytes, installed bytes, cold-open time, and representative search latency on Android before choosing a size budget. No record count or latency claim is approved yet.
8. Install a new pack to a temporary path, verify schema/hash/integrity, then switch the active pack. A failure retains the last working pack. The user's database stores selected-food nutrition snapshots so replacing a pack never changes previous food logs.

**Attribution decision:** the app's data-sources screen and pack manifest identify “USDA Agricultural Research Service — FoodData Central,” link to FDC and CC0, and list the actual releases. Source details show the FDC ID. USDA says API keys must remain private; the static-pack architecture avoids distributing one. [USDA API guide](https://fdc.nal.usda.gov/api-guide/)

## Open Food Facts integration

### Verified network contract

As checked today, the [OFF API introduction](https://openfoodfacts.github.io/openfoodfacts-server/api/) specifies **15 product-read requests/minute/IP** and **10 search requests/minute/IP**, prohibits remote search-as-you-type, and requires a custom `AppName/Version (ContactEmail)` User-Agent. Global saturation can return 503. New integrations are directed to v3 (currently v3.6); v2 is deprecated but supported. The feature matrix has no v3 search: v2 supports structured filters, while plain-text search uses legacy CGI or the separately evolving Search-a-licious service. Documentation directs bulk consumers to dumps and testing to staging.

**Nerd Fit decisions:**

- Local search runs immediately across independent source indexes. Online search is a deliberate action with cancellation, normalized-query caching and a visible offline/error state. Do not call a remote service on every keystroke.
- Product reads use the documented v3 contract after a milestone-4 integration test. Do not construct an imagined `/api/v3/search` endpoint. Ship online text search only after its exact endpoint and terms have been verified; barcode and local search can ship independently.
- A local cache hit resolves a barcode without network access. Fetch only a missing product or an explicit/stale refresh. Request only fields used by the adapter, using the documented field-selection facility. [OFF official OpenAPI source](https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/ref/api.yaml)
- Conservative client ceilings: at most 12 product reads and 8 searches per rolling minute, one concurrent request per class, and duplicate-request coalescing. These are our limits, not OFF guarantees; other devices may share an IP. Honor `Retry-After` when present; back off on 429/503, suppress retry loops and retain usable cached results.
- Use a real maintainer contact in the User-Agent before network integration is released. Do not ship an invented contact or placeholder. API usage registration can be completed by the maintainer with that contact; this research did not submit any form or contact anyone.
- Store fetched time and upstream revision/last-modified metadata separately. Cache expiry never deletes historical logs. A tentative seven-day refresh interval and short negative-cache lifetime are product policy to validate, not source requirements. Unknown/malformed products lead to manual food or label capture.
- Barcode requests reveal the barcode, IP and app identifier to OFF. Text search reveals the submitted query. Do not send the user's profile, food diary or weight history. No automatic uploads of label photographs or custom foods.

### Attribution and share-alike handling

The [OFF terms](https://raw.githubusercontent.com/openfoodfacts/openfoodfacts-web/main/lang/en/texts/terms-of-use.html) require license identification and attribution linked to OFF or the relevant product page. The English document states that the French original prevails. Its official [license guidance](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side/) also distinguishes database, contents and images. v1 should omit third-party product images until image credit and reuse handling are implemented.

ODbL sections 4.2–4.6 address notices, publicly used derivative databases, collective databases and access to a machine-readable derivative or alteration method. Section 1 includes repeated small extractions in the substantiality assessment. Source separation alone does not decide whether a particular reuse is derivative. Software is outside the database license's scope under section 2.3; that does not remove obligations on data the software redistributes. [ODbL 1.0 legal text](https://opendatacommons.org/licenses/odbl/1-0/)

**Nerd Fit decisions:**

- Keep `off-cache.sqlite` distinct from the CC0 USDA pack and private `user.sqlite`. OFF normalization/indexing remains attributed OFF-derived data. Search federates results at runtime; it does not create a mixed redistributable master food catalog.
- Store favorites and recency as private references keyed by source identity. User diaries keep historical nutrition snapshots plus source lineage. Do not put usage history, identities or weight records in a public catalog export.
- An OFF food detail view and review sheet display a linked “Open Food Facts” source label. The data-sources screen and OFF export include ODbL and DbCL links, extraction date, adapter version and modification notice.
- Provide an OFF-only machine-readable cache export with applicable notices and publish the deterministic OFF normalization method with the application source. Audit the actual distributed artifact against section 4.6 before release. A link to upstream data alone is not treated as fulfillment for our transformed data.
- A personal backup uses named source sections and preserves notices/lineage. OFF-derived contents are never advertised as exclusively proprietary. Before supporting any publicly shared recipe/catalog export, assess its actual ingredient lineage and applicable terms. The answer must not be “all private diaries must be published”; no diaries are uploaded for licensing compliance.
- No bulk OFF pack ships in the initial APK. Any later country-specific pack needs its own manifest, license notices, reproducible extraction, distribution/access plan and review. A country tag alone is not proof of nutrition quality or complete Indian coverage.

## Minimum provenance contract

These are proposed application fields, not assertions that every upstream response contains them. Preserve upstream nulls and distinguish source values from Nerd Fit derivations.

| Level | Fields |
| --- | --- |
| Dataset / pack | `source_key`, `publisher`, `dataset_name`, `release_id`, `retrieved_at`, `source_url`, `license_id`, `license_url`, `attribution`, `archive_sha256`, `build_version`, `schema_version`, `artifact_sha256`, accepted/rejected counts |
| Food identity | `source_key`, `source_food_id`, `source_data_type`, original name, display name, language, barcode as text, brands when supplied, source product URL, upstream revision, upstream modified time, `fetched_at`, `pack_id` |
| Nutrient | canonical key, source nutrient ID/name, original amount/unit/basis, normalized amount/unit/basis, missing/estimated flags, upstream derivation/source metadata when present, conversion/selection rule version |
| Serving | source serving ID when present, original description/unit/quantity, gram weight when supplied, normalized amount, evidence for any density conversion; never infer grams from milliliters without a justified density |
| Cache metadata | HTTP/API version, selected response fields, bounded original source metadata, fetch/expiry status, raw payload hash where retained, adapter version, applicable notices |
| Committed log / recipe ingredient | immutable selected nutrition and serving snapshot, quantity, source identity/version, logged date/time, estimate indicator, overrides with lineage retained |

## India v1 and remaining gates

**Nerd Fit decision:** support India through verified USDA generic ingredients, OFF packaged products where available, local label entry/OCR, custom foods and user recipes with measured cooked yields. Ingredient-based estimates for rotis, curries and mixed dishes must expose editable quantities and assumptions. Do not market these as IFCT-derived or laboratory-measured Indian values.

| Gate | Status / next evidence |
| --- | --- |
| USDA permission basis | Established from USDA's CC0 statement. Actual archive retrieval, hashes, schema inspection, coverage and size/performance validation remain milestone-4 work. |
| OFF runtime integration | Requires actual API response/schema tests, real contact User-Agent and implemented request limiter/cache. Current rate limits must be rechecked before release. |
| OFF redistribution | Architecture proposed. Attribution surfaces, OFF-only export/alteration access, backup provenance and an audit of the exact shipped artifacts remain required. Do not claim a legal safe harbor from separate files. |
| IFCT | Blocked for product data inclusion without recorded written permission or an applicable new license. The official PDF rights text was retrieved through indexed excerpts; direct PDF fetching failed in this research session. No IFCT data were copied. |
| Third-party product images | Excluded until image-specific notices/rights handling are reviewed. |
| Food-data accuracy | Missing fields, raw/cooked ambiguity, label errors and regional recipe variation need validation and editable review. Dataset availability does not establish individual-record accuracy. |

The public OFF terms page returned no substantive browser text and the wiki blocked automated access. The publisher's official GitHub terms source, official API/license documentation and the ODbL text were readable and used above. Recheck the effective French terms and live service documentation during the release audit. No commercial dataset, competitor catalog or IFCT nutrition rows were imported as part of milestone 0.
