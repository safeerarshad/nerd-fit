# Build state

Updated 2026-09-27. Branch `astra-v1`; last committed source d24514c. No delivered APK yet. Immediate objective: coherent first signed standalone APK, then user phone feedback. Do not restart or work on main.

## Implemented

- Expo57/RN0.86/React19.2 scaffold; native generation succeeds for stable ID `dev.safeerarshad.nerdfit`, version0.1.0/code1. Removed expo-dev-client. SDK36, JDK17, Node24, TypeScript6.
- Four-step onboarding, deterministic initial Cut/Maintain/Bulk targets and weekly distribution, summary, Home, manual food capture/journal, raw weight capture/history, Settings units/glass/About, navigation.
- SQLite migrations1–3, atomic profile/goal/target persistence, target extension, food/weight/audit/status/settings persistence. Prior full suite69passed before added release/adapter tests.
- Signing safeguards tested: five credential-pair cases pass; seven native release guard cases pass. Script records public certificate fingerprint; private key/password outside Git under user .nerdfit/signing, DPAPI password. APK verifier checks signature/package/version/nondebug/bundledJS/credential files.
- Figma foundations saved; full design work blocked by tool quota. Trend candidate research exists but is not shipped as an adaptive coaching system.

## Current work and review findings

App/native/source files remain uncommitted. Reviewer identified invalid numeric draft crashes, step validation trap with prior uneven distribution, average macro mismatch, transaction connection foreign-key gap, and diary stale-date/date-capture bugs. Agents are correcting these with tests. Expo adapter queue fix and integration tests exist; onboarding/capture/preview and FoodScreen fixes are in progress. Root updated Strategy to pass profile units to PlanPreview. Lint currently fails in in-progress Capture/Food purity code; do not claim full checks pass.

## Build / environment

First protected signed release build started Sept27 through `npm run build:apk` (session13304 at checkpoint). No verified APK yet. Native regeneration succeeded. Local Android36 Google APIs x86_64 AVD `NerdFitTest` created; headless emulator started PID2744, logs `.work/emulator-*.log`. No physical phone required. SDK/signing/network access uses explicit sandbox escalation. Earlier account usage-limit failures interrupted work; never bypass approvals.

## Exact next actions

Finish and verify reviewer fixes; run full typecheck/lint/tests and Expo dependency/config checks. Inspect active Gradle build; fix native errors. Run final build after all source edits, inspect actual APK through verifier, install and smoke-test in emulator without Metro (onboarding, food/weight, relaunch persistence/settings). Security agent running installed Codex Security + dependency/secret checks; report real limits. Commit coherent source with Git permission; push astra-v1. Copy final signed APK to deliverables/NerdFit-0.1.0-build1.apk, record commit/time/SHA256/test status/known limitations in LATEST_BUILD.md and CHANGELOG.md. Open folder/highlight APK. No Play publication.

## Sept28 verified checkpoint

All reviewer fixes are applied. Fresh typecheck/lint and94 tests pass after Expo57.0.25/linking57.0.11/router57.0.23 compatibility updates; Expo dependency check passes. Stable internal key exists outside Git; public fingerprint recorded. PowerShell security/utility module imports are explicit to avoid inherited PS7 module conflicts, DPAPI text trimmed. Unused overlay/storage permissions blocked. Current release build session22489 is compiling Gradle, log .work/release-build.log; no APK yet. Emulator is booted. Security scan b8110e6d-8427-44dd-9a67-0f425be12232 is being finalized with artifact verification still pending.
