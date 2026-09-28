NERD FIT: AUTONOMOUS COMPLETION + APK DELIVERY DIRECTIVE

Read this carefully before doing anything.

From this point onward, I do NOT want to perform development work myself.

I will NOT:
- run PowerShell commands
- run npm commands
- run Gradle commands
- troubleshoot Android SDK
- troubleshoot Java
- edit code
- edit configuration files
- operate Metro
- use Expo Go
- use an Android emulator
- manually build the application

You are responsible for the complete engineering workflow.

My role is only:

1. receive an installable Nerd Fit APK
2. install it on my Android phone
3. test the actual app
4. tell you what I want changed
5. receive another APK

That is the permanent development workflow for this project.

==================================================
A. CONTINUE THE EXISTING NERD FIT BUILD
==================================================

Continue from the current state of this repository and from the complete Nerd Fit requirements already established in this conversation.

Do NOT restart the project merely because of this instruction.

Do NOT discard correct work already completed.

Before continuing:

1. inspect the current repository
2. inspect git status
3. inspect existing documentation
4. inspect BUILD_STATE / traceability documentation if present
5. determine the exact current milestone
6. continue from there

The application is a greenfield Nerd Fit implementation.

Do not use or request the previous Google AI Studio Nerd Fit codebase.

==================================================
B. YOU OWN THE ENTIRE TECHNICAL ENVIRONMENT
==================================================

From now on, solve technical setup problems yourself.

You may use:

- the local terminal
- Android SDK
- JDK
- Node/npm
- Gradle
- Git
- GitHub
- connected plugins
- browser/research tools
- computer use
- Figma
- Superpowers
- Codex Security where useful

Do not ask me to run commands that you can run yourself.

If:

- PATH is wrong
- an Android tool is not visible
- Expo configuration is malformed
- a dependency conflicts
- Gradle fails
- native Android generation fails
- Java configuration is wrong
- signing fails
- package configuration is wrong

investigate and repair it yourself.

Request an approval only when the Codex security sandbox actually requires my authorization.

Do not ask me to copy commands into PowerShell.

==================================================
C. BUILD STRATEGY: WINDOWS
==================================================

This project is being built on Windows.

Do NOT depend on:

eas build --local

for the local Windows build pipeline.

Use the supported native Android workflow instead.

For an Expo/React Native project, use the appropriate current workflow such as:

Expo prebuild / native generation
→ Android native project
→ Gradle
→ standalone Android APK

Research the currently installed/project-specific versions before selecting commands.

Do not blindly use obsolete Expo commands.

==================================================
D. APK REQUIREMENT
==================================================

The APK you give me must be a REAL STANDALONE APK.

It must:

- install directly on a physical Android phone
- launch from the Android app launcher
- contain its JavaScript/application bundle
- work without Metro
- work without Expo Go
- work without a connected PC
- work without a development server
- work after the computer is turned off
- preserve Nerd Fit local SQLite data when I install a newer compatible test APK over the previous one

Do NOT present a development-client APK as the final testing artifact if it requires Metro.

Do NOT tell me an APK is standalone unless you have verified its build configuration.

==================================================
E. TEST APK SIGNING
==================================================

Create and use a STABLE INTERNAL TEST SIGNING KEY for Nerd Fit test APKs.

Requirements:

- use the same internal signing certificate for successive test APKs
- keep the private key OUTSIDE Git
- never commit passwords or keystores
- never expose the secret in chat
- preserve the key locally so future APKs can update previous APKs
- document where the credential is stored without printing passwords

This internal testing certificate is NOT automatically the final Google Play upload credential.

Before the first actual Play Store submission, create or configure the production upload-key strategy separately.

Do not accidentally lose or regenerate the internal key between builds.

==================================================
F. APPLICATION ID
==================================================

Keep the Android application ID stable across test APK revisions.

Do not casually change it after APK testing begins.

If no application ID has yet been permanently selected, use a sensible unique development identity derived from this project/account and document it.

Before the first Google Play submission, explicitly verify that the final production application ID is intentional because it cannot casually be changed after publication.

Do not block current APK testing merely for this future Play decision.

==================================================
G. VERSIONING
==================================================

Every APK delivered to me must include:

human-readable version
+
incrementing Android versionCode/build number.

Example concept:

Nerd Fit 0.1.0
build 1

Nerd Fit 0.1.1
build 2

etc.

Do not reuse an older versionCode for a newer APK.

Display the version/build somewhere appropriate in Settings/About.

==================================================
H. BUILD ARTIFACT DELIVERY
==================================================

Create this directory inside the repository:

deliverables/

After every completed test release, place the final APK there.

Use clear names such as:

NerdFit-0.1.0-build1.apk
NerdFit-0.1.1-build2.apk

Also maintain:

deliverables/LATEST_BUILD.md

containing:

- version
- versionCode
- commit SHA
- build date/time
- APK filename
- APK SHA-256
- major changes
- known issues
- test status

Also maintain:

deliverables/CHANGELOG.md

Do not commit private signing material into deliverables.

==================================================
I. MAKE DELIVERY EASY FOR ME
==================================================

When the final APK has been produced:

1. verify that the file actually exists
2. calculate its SHA-256
3. copy it to deliverables/
4. give me the exact Windows file path
5. use Computer Use to open Windows File Explorer directly to the deliverables folder if available
6. select/highlight the newest APK if possible

I should be able to:

double-click/open folder
→ move APK to phone / send to phone
→ tap APK
→ install Nerd Fit

without using a terminal.

If your current GitHub integration allows a safe private/prerelease artifact or release upload, also upload the APK there and give me the resulting link.

Do NOT make GitHub delivery a blocker.

The local deliverables APK is mandatory.

==================================================
J. NO FAKE APK CLAIMS
==================================================

Never say:

"APK ready"

unless an actual .apk file exists on disk.

Never substitute:

- source code
- Expo project
- AAB
- Gradle directory
- development server
- QR code

for the APK I requested.

A successful TypeScript compilation does not mean the APK exists.

A successful Expo prebuild does not mean the APK exists.

A successful Gradle configuration does not mean the APK exists.

Verify the final artifact.

==================================================
K. APK VALIDATION
==================================================

Before giving me an APK, validate as much as the environment allows.

At minimum verify:

1. project typecheck
2. lint
3. automated tests
4. Expo configuration validation
5. Android native generation
6. Gradle release-style APK compilation
7. APK exists and has non-zero size
8. APK signing is valid
9. package/application ID is correct
10. versionCode is correct
11. JavaScript/assets are bundled for standalone operation
12. no Metro dependency
13. no obvious debug/dev menu dependency
14. no development-only server URL required
15. no API secrets bundled into the APK

Use Android build tools such as appropriate APK inspection/signature verification utilities where available.

If a physical Android device is connected and permission allows it, you may additionally install and smoke-test the APK yourself.

A physical phone connection must NOT be required for producing the APK.

==================================================
L. FIRST APK DOES NOT NEED EVERY FUTURE FEATURE
==================================================

Do NOT wait months before producing the first installable build.

As soon as the core product is coherent enough for real-device evaluation, create an APK.

However, do not give me a meaningless shell with fake controls.

The first APK should at minimum provide a coherent vertical slice:

- application shell
- Nerd Glass visual system
- responsive layout
- onboarding
- Cut / Maintain / Bulk selection
- profile/body details
- goal rate
- calorie/macronutrient plan
- weekly calorie distribution
- plan summary
- working Home screen
- basic food logging
- basic weight logging
- persistent local SQLite storage
- functional navigation
- real settings/about version display

If core metabolic systems are already further developed, include them.

Then subsequent APKs progressively add/repair the rest.

==================================================
M. COMPLETE PRODUCT REQUIREMENTS STILL APPLY
==================================================

All previously specified Nerd Fit requirements remain active, including:

- independent deterministic metabolic engine
- trend weight
- expenditure estimation
- incomplete-day handling
- partial-day handling
- confidence/readiness
- weekly reviews
- Cut / Maintain / Bulk
- bodyweight-percentage goal rate
- dynamic maintenance
- weekly calorie distribution
- phase planning
- natural-language food logging
- exact date/time parsing
- food search
- free/licensing-safe food databases
- USDA usage
- Open Food Facts handling
- barcode scanning
- nutrition-label scanning
- recipes
- favorites
- meal history
- time-aware suggestions
- AI Wizard
- optional Nerd AI
- BYOK/free-tier-compatible AI strategy
- Health Connect
- backup/restore
- accessible responsive UI
- foldable/tablet support
- Nerd Glass
- floating UI
- frosted glass
- Android-first ergonomics
- smooth native-friendly animations
- no dead controls
- no fake AI
- no fabricated scientific metrics

Do not sacrifice backend/calculation quality merely to finish the UI.

Do not sacrifice UI/UX merely to finish backend work.

Both are first-class product requirements.

==================================================
N. RESEARCH AND COMPETITOR RULE
==================================================

Continue using:

MacroFactor official documentation
MacroPhase official public repositories/documentation
peer-reviewed evidence
official platform documentation

as research inputs.

Do not invent proprietary MacroFactor formulas.

Do not claim access to MacroPhase source that is not publicly available.

Do not copy competitor branding/assets/layouts.

Implement Nerd Fit independently.

==================================================
O. FREE / LOW-COST REQUIREMENT
==================================================

Core Nerd Fit must not require a recurring paid infrastructure subscription.

Prefer:

- local SQLite
- local computation
- public-domain/open-data sources
- free Android APIs
- free/open-source libraries
- on-device OCR/barcode tooling
- optional BYOK AI

Do not introduce a paid SaaS dependency merely because it makes implementation easier.

If some optional future service would cost money:

keep core Nerd Fit independent from it.

==================================================
P. USER INTERVENTION POLICY
==================================================

Do not stop to ask me about routine engineering choices.

Do not ask:

"Should I run the build?"

Run it.

Do not ask:

"Should I fix this dependency?"

Fix it.

Do not ask:

"Should I generate Android native files?"

Do what is technically appropriate.

Ask me only if one of these occurs:

1. a security approval requires my click
2. an external account login requires me personally
3. a paid purchase is unavoidable
4. Google Play credentials are required
5. a permanent product/branding choice genuinely cannot be inferred
6. a destructive irreversible action affects my data or repository

Otherwise proceed autonomously.

==================================================
Q. USAGE LIMIT / INTERRUPTED SESSION RECOVERY
==================================================

The Astra usage limit may interrupt work.

Design the project so interruption is harmless.

Maintain:

docs/BUILD_STATE.md
docs/TRACEABILITY_MATRIX.md
docs/DECISIONS.md

Before or after every major milestone update BUILD_STATE with:

- current milestone
- completed work
- tests passed
- failures
- exact next action
- pending build status

Commit coherent work frequently.

If the model limit interrupts you, I may simply send:

continue

When I do:

1. inspect git status
2. read BUILD_STATE.md
3. inspect recent commits
4. continue from the exact stopping point

Do not restart architecture.
Do not repeat completed work.
Do not ask me to summarize what happened.

==================================================
R. ITERATION AFTER I TEST THE APK
==================================================

When I later report:

- a visual problem
- crash
- wrong number
- awkward flow
- animation issue
- feature request
- layout issue
- calculation issue

you will:

1. reproduce/investigate
2. determine root cause
3. implement fix
4. add regression test where appropriate
5. increment build/version
6. build another standalone APK
7. validate it
8. place it in deliverables/
9. open the folder for me
10. report the new APK

This is the permanent feedback loop.

==================================================
S. PLAY STORE READINESS
==================================================

The app architecture must remain suitable for later Google Play publication.

For Play release later:

- produce AAB
- configure production signing
- validate target SDK requirements
- validate permissions
- privacy policy
- Data Safety disclosures
- Health Connect declarations where applicable
- AI/data disclosure
- app icons
- adaptive icon
- screenshots
- store metadata
- release notes

Do NOT upload or publish anything to Google Play without explicit approval.

The development APK is NOT the Play Store artifact.

==================================================
T. SECURITY
==================================================

Before every significant release candidate:

- inspect dependencies
- scan for committed credentials
- check APK for embedded secrets
- validate external API handling
- run Codex Security if available
- validate imported external data
- ensure AI provider keys are not shipped as developer-owned secrets

User BYOK secrets must use secure local storage.

==================================================
U. CURRENT ACTION
==================================================

Continue building Nerd Fit now.

Do not stop at planning documentation.

Proceed through implementation, testing and Android packaging.

Your immediate objective is:

BUILD A COHERENT FIRST REAL NERD FIT TEST RELEASE
→ CREATE A STANDALONE SIGNED APK
→ VALIDATE IT
→ PUT IT IN deliverables/
→ OPEN THE deliverables FOLDER FOR ME
→ REPORT THE APK VERSION AND EXACT FILE PATH

After delivering that APK, wait for my real-device feedback before making major subjective visual changes.

Do not ask me to run PowerShell or write code.

Begin.