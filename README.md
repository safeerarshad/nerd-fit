# Nerd Fit

An Android-first, local SQLite fitness journal. The first test slice includes onboarding, initial Cut/Maintain/Bulk calorie and macro plans, weekly distribution, manual food and scale logging, history, and unit/appearance settings. Adaptive expenditure, weight trends, food databases, scanners, AI, Health Connect and backup/export remain future milestones.

Test APK identity: `dev.safeerarshad.nerdfit`, version `0.1.0`, build `1`. Work stays on `astra-v1`.

## Development

Use Node24, JDK17 and the Android SDK. Install the locked dependencies with `npm ci`. Validate with `npm run typecheck`, `npm run lint` and `npm test`. Build the standalone internal release with `npm run build:apk` on the configured Windows account; it regenerates native configuration, reuses the protected signing identity and verifies the APK. No paid build service is required.

The internal credentials live outside Git; see [signing documentation](docs/INTERNAL_SIGNING.md). Never replace them to resolve a build error. Later delivered APKs must retain the package/certificate and increment versionCode.

See [build state](docs/BUILD_STATE.md) for actual progress and [delivery directive](docs/APK_DELIVERY_DIRECTIVE.md) for first-APK scope. A source checkout is not an installable delivery; an APK is ready only when its artifact and validation are recorded under `deliverables/`.
