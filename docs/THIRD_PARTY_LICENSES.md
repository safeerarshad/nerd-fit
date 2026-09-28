# Third-party packages, license inventory and advisory triage

Inventory refreshed **2026-09-28** from installed package metadata and `package-lock.json`. Publisher/registry research and the supplied `.work-audit.json` were checked on **2026-09-23**; those advisory counts and latest-version claims are historical, not a fresh network audit. The build coordinator reports 14 moderate entries after the latest Expo patch updates; the corresponding fresh JSON was not yet supplied to this reviewer, so the detailed 13-entry table below remains explicitly historical. This is a bounded inventory and static triage, not exploit validation, a license opinion or release approval. No packages were changed by this research.

The inspected lockfile SHA-256 is `ec232bacc3ac75e8216affbec808fc381a9c528edeb645762f885bee17336a3e`. This snapshot removes `expo-dev-client`, adds the native date/time picker and slider, and incorporates Expo 57.0.25 / Linking 57.0.11 / Router 57.0.23. The supplied audit predates this snapshot and counted 842 dependencies; the current lock contains 838 package instances. Refresh audit data before drawing conclusions about current advisory counts. Native/APK contents require a separate release inventory.

## Direct dependencies actually installed

Versions below come from each installed `package.json`, not merely the manifest's requested range. Source links identify the publisher repositories; the lockfile's resolved tarball and integrity identify the exact installed artifact. A package's declared license does not inventory every native binary, font or vendored file it may include.

| Package | Installed version | Declared license | Role | Publisher source |
| --- | --- | --- | --- | --- |
| @react-native-community/datetimepicker | 9.1.0 | MIT | Runtime native date/time input | [DateTimePicker](https://github.com/react-native-datetimepicker/datetimepicker) |
| @react-native-community/slider | 5.2.0 | MIT | Runtime native range input | [Callstack Slider](https://github.com/callstack/react-native-slider) |
| expo | 57.0.25 | MIT | Runtime/native framework plus build tooling | [Expo](https://github.com/expo/expo/tree/sdk-57/packages/expo) |
| expo-blur | 57.0.3 | MIT | Runtime overlay material | [Expo Blur](https://github.com/expo/expo/tree/sdk-57/packages/expo-blur) |
| expo-constants | 57.0.19 | MIT | Runtime app/environment metadata | [Expo Constants](https://github.com/expo/expo/tree/sdk-57/packages/expo-constants) |
| expo-haptics | 57.0.3 | MIT | Runtime haptics | [Expo Haptics](https://github.com/expo/expo/tree/sdk-57/packages/expo-haptics) |
| expo-linking | 57.0.11 | MIT | Runtime link integration | [Expo Linking](https://github.com/expo/expo/tree/sdk-57/packages/expo-linking) |
| expo-router | 57.0.23 | MIT | Runtime routing and development integration | [Expo Router](https://github.com/expo/expo/tree/sdk-57/packages/expo-router) |
| expo-sqlite | 57.0.3 | MIT | Runtime local database adapter | [Expo SQLite](https://github.com/expo/expo/tree/sdk-57/packages/expo-sqlite) |
| expo-status-bar | 57.0.1 | MIT | Runtime system-bar appearance | [Expo Status Bar](https://github.com/expo/expo/tree/sdk-57/packages/expo-status-bar) |
| expo-system-ui | 57.0.4 | MIT | Runtime root/system UI appearance | [Expo System UI](https://github.com/expo/expo/tree/sdk-57/packages/expo-system-ui) |
| react | 19.2.3 | MIT | Runtime UI | [React](https://github.com/facebook/react) |
| react-dom | 19.2.3 | MIT | Web/router peer; native-bundle inclusion not established | [React DOM](https://github.com/facebook/react/tree/main/packages/react-dom) |
| react-native | 0.86.3 | MIT | Android/native runtime | [React Native](https://github.com/react/react-native) |
| react-native-gesture-handler | 2.32.0 | MIT | Runtime gestures | [Software Mansion](https://github.com/software-mansion/react-native-gesture-handler) |
| react-native-reanimated | 4.5.1 | MIT | Runtime animation | [Reanimated](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-reanimated) |
| react-native-safe-area-context | 5.7.0 | MIT | Runtime safe-area layout | [App & Flow](https://github.com/AppAndFlow/react-native-safe-area-context) |
| react-native-screens | 4.26.2 | MIT | Runtime native navigation surfaces | [Software Mansion](https://github.com/software-mansion/react-native-screens) |
| react-native-worklets | 0.10.1 | MIT | Runtime worklet execution | [Worklets](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-worklets) |
| @types/node | 24.13.6 | MIT | Development types | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node) |
| @types/react | 19.2.18 | MIT | Development types | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) |
| eslint | 9.39.5 | MIT | Development linting; upstream EOL | [ESLint](https://github.com/eslint/eslint) |
| eslint-config-expo | 57.0.2 | MIT | Development lint configuration | [Expo ESLint configuration](https://github.com/expo/expo/tree/sdk-57/packages/eslint-config-expo) |
| typescript | 6.0.3 | Apache-2.0 | Development type checking | [Microsoft TypeScript](https://github.com/microsoft/TypeScript) |

The application manifest lists 19 regular and 5 development dependencies. `expo-dev-client` is absent from both the manifest and lock. That division is an installation category, not proof of APK contents: Expo pulls build tools through regular dependencies, while runtime bundles/native release variants determine what is actually shipped.

## Transitive notices and release inventory

All 838 lock entries had a declared license expression at this snapshot. Counts include optional platform packages and duplicate installed versions, so they are not counts of distinct projects or APK-shipped libraries.

| Declared expression | Lock entries |
| --- | ---: |
| MIT | 725 |
| ISC | 40 |
| Apache-2.0 | 26 |
| MPL-2.0 | 12 |
| BSD-3-Clause | 9 |
| BSD-2-Clause | 9 |
| BlueOak-1.0.0 | 6 |
| (MIT OR CC0-1.0) | 2 |
| Unlicense | 2 |
| 0BSD | 2 |
| MIT AND Apache-2.0 | 1 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| (MIT OR Apache-2.0) | 1 |
| (BSD-3-Clause OR GPL-2.0) | 1 |

Notable review items are `lightningcss@1.33.0` plus 11 platform packages (MPL-2.0), `@expo-google-fonts/material-symbols@0.4.48` (MIT AND Apache-2.0), `caniuse-lite@1.0.30001810` (CC-BY-4.0), `argparse@2.0.1` (Python-2.0), and `node-forge@1.4.0` (BSD-3-Clause OR GPL-2.0). Preserve compound expressions. An `OR` expression is a choice to document after reviewing the actual licenses; an `AND` expression must not be reduced to one side. These declarations alone do not establish incompatible licensing.

**Required inventory strategy before public release:**

1. Generate a deterministic inventory from the exact release lock, recording name/version, dependency path, dev/optional status, resolved source, integrity, license expression, repository and packaged license/notice files. Compare it with the installed tree after `npm ci`; fail the review on missing/unrecognized terms rather than silently labeling them MIT.
2. Inspect actual LICENSE/COPYING/NOTICE files, vendored subdirectories and fonts for the artifacts distributed. Preserve copyright and permission notices for included MIT code; review Apache notices and redistribution conditions from the actual license. The installed Expo and TypeScript license files were present, but exhaustive notice copying is not complete. [Expo MIT text](https://github.com/expo/expo/blob/main/LICENSE), [Apache 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
3. Inventory Android's resolved **release runtime** Gradle graph separately: Maven/AAR/JAR artifacts, React Native/Hermes/native libraries, transitive native code and bundled assets are not fully described by npm licenses. Record artifact coordinates, checksums, licenses and notices. Inspect the built standalone APK/AAB rather than treating `npm audit --omit=dev` as a shipping inventory.
4. Produce a machine-readable SBOM and human-readable notices file from the release inputs; include applicable notices in the app's open-source licenses screen/package. Keep developer-tool notices in repository/build-distribution records even when they are absent from the APK.
5. For MPL components or modifications and attribution-bearing data/fonts, evaluate the actual distributed files and applicable terms before finalizing notices/source availability. This document does not assert that all tooling is exempt or that all source files must be published.
6. Keep food dataset notices separate and linked to `FOOD_DATA_LICENSES.md`; an npm license inventory does not satisfy USDA/OFF attribution.

## Toolchain compatibility recommendations

### TypeScript

**Keep 6.0.3 for this SDK 57 scaffold.** The official SDK 57 template (`expo-template-default@57.0.26`) requests `~6.0.3`, and the installed `@typescript-eslint/parser`/plugin 8.70.1 allow `>=4.8.4 <6.1.0`. The parent task has already moved from 5.9.3 to 6.0.3. The registry currently reports TypeScript 7.0.2 as latest; it is outside that parser's declared range. “Latest” is not a compatible replacement here. [Official SDK 57 template](https://raw.githubusercontent.com/expo/expo/sdk-57/templates/expo-template-default/package.json), [typescript-eslint supported versions](https://typescript-eslint.io/users/dependency-versions/)

Expo's base config uses `module: preserve`, `moduleResolution: bundler`, `jsx: react-jsx` and `noEmit`; the project extends it. Verify normal type checking, typed routes, lint parsing and Metro bundling under 6.0.3. TypeScript 7 introduces a native compiler; Microsoft's guidance explains side-by-side migration, but adding two compilers is unnecessary for the first coherent APK. [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

### ESLint

**ESLint 9.39.5 is an explicitly tracked temporary compatibility pin, not a maintained long-term choice.** Official support status marks v9 EOL. The registry currently reports ESLint 10.11.0; installed Node 24.19.0 meets its engine range. The project already uses flat configuration, which avoids one major migration issue. [ESLint support status](https://eslint.org/version-support/), [v10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)

The installed and currently published dependency contracts are:

| Package | Installed/published version inspected | ESLint peer support | Consequence |
| --- | --- | --- | --- |
| eslint-config-expo | 57.0.2 | >=8.10 | Broad outer range does not override child plugin limits |
| @typescript-eslint/parser and eslint-plugin | 8.70.1 | ^8.57.0 OR ^9.0.0 OR ^10.0.0 | v10 is allowed |
| eslint-plugin-react-hooks | 7.1.1 | Includes ^10.0.0 | v10 is allowed |
| eslint-plugin-import | 2.32.0 | Through ^9, excludes 10 | Published peer contract blocks a supported drop-in v10 migration |
| eslint-plugin-react | 7.37.5 | Through ^9.7, excludes 10 | Same blocker |

Publisher `eslint-plugin-import` main-branch metadata already contains `^10`, but the published 2.32.0 registry metadata and installed package do not. Do not confuse an unreleased repository change with a compatible published release. [Import plugin source](https://raw.githubusercontent.com/import-js/eslint-plugin-import/main/package.json), [React plugin source](https://raw.githubusercontent.com/jsx-eslint/eslint-plugin-react/master/package.json)

Recommended path: retain the current working lint stack while building the internal APK; track EOL as development-tool maintenance debt. Move to ESLint 10 when Expo's configuration and the published plugin versions support it, then verify dependency resolution without `--force`/`--legacy-peer-deps`, the resolved flat config, representative TS/TSX linting and all existing lint checks. If upstream support remains delayed, evaluate a separately designed ESLint 10 configuration with compatible published plugins and explicit rule coverage; that is a migration task, not a one-package bump. No claim is made that EOL lint tooling is an Android runtime vulnerability.

## Supplied audit: claim-specific static triage

Input: `.work-audit.json`, npm audit report version 2, **13 moderate entries**, no high/critical entries, with two underlying advisory objects. This report is retained as supplied; the following inventory preserves every package entry rather than discarding propagated results. Severity remains the scanner's severity, not a new Nerd Fit score. No applicable `SECURITY.md` was found by the resolver for the affected decoder or Xcode paths; product scope is anchored in the Android/local-build specification. No exploit payloads were run.

### Decoder chain: review queue

Claim: malformed percent-encoded input reaching `decode-uri-component` can cause excessive CPU consumption. Installed path: `expo-router@57.0.22 → query-string@7.1.3 → decode-uri-component@0.2.2`. The advisory affects versions through 0.4.2 and identifies 0.5.0 as patched. [GHSA-vcc3-ghjq-m6fr / CVE-2026-45822](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)

Evidence: `query-string/index.js:3,231–233,328–329` imports and calls the decoder; installed decoder fallback recursively splits failing input (`decode-uri-component/index.js`). Vendored React Navigation's `core/getStateFromPath.js:499` calls `queryString.parse`. However, Expo's configured incoming-link route (`getLinkingConfig.js:90–91`, `link/linking.js:45–46`) uses its **fork**, whose query parser (`fork/getStateFromPath-forks.js:370–391`) uses URL search parameters. Its outgoing-path helpers call `queryString.stringify`, not the vulnerable decode operation. No direct app/source imports of these three packages were found in the scoped search.

Verdict: **needs_review**, medium confidence. The vulnerable package and a parser caller exist, but a supported attacker-controlled path to that caller in the standalone Android artifact has not been established. The `nerdfit` scheme makes link input relevant; do not call this a confirmed exploitable deep-link DoS based on package presence alone. Next: trace the built navigation graph/default helpers and exercise bounded malformed-link regression cases in a controlled test build. Do not dismiss the advisory until all shipped paths are assessed.

**2026-09-27 offline source follow-up:** `global-state/useStore.js:47` constructs the explicit Expo linking configuration; `ExpoRoot.js:135` passes it into `fork/NavigationContainer.js`, which passes it into the native listener and LinkingContext. `fork/useLinking.native.js:115` calls that configured parser. `react-navigation/native/useLinkBuilder.js` also prefers `options.getStateFromPath` over the upstream fallback. Together these establish counterevidence for both normal native intent processing and context-based navigation: the reviewed configuration selects the URLSearchParams fork, not the vulnerable upstream query decoder. App routes neither import the upstream helper nor override this configuration. The vulnerable fallback still exists in installed code, so artifact inclusion/alternate runtime paths and malformed-link tests remain open; this is not a remediation claim. The Xcode path still calls only `uuid.v4()` without a caller-supplied buffer.

**2026-09-28 patch follow-up:** Router 57.0.23 retains these same parser-selection anchors and the upstream `queryString.parse` fallback at line 499. The three Expo package patches do not establish remediation of the decoder advisory. The lockfile license-expression counts are unchanged.

### UUID/Xcode chain: counterevidence

Claim: `uuid` v3/v5/v6 **functions** permit partial writes when a caller provides an undersized output buffer or excessive offset. This refers to function variants, not package major versions. The installed npm tree shows `expo@57.0.24 → @expo/config-plugins@57.0.9 → xcode@3.0.1 → uuid@7.0.3`. Patched package versions include 11.1.1, 12.0.1 and 13.0.1. [GHSA-w5hq-g745-h8pq / CVE-2026-41907](https://github.com/advisories/GHSA-w5hq-g745-h8pq)

Evidence: `xcode/lib/pbxProject.js:22,89–95` imports UUID and generates identifiers using **`uuid.v4()` with no buffer**. The source search found no other UUID API caller in `xcode/lib`; `npm ls uuid --all` identified that installed dependency path. This is Expo/Xcode project-generation tooling, not an established APK runtime path. The exact advisory preconditions are absent from the inspected caller.

Verdict: **not_actionable for this supplied bounds-write claim on the current installed Xcode path**, high confidence. Retain the affected version in maintenance tracking; do not generalize this disposition to other UUID advisories, new consumers, different code paths or future versions. No untrusted buffer/offset reaches the affected API on the observed path.

### One result per supplied package entry

`D` means the decoder evidence/proof gaps above; `U` means the verified Xcode v4 counterevidence above. Review ranks are unique within the needs-review queue; not-actionable entries have no exploitability rank. Ancestor warnings are propagation, not additional independently demonstrated flaws.

| Triage ID | Supplied package entry | Evidence | Verdict | Review rank |
| --- | --- | --- | --- | ---: |
| triage-001 | decode-uri-component | D: advisory-bearing package | needs_review | 1 |
| triage-002 | query-string | D: decoder caller | needs_review | 2 |
| triage-003 | expo-router | D: importer; fork counterevidence | needs_review | 3 |
| triage-004 | uuid | U: advisory-bearing package | not_actionable on inspected claim/path | — |
| triage-005 | xcode | U: sole installed parent; v4 caller | not_actionable on inspected claim/path | — |
| triage-006 | @expo/config-plugins | U: depends on xcode | not_actionable on propagated claim/path | — |
| triage-007 | @expo/config | U: config-plugins propagation | not_actionable on propagated claim/path | — |
| triage-008 | @expo/cli | U: config/plugin propagation | not_actionable on propagated claim/path | — |
| triage-009 | @expo/inline-modules | U: config-plugins propagation | not_actionable on propagated claim/path | — |
| triage-010 | @expo/local-build-cache-provider | U: config propagation | not_actionable on propagated claim/path | — |
| triage-011 | @expo/metro-config | U: config propagation | not_actionable on propagated claim/path | — |
| triage-012 | @expo/prebuild-config | U: config/plugin propagation | not_actionable on propagated claim/path | — |
| triage-013 | expo | U: aggregated tooling propagation | not_actionable on propagated claim/path | — |

## Remediation candidates and compatibility gates

- **Do not run `npm audit fix --force` for this report.** Its advertised fixes include Expo 46.0.21 and Router 5.1.11, incompatible downgrades from the selected SDK 57 architecture. An audit's dependency solver suggestion is not an Expo compatibility recommendation.
- **Decoder:** prefer an SDK-57-compatible Router release that consumes the upstream fix or a reviewed backport. Published `decode-uri-component@0.5.0` and `query-string@9.5.1` use ESM-only exports; current query-string 7.1.3 uses CommonJS `require`. A forced decoder override is not a safe patch-only update and can produce a module-namespace/default-export mismatch. Updating query-string across two major versions also requires Metro, router serialization and native linking tests. No supported drop-in patch was verified in this research. The advisory's input-length workaround can be considered only after locating the actual entrypoints; a partial guard is not a complete fix.
- **UUID:** latest Xcode package remains 3.0.1 with `uuid: ^7.0.3`. A scoped override to **11.1.1** is technically testable because that UUID release still exports a CommonJS `require` entry, but it is outside Xcode's declared range and has not been approved or tested here. Prefer an upstream-supported Xcode/Expo update; a temporary override needs clean prebuild/project-generation tests and a lockfile review. There is no demonstrated need to destabilize the Android build to fix the non-reached v3/v5/v6 buffer path.
- **ESLint:** migrate the whole supported config/plugin set, not just ESLint's major version. Avoid unpublished branch dependencies and peer-dependency bypasses.
- **TypeScript:** keep the already-selected 6.0.3; run the normal checks after any later change. Do not add TypeScript 7 solely to match the registry's latest tag.

Official npm metadata was read on the research date for the exact patch entry points and current tags: [ESLint](https://registry.npmjs.org/eslint/latest), [TypeScript](https://registry.npmjs.org/typescript/latest), [Expo template SDK 57](https://registry.npmjs.org/expo-template-default/sdk-57), [Import plugin](https://registry.npmjs.org/eslint-plugin-import/latest), [React plugin](https://registry.npmjs.org/eslint-plugin-react/latest), [decoder 0.5.0](https://registry.npmjs.org/decode-uri-component/0.5.0), [query-string 9.5.1](https://registry.npmjs.org/query-string/9.5.1), [UUID 11.1.1](https://registry.npmjs.org/uuid/11.1.1), [Xcode](https://registry.npmjs.org/xcode/latest). Registry tags change; recheck them when implementing a migration.

For the first signed standalone APK: preserve the coherent SDK set, refresh audit/notice evidence against its final lock and resolved native graph, and verify that development-client tooling is not required for launch. Actual signing, release-bundle inspection, runtime link tests, notice packaging and the release security scan are separate outstanding work; this document does not certify any of them.
