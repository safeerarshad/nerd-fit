# Nerd Fit product specification

Version 0.1 · 2026-09-23 · Greenfield · working branch `astra-v1`

## Intent and acceptance

Nerd Fit is a fast, intelligent, adaptive nutrition coach that learns from actual intake and body response. It is an original Android application, usable without an account, subscription, developer API key or network after foods are available locally. India is a first-class audience. All 81 sections of `SOURCE_DIRECTIVE.md` govern the product; this document organizes that scope, rather than reducing it.

Success requires a real installable Android APK, exercised persistent user flows, reproducible local Gradle builds, source/license provenance, automated domain/integration/simulation tests and a signing-ready AAB. A function or passing TypeScript check alone never establishes a complete feature. Release remains blocked until the permanent application ID, signing identity, device QA and store disclosures are resolved. No automatic store publication.

## Coherent experience

One four-step onboarding collects units, equation inputs and diet preference; goal mode/target; percentage rate and relevant activity; seven-day calorie distribution. A summary precedes one atomic Done operation. Home presents today's intake/remaining energy, macros, trend and coaching status. A reachable floating capture action opens one composer for text, search, recent, favorites, recipe, quick add, voice, barcode, label and optional photo assistance. Every uncertain interpretation goes through an editable review with local date, exact time, servings and provenance. Commit is idempotent and undoable.

Home, Food, Progress and Strategy form primary navigation. Settings and Nerd AI are secondary destinations. Pages share a Nerd Glass component system. Empty states teach the next real action; unfinished operations have no visible control. Charts and details use progressive disclosure. No fabricated user history is seeded.

## Functional contracts

- SQLite is authoritative for profile, goals, schedule, food, weight, recipes, review history and preferences. Routes and React state are disposable views of persisted state.
- Cut/Maintain/Bulk share one plan engine and one prefilled editor. Rates persist as percent bodyweight/week. Goal changes affect future targets and never delete history. Scheduled phase transitions require confirmation.
- Daily intake quality is explicit: COMPLETE, ESTIMATED, PARTIAL, MISSING, FASTING. New logs do not silently mark a day complete. Only confirmed fasting means known zero intake.
- Expenditure is adherence-neutral, deterministic and uncertainty-aware. Continuous estimates are separate from accepted weekly prescriptions. Gaps hold the last credible estimate; return from a break reacquires evidence.
- Weekly allocation preserves the exact budget. Protein stays stable, fat has a documented floor and carbohydrates absorb discretionary shifting. Infeasible plans explain the conflict rather than inventing negative macros.
- History stores nutrition snapshots; recipe/custom-food edits cannot change past logs. Food timestamps preserve UTC instant, entered local date/time, timezone and offset.
- Local food search uses FTS5 plus measured, tested personal relevance. USDA offline packs retain IDs and serving provenance. OFF cache remains a separate attributed source with explicit throttled online search. No unlicensed IFCT redistribution.
- AI is opt-in BYOK, draft-only at the action boundary. Deterministic functions calculate plans. Keys live in SecureStore. Local memory is visible/editable/deletable. AI-off and provider failures preserve all core tracking.
- Health Connect permissions are granular and optional; manual values win source conflicts. Imported records retain source record IDs. Wearable active calories never directly increase targets.
- Versioned JSON backup and CSV export work locally. Restore validates an entire candidate before a transactional replacement, preserving current data on any failure. Reset needs explicit confirmation.

## Visual and accessibility contract

Dark ink background, warm near-white type, restrained pale-green action accent and muted violet information accent. Solid tonal content surfaces support a small number of blurred floating overlays. Native Android blur uses SDK31+ efficient path with tinted fallback. 48dp minimum interactive targets, text scaling, semantics, color-independent states, reduce-motion support and safe-area/keyboard avoidance are mandatory. Compact, large, foldable, tablet and split-screen layouts use window width and content bounds, never a model-specific resolution.

## Delivery order

Milestones 0–15 follow the directive: evidence → scaffold/data → components → onboarding → food/search → capture → weight → expenditure → weekly/macro → reviews → AI → Health Connect/backup → polish → adversarial QA/security → APK → AAB. An early APK feasibility build runs during scaffold. Widgets and shopping/receipts follow reliable core delivery.

## Approach choice

Selected: Expo SDK 57 / React Native 0.86 / TypeScript with native prebuild and local Gradle. Native Kotlin-only would simplify Android integration but diverges from the preferred maintainable stack. A web wrapper would weaken native capabilities and is rejected. Expo Go is not the release or QA environment. Native dependencies are introduced only when their milestone needs them.

Algorithm selection is gated by evidence and simulations, not competitor formulas. Native runtime claims remain provisional until built and exercised on Android.
