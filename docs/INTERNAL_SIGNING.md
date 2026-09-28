# Internal APK identity

First-delivery application ID: `dev.safeerarshad.nerdfit`. This replaces the undelivered generic placeholder before any test APK is distributed. Keep this ID stable for every compatible test update. Play ID remains a separate explicit prepublication decision.

The internal key lives outside Git at `%USERPROFILE%\.nerdfit\signing\nerdfit-internal.p12`, alias `nerd-fit-internal`. Password storage is a Windows-user-protected DPAPI file beside it (`password.dpapi`); directory inheritance is disabled and access granted to the current user. No password is printed, placed in command-line arguments or written to tracked Gradle properties. The build script passes credentials only through its child environment and clears them afterwards.

`scripts/build-internal.ps1` creates the key only when absent, validates/reuses it on later builds and refuses to replace an existing key with a missing password. DPAPI recovery requires the same Windows account/profile; losing the key/password prevents updating existing installs. Preserve both in a secure user-controlled backup before relying on this machine long-term. Never silently regenerate either for a failed build.

Internal APK uses the release build type: bundled JS, debuggable=false, same certificate across releases. Build ABIs: arm64-v8a and x86_64. No signing key is embedded in the APK. This certificate is not the final Play upload key. A store-release pipeline must use a separately chosen credential and intentional production ID.

Build1 targets version0.1.0. Every delivered revision increments versionCode. `deliverables/LATEST_BUILD.md` records the actual artifact/hash/certificate verification and commit. No artifact is declared ready until that verification succeeds.

The credential-pair guard is symmetric: either both key/password exist, or neither exists for the first build. A recorded public fingerprint in docs/INTERNAL_CERTIFICATE_SHA256.txt prevents recreating a lost pair. Every build compares the exported certificate fingerprint, regenerates native config, validates package/version/signing/bundling settings, and verifies the actual APK afterward. The fingerprint is public; no private material belongs in Git.
