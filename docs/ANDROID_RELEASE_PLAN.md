# Android build and release plan

Stable internal-test application ID: `dev.safeerarshad.nerdfit`. Version0.1.0/build1 is the first delivery candidate. Keep ID and test certificate stable across updates; increment versionCode for each delivered revision. The user's APK delivery directive authorizes this testing identity; an intentional production ID/upload-key strategy and explicit approval are still required before Play publication.

## Local pipeline

Node24, npm lockfile, JDK17, Android SDK36 and Expo57-generated Gradle wrapper. `npm run build:apk` regenerates Android native files, checks configuration, invokes Gradle `app:assembleRelease` with the protected internal key, then verifies the actual APK. The output bundles application JavaScript through Expo export:embed; Metro is a build-time bundler, not a required runtime service. No paid cloud build or Windows EAS-local dependency.

Before delivery: typecheck, lint, automated tests, Expo configuration/compatibility, native generation, Gradle success, nonempty APK, valid recorded signing certificate, correct ID/version, bundled JS/assets, nondebug manifest, no development launcher, secret review, and available emulator smoke tests. Record exact evidence and limits in deliverables/LATEST_BUILD.md. Copy the APK there and open the folder for the user. APKs/private credentials stay out of Git.

Native project/config plugins are versioned. local.properties, signing keys/passwords and generated build/compiler caches are ignored. See INTERNAL_SIGNING.md for the stable identity's storage/recovery policy. An unsigned `build:aab` is only a future packaging scaffold, not a Play-ready artifact.

## Future Play gates

- Recheck current Play target-SDK policy and final production ID.
- Production upload-key strategy, validated AAB/splits, original finalized store/adaptive icons and screenshots.
- Physical-device and broader responsive/accessibility/performance coverage.
- Privacy policy/Data Safety/permissions/Health Connect/AI disclosures matching the features actually shipped.
- Dependency/data-license attribution, security review, and explicit user publication approval.

Play publication is not authorized and is not a blocker for the internal test APK.
