# Architecture

Decision date: 2026-09-23. Status: selected architecture; runtime validation tracked in BUILD_STATE.

## Boundaries

`app/` owns Expo Router routes only. `src/features/` owns user flows. `src/components/` contains shared accessible primitives; `src/design/` owns tokens, responsive rules, material and motion. `src/domain/` contains pure deterministic functions without React, network, wall-clock or SQLite imports. Clock/timezone are explicit inputs. `src/data/` owns versioned migrations, repositories and food-source adapters. `src/services/` wraps camera, OCR, Health Connect, AI, export and external food APIs. `src/tests/` separates domain, integration, simulation and fixtures.

Data flows from validated user intent → domain calculation → repository transaction → fresh query → visible result. One database provider gates rendering until migrations finish and presents a recoverable error screen. Domain calculations never run inside JSX. Parameterized SQL only for external values. Transactions serialize compound changes and enforce idempotency.

## Stack evidence

- [Expo SDK 57](https://expo.dev/changelog/sdk-57): stable SDK line uses RN 0.86 and React 19.2; select a patch beyond documented Hermes regressions. Registry read on 2026-09-23 reported Expo 57.0.24. `expo install --check` and lockfile determine compatible package versions.
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/): persisted database, FTS5 enabled by default/config plugin. Use WAL and foreign_keys; verify FTS on actual Android build. Node SQLite supplies real SQLite integration testing, not a pretend object store.
- [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur-view/): shared BlurTargetView rendered before overlays; `dimezisBlurViewSdk31Plus` avoids the slower older-Android path. Opaque/tinted fallback is always usable.
- [Local Expo builds](https://docs.expo.dev/guides/local-app-overview/) and [store builds](https://docs.expo.dev/deploy/build-project/): generate native Android and use Gradle wrapper. EAS is optional, never a prerequisite.
- [React Native environment](https://reactnative.dev/docs/set-up-your-environment): JDK17. Installed environment observed Node24.19.0/npm11.17.0/JDK17.0.20.1, Android platforms 36/36.1 and build tools 36.0/36.1/37. No connected adb device at initial inspection.

Use maintained Expo modules for SQLite, SecureStore, camera/barcode, haptics, files/sharing and notifications. Reanimated/Gesture Handler provide native motion. Skia is not initially justified: use bounded/simple charts until profiling establishes need. OCR and Health Connect need separate compatibility proof and license review before integration. Never install a stale bridge solely to expose a control.

## Persistence and invalidation

Raw facts are immutable in meaning and edits are audited. Trend, expenditure and reviews record algorithm version and input revision when cached. Editing contributing history invalidates derived values from the affected date. Accepted historical targets and review snapshots do not retroactively change. OFF records remain source-separated from USDA packs and user-created facts. Search merges result views, not source databases.

## Native generation and release

Development-only application ID: `dev.nerdfit.preview`. It is forbidden for store upload. Commit config plugins and generated native project/Gradle wrapper when validated; ignore local.properties, keys, keystores, caches and build outputs. Prebuild must not erase deliberate native changes: encode them in plugins and explicitly control regeneration. Debug APK may require Metro; internal standalone APK must include JS. Release AAB must not silently use debug signing.
