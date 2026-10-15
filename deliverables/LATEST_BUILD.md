# Nerd Fit 0.1.0 — build 1

First standalone internal test release, prepared for delivery 2026-10-15.

- Version: 0.1.0
- Android versionCode: 1
- Application ID: dev.safeerarshad.nerdfit
- Source commit: 5275c9d63059c967e2d4da9772b10fba22339be5 (subsequent commits update documentation only)
- Build completed: 2026-10-07T14:30:07+05:30
- APK: NerdFit-0.1.0-build1.apk
- Size: 66,280,607 bytes (63.21 MiB)
- SHA-256: 1d19172d067052f3ce5db6918ec8e9c8ba2e998ab5c1ae35be867ed43a60d3eb
- Certificate SHA-256: d71a4c664741e0da598960fb000ea805fdf55b9f2caf850f474dc6955c54d3b5
- Android: 7.0/API24 minimum; target36; arm64-v8a and x86_64.
- Exact path: C:\Users\arsha\Desktop\Projects\nerd-fit\deliverables\NerdFit-0.1.0-build1.apk

## Changes

Four-step onboarding; initial Cut/Maintain/Bulk calorie and macro plans; weekly distribution and summary; Home; manual food and weight capture/history; local SQLite persistence; units/glass preferences; version/build display. The app bundles JavaScript and runs without Metro, Expo Go, a development server or a connected PC.

## Verification

- Typecheck, lint and94 automated tests passed on Oct07. Expo configuration/compatibility and native generation passed for the locked candidate.
- Gradle release build succeeded in10m22s. APK signature v2 validates against the recorded3072-bit RSA internal certificate.
- Correct package/version; bundled JavaScript; debuggable disabled; no development launcher/menu component. Manifest requests Internet and vibration, with unused overlay/storage permissions removed.
- Credential-file scan and high-confidence secret-pattern scan of8 dex/assets entries returned no matches. This is not exhaustive binary secret detection.
- Android36 emulator: installation and cold launch in airplane mode with no ADB reverse forwarding; full synthetic Cut onboarding; generated Home targets;400-kcal food logging and correct diary macros/time/status;79.8-kg weight logging and history; settings saves and About version display.
- Force-stop/relaunch retained onboarding and food totals. Reinstalling this same signed APK with data preserved retained the weigh-in and imperial preference (175.93lb). A future higher-versionCode upgrade has not yet been exercised; it must keep package/certificate/schema compatibility.
- Exact delivery file signature/identity/bundle and SHA-256 reverified Oct15. No source changes since the tested app build.

## Known limits

Initial estimates only: adaptive expenditure/trends/reviews, food databases/scanners, AI, Health Connect and backup/export are future milestones. Icon/splash remain framework defaults pending polish. Full physical-device, foldable, accessibility and performance coverage is pending. Weight history currently exposes latest1000 readings; the food view caps a day at200 displayed entries while totals query the whole day.

Codex Security reported zero validated findings with partial coverage. Sept28 dependency audit recorded14 moderate propagated entries representing two underlying advisories, with no high/critical entries; see docs/THIRD_PARTY_LICENSES.md and docs/SECURITY_CHECKPOINT.md. The audit is dated, not a claim about newer advisories.

Core records stay local. Uninstalling or clearing app storage removes them; this test build has no backup/export. Future compatible APKs should be installed over the existing app. Internal certificate is separate from future Play signing. No Play publication occurred.

The local APK is the delivery artifact; no GitHub release asset was uploaded. Install it on the test phone and provide feedback before major visual changes.
