# NERD FIT: COMPLETE GREENFIELD PRODUCT, RESEARCH, ENGINEERING AND RELEASE DIRECTIVE

You are the principal engineer, product architect, nutrition-algorithm researcher, mobile UX designer, QA engineer and release engineer for a completely new application named **Nerd Fit**.

This is a GREENFIELD BUILD.

There is no legacy Nerd Fit codebase.

DO NOT:

* request old Nerd Fit code
* recover old Nerd Fit code
* migrate old Nerd Fit code
* reuse old Nerd Fit components
* assume any old implementation is correct

Start from the current repository and build Nerd Fit properly from first principles.

The final product must be a real Android application that can produce:

* an installable APK for real-device testing
* a signed-ready Android App Bundle for Google Play
* a maintainable source repository
* automated tests
* documented algorithms
* documented data provenance
* documented release process

Nerd Fit should compete in the same broad product category as MacroFactor and MacroPhase, but it must remain an original product with an original implementation and original visual identity.

==================================================

1. PRIMARY PRODUCT POSITIONING
   ==================================================

Nerd Fit should be positioned as:

"A fast, intelligent, adaptive nutrition coach that learns from what you actually eat and how your body actually responds."

The differentiators should be:

* easier than traditional advanced macro trackers
* faster food logging
* sophisticated adaptive calorie coaching
* local-first privacy
* extremely polished Android UX
* excellent Indian/international usability
* AI assistance without making the core app dependent on AI
* transparent calculations
* powerful features hidden behind simple workflows
* no mandatory subscription or paid backend dependency for normal use

The product should feel simple to a beginner while retaining deep controls for advanced users.

Nerd Fit should NOT feel like:

* a spreadsheet
* a generic calorie counter
* a medical dashboard
* a gaming HUD
* a cyberpunk interface
* an AI-generated prototype
* a clone of MacroFactor
* a clone of MacroPhase
* disconnected feature cards
* an app filled with fake AI buttons

==================================================
2. RESEARCH BEFORE IMPLEMENTATION
=================================

Before implementing the product, perform a comprehensive research pass.

Study current official/public information for:

MACROFACTOR:

* weight trend behavior
* expenditure estimation
* Expenditure V3 documented behavior
* missing-data behavior
* partial logging behavior
* adherence-neutral coaching
* weekly check-ins
* dynamic maintenance
* goal rate selection
* weekly calorie budgets
* calorie shifting
* coached/collaborative/manual programs
* protein and macro generation
* calorie safeguards
* food timeline
* date/time food logging
* search
* favorites
* recipes
* barcode scanning
* label scanning
* AI Describe
* AI photo food logging
* Health Connect
* export
* data-source priority
* dashboard information hierarchy

Use MacroFactor's OFFICIAL documentation as the authority for MacroFactor claims.

Do not infer proprietary formulas that MacroFactor does not publish.

Do not claim to know MacroFactor's server/database architecture unless MacroFactor itself publicly documents it.

MACROPHASE:

Inspect:

* MacroPhase/App
* MacroPhase/Docs
* MacroPhase/macrophase.github.io
* any other official public MacroPhase repositories that are relevant

Important:

Verify repository contents yourself.

The public App repository may not expose the actual application source.

Treat documentation describing implementation as MacroPhase's documented implementation claims unless source code independently confirms it.

Inspect licensing before using anything.

Do not copy:

* code
* strings
* branding
* artwork
* icons
* layouts
* proprietary material

Create a clean-room Nerd Fit implementation.

SCIENTIFIC RESEARCH:

Research primary literature and authoritative nutrition references for:

* resting energy expenditure estimation
* dynamic energy balance
* weight-loss rate recommendations
* muscle-gain rate recommendations
* protein requirements
* dietary fat minimums
* energy availability
* weight-noise modeling
* water/glycogen fluctuations
* expenditure estimation from intake and bodyweight change
* missing-data handling
* uncertainty estimation

Distinguish in documentation:

[OFFICIAL MACROFACTOR]
[MACROPHASE DOCUMENTATION]
[PEER-REVIEWED EVIDENCE]
[NERD FIT DESIGN DECISION]
[UNVERIFIED / PROPRIETARY]

Never turn an inference into a factual claim.

Create:

docs/RESEARCH_BENCHMARK.md
docs/ALGORITHM_EVIDENCE.md

before finalizing the algorithms.

==================================================
3. COST CONSTRAINT
==================

Nerd Fit must have no mandatory paid infrastructure for normal core use.

Prefer:

* open-source libraries
* free Android APIs
* local computation
* local SQLite
* free/open food datasets
* on-device barcode/OCR
* local Android builds

Do not require:

* Supabase paid services
* Firebase paid services
* paid EAS builds
* paid nutrition APIs
* paid vector databases
* paid search APIs
* paid analytics
* paid authentication providers

Cloud build services may be OPTIONAL but not required.

The project must be able to build locally using:

Android Studio
+
Gradle
+
the Android SDK

No mandatory cloud build service.

==================================================
4. MOBILE TECHNOLOGY
====================

Research the current stable mutually-compatible releases before initializing dependencies.

Preferred architecture:

React Native
Expo
TypeScript
Expo Router

Use Expo Prebuild / development builds rather than restricting the project to Expo Go.

Native capabilities will be required.

Use appropriate current maintained libraries for:

* React Native Reanimated
* React Native Gesture Handler
* Expo Blur
* React Native Skia where justified
* Expo SQLite
* Expo SecureStore
* Camera
* Haptics
* file sharing/export
* notifications
* safe areas
* responsive layouts

Do not blindly install libraries because they are popular.

Check:

* maintenance status
* latest release
* new-architecture compatibility
* Android compatibility
* Expo compatibility
* licensing

Document third-party licenses.

==================================================
5. REPOSITORY ARCHITECTURE
==========================

Use clean domain separation.

The repository should approximately separate:

app/
navigation and routes

src/components/
reusable UI

src/design/
design tokens
glass material
motion
responsive helpers

src/features/
onboarding
dashboard
food
weight
goals
strategy
checkins
ai
settings
healthConnect
backup

src/domain/
metabolism
trendWeight
expenditure
goals
nutrition
confidence
calorieDistribution
weeklyReview

src/data/
sqlite
schema
migrations
repositories
foodSources

src/services/
ai
openFoodFacts
barcode
labelOcr
healthConnect
export

src/tests/
domain
integration
simulation
fixtures

Do not place metabolic equations inside React components.

Do not create giant god-components.

==================================================
6. DATABASE ARCHITECTURE
========================

Use SQLite as the primary source of truth from day one.

Design versioned migrations.

At minimum model:

profiles
preferences

goals
goal_phases
goal_history

daily_targets

weight_entries
weight_entry_overrides
trend_weight_points

food_entries
food_entry_items
food_sources
foods
food_servings
custom_foods

recipes
recipe_items

favorites
recent_foods
food_usage_stats

nutrition_day_status

expenditure_estimates

weekly_reviews
weekly_review_actions

body_metrics

health_connect_imports

ai_action_history
ai_memory

settings

audit_events

The final schema may differ if there is a strong architectural reason.

Use:

foreign keys
transactions
indexes
unique constraints
migration tests

Do not persist derived data redundantly unless caching is intentional and invalidation is defined.

==================================================
7. LOCAL-FIRST PHILOSOPHY
=========================

Core functionality must work without an account.

Core functionality must work offline once required food data exists locally.

Store:

* profile
* weight
* foods
* recipes
* goals
* reviews
* preferences
* AI memories

locally.

Provide:

* versioned backup
* restore
* CSV export
* structured JSON backup

Imports must validate before commit.

Failed imports must not destroy the current database.

Destructive resets require explicit confirmation.

Secrets must use appropriate secure storage.

==================================================
8. FOOD DATA ARCHITECTURE
=========================

This is a HIGH-PRIORITY PRODUCT SYSTEM.

Nerd Fit must not depend on a paid food database.

Research and implement a licensing-safe strategy.

PRIMARY GENERIC NUTRITION DATA:

Use USDA FoodData Central data where appropriate.

Its data is CC0/public-domain.

Prefer build-time/offline data packages rather than embedding a shared developer API key in the application.

Investigate a compact, practical offline set derived from:

* Foundation Foods
* FNDDS
* other appropriate USDA datasets

Preserve:

* source identifier
* source name
* nutrient provenance
* serving metadata

BRANDED PRODUCTS:

Use Open Food Facts where appropriate.

Important:

Open Food Facts is ODbL/share-alike.

Do not blindly merge its database into a proprietary Nerd Fit food database.

Architect source separation and provenance correctly.

Comply with:

* attribution
* ODbL
* API User-Agent requirements
* current rate limits

Do NOT use Open Food Facts remote search-as-you-type in a way that violates search rate limits.

Preferred behavior:

Local search:
instant.

Online packaged-product search:
explicit action / delayed fallback.

Barcode:
direct lookup with caching.

CACHE:

Cache successfully fetched products locally.

Store:

* source
* source ID
* fetched date
* barcode
* normalized nutrients
* original source metadata

INDIAN FOOD DATA:

Nerd Fit should be particularly usable in India.

However:

DO NOT bundle IFCT 2017 or another copyrighted Indian composition database unless its current license explicitly allows product redistribution or written permission is obtained.

Document this as a licensing constraint.

For India v1 use:

* appropriate public-domain generic ingredients
* Open Food Facts Indian packaged foods
* custom foods
* label scanning
* user recipes
* ingredient-based recipe estimation

Design Nerd Fit so an authorized Indian food composition pack can be added later.

==================================================
9. FOOD SEARCH ENGINE
=====================

Search must feel instantaneous.

Investigate SQLite FTS5 availability in the chosen stack.

If supported reliably, implement local full-text indexing.

Search relevance should consider:

* lexical relevance
* exact-name match
* brand match
* favorites
* recent usage
* lifetime logging frequency
* time-of-day relevance
* user's normal serving
* source quality

Do not hardcode giant arbitrary ranking bonuses without testing.

Create ranking tests.

Measure search latency.

Target near-instant perceived local search.

==================================================
10. UNIVERSAL FOOD CAPTURE
==========================

This is a major Nerd Fit differentiator.

Create ONE coherent capture system accessible from a floating central action.

The user should be able to log through:

TEXT
VOICE
SEARCH
BARCODE
NUTRITION LABEL
PHOTO
RECENT
FAVORITES
RECIPE
QUICK ADD

Do not scatter these across unrelated interfaces.

The main capture composer should support prompts such as:

"2 eggs and 4 rotis today at 8:15 am"

"300g chicken biryani yesterday around 9pm"

"200g chicken breast, 250g cooked rice and 100g curd for lunch"

"Log the same breakfast I had Monday at 8am"

"I had one scoop whey and 300ml milk at 11:30 last night"

The parser must understand:

* quantity
* serving unit
* food names
* multiple foods
* meal context
* explicit date
* relative date
* exact time
* approximate time
* local timezone

DATE/TIME IS FIRST-CLASS DATA.

Never silently throw away the time component.

Show the resolved date/time before final commit when ambiguity exists.

==================================================
11. HYBRID TEXT PARSER
======================

Do not make simple natural-language logging dependent on an LLM.

Implement a HYBRID PIPELINE.

Stage 1:
deterministic parsing for:

* dates
* relative dates
* times
* quantities
* common units
* obvious multi-item separators

Stage 2:
local food search.

Stage 3:
confidence scoring / candidate matching.

Stage 4:
optional AI resolution for ambiguous language.

Example:

"2 eggs and 2 toast yesterday 9pm"

should normally work without an external AI call.

AI is reserved for:

* ambiguous foods
* restaurant estimates
* complex mixed meals
* vague descriptions
* images

==================================================
12. FOOD LOG REVIEW
===================

Never let AI silently write uncertain nutrition data.

AI/natural-language result:

INPUT
→ parsed candidate foods
→ editable review sheet
→ user confirms
→ transaction commits

Display:

* food
* amount
* serving
* calories
* protein
* carbs
* fat
* date
* time
* source
* estimate indicator if relevant

Provide:

UNDO

after logging.

Protect against rapid duplicate submission.

==================================================
13. BARCODE
===========

Barcode scanning must be real.

No fake camera.

Prefer maintained free/on-device Android capability.

Investigate:

* Expo Camera barcode APIs
* Google ML Kit barcode scanning
* Google Code Scanner

Choose based on UX and Expo-native compatibility.

Workflow:

scan
→ local cache
→ Open Food Facts lookup if needed
→ result
→ serving
→ log

Unknown barcode:

scan nutrition label
or
create custom food.

==================================================
14. NUTRITION LABEL SCANNER
===========================

Support photographed nutrition labels.

Prioritize free on-device OCR where practical.

Investigate Google ML Kit Text Recognition or another maintained free on-device option.

Pipeline:

image
→ OCR
→ structured parser
→ nutrition sanity validation
→ editable form
→ custom food

AI vision may optionally help, but OCR/manual functionality must not depend on paid AI.

Check macro math.

Example:

protein*4 + carbohydrate*4 + fat*9

should approximately agree with label calories while allowing for:

* fiber
* alcohol
* rounding
* sugar alcohols
* regional label differences

Flag impossible records instead of silently accepting them.

==================================================
15. RECIPES
===========

Recipes must support:

* ingredient search
* arbitrary quantities
* raw ingredients
* cooked yield weight
* servings
* grams of finished recipe
* fractional servings
* duplicate recipe
* edit recipe
* log recipe
* save meal as recipe

Historical logged nutrition must not change when the recipe is edited later.

Store snapshot nutrition on log commit where needed.

==================================================
16. FOOD LOG TIMELINE
=====================

Build an extremely fast chronological food timeline.

Support:

* exact times
* day switching
* calendar
* backfill
* future meal planning
* move entries
* duplicate
* copy to today
* copy to tomorrow
* multi-select
* copy full meal
* copy full day

Make it easier than navigating multiple modal stacks.

==================================================
17. CUT / MAINTAIN / BULK
=========================

These are the three primary goal modes.

CUT

MAINTAIN

BULK

The selection must be visible, understandable and editable.

Support useful phase presets without turning them into separate metabolic algorithms:

CUT:

* conservative
* moderate
* aggressive
* mini-cut preset

BULK:

* lean
* moderate
* faster gain

MAINTAIN:

* maintain current trend weight
* optionally maintain another nearby target weight

A "diet break" should simply be a temporary maintenance phase.

Do not claim special metabolic effects that are not established.

==================================================
18. PHASE PLANNER
=================

A differentiating feature:

allow users to create a sequence such as:

CUT
→ MAINTENANCE
→ BULK

or:

MINI CUT
→ MAINTENANCE
→ LEAN BULK

Do not make phase planning mandatory.

Most users should simply pick one mode.

Advanced users can schedule future phases.

Never execute a major goal transition silently.

Ask for confirmation.

==================================================
19. GOAL RATE
=============

For Cut and Bulk, use a bodyweight-percentage rate model.

Do not freeze a kg/week value forever.

Store:

target % bodyweight/week

Then derive absolute change from current appropriate trend weight.

Research evidence-based recommended zones.

Display:

% bodyweight/week
estimated kg/week
estimated lb/week
approximate calorie implication
estimated target date

Use visual recommended bands.

Do not imply a specific rate is universally medically safe.

If the requested pace conflicts with guardrails, explain that the app cannot responsibly generate the requested target and show a slower alternative.

==================================================
20. INITIAL ENERGY EXPENDITURE
==============================

Initial TDEE is a PRIOR, not truth.

Research appropriate equations.

Because onboarding should not require body-fat percentage, consider Mifflin-St Jeor or another appropriate equation as the default resting-energy estimate.

If reliable lean body mass is available later, an appropriate lean-mass equation may be offered.

Initial estimate can incorporate:

* age
* sex where required by equation
* height
* weight
* general lifestyle activity
* training frequency

Do not keep activity multipliers dominant forever.

Once sufficient real intake/weight data exists:

EMPIRICAL DATA SHOULD DOMINATE.

Allow an advanced user to enter a known starting TDEE estimate.

==================================================
21. TREND WEIGHT
================

Build an original, scientifically defensible Nerd Fit trend-weight engine.

Do not cargo-cult complexity.

Research and test multiple approaches such as:

* EWMA
* robust EWMA
* local linear/Kalman state-space model
* robust state-space alternatives

Choose the default based on:

* resistance to single-day water spikes
* responsiveness to actual sustained change
* behavior with missing weigh-ins
* causal vs non-causal tradeoff
* computational stability
* interpretability

If using a non-causal smoother, clearly understand that historical trend points can change after new measurements.

Raw weight is permanent.

Trend is derived.

Never overwrite raw scale weight.

Missing raw-weight days may be interpolated internally where mathematically appropriate for smoothing.

Do not invent nutrition intake for missing food days.

==================================================
22. WEIGHT OUTLIERS
===================

Protect the model from:

* unit mistakes
* misplaced decimals
* scale malfunction
* improbable jumps

Use robust statistical methods.

Do not label an unusual reading "sodium" or "glycogen" unless you actually have evidence.

Prefer language like:

"Unusual scale reading"

Allow:

USE NORMALLY
REDUCE INFLUENCE
IGNORE FOR TREND

Preserve raw value.

==================================================
23. NERD EXPENDITURE ENGINE
===========================

Create an independent algorithm named:

Nerd Expenditure Engine v1

Core principle:

actual energy intake
+
meaningful trend-weight change
→ estimated expenditure

Do not attempt to reverse-engineer proprietary MacroFactor V3.

Research public dynamic energy-balance models.

The engine must address:

* tissue-energy assumptions
* difference between loss and gain
* transient water changes
* persistent diet-induced water shifts
* noisy weigh-ins
* missing nutrition
* missing weight
* partial logging
* long gaps
* sudden phase transitions
* extreme data
* uncertainty

Use enough history to avoid responding to daily noise while remaining responsive to sustained change.

Do not choose "14 days" or "21 days" simply because another app does.

Compare alternatives in simulation.

==================================================
24. NUTRITION DAY STATUS
========================

Every date should have a data-quality status.

Examples:

COMPLETE
ESTIMATED
PARTIAL
MISSING
FASTING

This is extremely important.

COMPLETE:
normal algorithm input.

ESTIMATED:
usable, but uncertainty may be higher.

PARTIAL:
exclude from expenditure estimation unless explicitly corrected.

MISSING:
do not treat as zero.

FASTING:
zero intake may legitimately be used when user confirms it was an intentional complete fast.

Create UI to fix suspicious days.

Example:

"Friday looks much lower than your normal intake. Was this complete?"

Buttons:

YES, COMPLETE
I MISSED SOME FOOD
ESTIMATE THIS DAY

This is a core reliability advantage.

==================================================
25. ADHERENCE-NEUTRAL DESIGN
============================

The model must learn from:

what the user actually ate

not:

what they were supposed to eat.

If target is 2200 kcal but actual intake is 2600:

the expenditure model uses the actual logged intake.

Do not punish users algorithmically for missing targets.

Avoid guilt-based UX.

==================================================
26. CALIBRATION / UNCERTAINTY
=============================

Represent model readiness honestly.

Useful states may include:

LEARNING
ACTIVE
HOLDING
RE-LEARNING

Base readiness on real data such as:

* complete nutrition-day coverage
* weight frequency
* history depth
* freshness
* model uncertainty
* outlier burden

Do not create an arbitrary confidence percentage simply because percentages look scientific.

If a numeric confidence score is used, formally define and test it.

Prefer simple consumer language such as:

Learning
Good data
Strong data
Holding

Detailed diagnostics can exist in advanced screens.

==================================================
27. LONG GAPS
=============

If tracking stops:

do not catastrophically reset the user's estimated expenditure.

Hold the last reliable estimate.

When the user returns:

* preserve historical data
* resume data collection
* reacquire confidence
* avoid massive immediate corrections
* smoothly re-enter active adaptation

==================================================
28. CALORIE TARGET ENGINE
=========================

The prescribed target must be based on:

current expenditure estimate
+
current goal
+
target % BW/week
+
safety guardrails

Avoid naive assumptions that every kg of scale change represents the same energy content.

Research appropriate dynamic energy-storage assumptions.

Document uncertainty.

Do not falsely promise an exact completion date.

Use ranges where appropriate.

==================================================
29. WEEKLY BUDGET
=================

Use a weekly calorie budget.

Support:

EVEN
WEEKEND HEAVY
WEEKDAY HEAVY
TRAINING-DAY BIAS
CUSTOM

The weekly budget must remain consistent.

Daily redistribution must not accidentally alter the intended weekly energy deficit/surplus.

Protein should generally stay relatively stable.

Fat must remain above the documented minimum.

Carbohydrates can absorb most discretionary calorie shifting.

Show a live seven-day preview.

==================================================
30. MACRO ENGINE
================

Protein:

Research evidence-based ranges appropriate to:

* sedentary users
* resistance training
* cutting
* maintaining
* bulking

Use reasonable default recommendations and allow preference adjustment.

Fat:

Use a defensible minimum.

Do not use an arbitrary percentage merely because another app does.

Carbohydrates:

Allocate remaining calories after protein and fat where appropriate.

Ensure:

protein kcal
+
fat kcal
+
carb kcal

matches calorie target within rounding tolerance.

Use:

protein = 4 kcal/g
carbohydrate = 4 kcal/g
fat = 9 kcal/g

Handle alcohol/fiber appropriately when nutrients are available.

==================================================
31. WEEKLY CHECK-IN
===================

Continuous expenditure estimation and prescribed target changes are separate concepts.

Expenditure may update continuously.

The user's prescribed plan should normally change during an explicit weekly review.

Review:

* trend-weight change
* target rate
* actual rate
* average energy intake
* expenditure estimate
* nutrition data quality
* weight data quality
* weekly target adherence
* remaining distance
* current phase

Recommendation examples:

KEEP
INCREASE CALORIES
DECREASE CALORIES
CONTINUE COLLECTING DATA
TRANSITION TO MAINTENANCE

The deterministic engine makes the decision.

AI may explain the decision.

AI may NEVER decide the calorie adjustment.

Show:

WHAT HAPPENED
WHY
RECOMMENDATION
EXPECTED EFFECT

User:

ACCEPTS
KEEPS CURRENT
REMIND LATER

Persist every review.

Never overwrite prior review history.

==================================================
32. DYNAMIC MAINTENANCE
=======================

Maintenance should not simply mean a frozen calorie number.

Research a sensible maintenance band around target trend weight.

Inside band:

target near estimated expenditure.

Outside band:

apply a small corrective energy bias toward target.

Make corrections gentle.

Do not force aggressive loss/gain in maintenance.

==================================================
33. TARGET CHANGES
==================

Changing:

* target weight
* rate
* phase
* distribution

must NOT delete:

* food history
* weight history
* expenditure history
* reviews

Goal configuration changes are forward-looking.

==================================================
34. NERD AI
===========

AI is an OPTIONAL assistant.

Nerd Fit must remain a complete tracker without it.

Build AI as a tool-using layer over deterministic app functions.

AI may:

* parse complex food descriptions
* analyze meal photos
* parse restaurant meals
* create draft custom foods
* create draft recipes
* explain TDEE changes
* explain trend weight
* summarize check-ins
* answer questions about user's own history
* suggest foods based on remaining macros
* create grocery suggestions
* help configure a goal
* schedule/log foods with explicit date/time

AI must NOT:

* own the metabolic algorithm
* generate hidden calorie targets
* fabricate food records
* commit uncertain logs silently
* diagnose medical conditions

==================================================
35. AI WIZARD
=============

Create an optional conversational Nerd Wizard.

Examples:

"Set me up for a 6 week mini cut."

"I want to bulk slowly without gaining too much fat."

"I want to maintain around 77 kg."

"I train five days a week and want more food on Saturday."

The Wizard converts conversation into STRUCTURED fields.

Then the deterministic plan engine calculates the result.

Always show a confirmation summary.

The AI does not invent formulas.

==================================================
36. FREE AI STRATEGY
====================

The app must not depend on developer-paid inference.

Implement optional BYOK support.

First supported provider:

Gemini Developer API

Research the current free-tier-compatible model at implementation time.

Do not hardcode obsolete model names.

Store user key securely.

Provide clear privacy disclosure before enabling AI.

Inform the user that provider terms/data policies apply.

Do not promise the Gemini free tier will remain unlimited or unchanged.

AI failures must never break the tracker.

Rate-limit gracefully.

Offline:

normal tracking continues.

==================================================
37. LOCAL AI MEMORY
===================

Store useful AI memory locally.

Possible categories:

PROFILE
FOOD PREFERENCES
FREQUENT FOODS
ALIASES
BEHAVIOR
TEMPORARY CONTEXT

Examples:

"when I say whey, I usually mean X product"

"I normally eat breakfast around 10"

"vegetarian"

"travelling until Sunday"

Give the user:

VIEW
EDIT
DELETE
CLEAR

Do not create hidden permanent memory.

==================================================
38. HEALTH CONNECT
==================

Implement Android Health Connect where useful.

Potential inputs:

* body weight
* steps
* sleep
* body composition

Potential outputs:

* nutrition
* body weight

Use explicit permissions.

Implement data-source priority.

For example:

manual Nerd Fit weight

>

Health Connect imported weight

Avoid duplicates.

IMPORTANT:

Do not automatically add wearable "active calories" directly onto the food target.

That can double-count energy expenditure.

Use activity data primarily as:

* context
* initial prior information
* explanatory analytics

The empirical intake/weight expenditure model remains primary.

==================================================
39. ADDITIONAL NERD FIT DIFFERENTIATORS
=======================================

Build high-value differentiation rather than feature-count bloat.

A. UNIVERSAL CAPTURE

One floating entry point for:

food
weight
AI
barcode
label
photo

B. TIME-AWARE LOGGER

Exact date/time is native to food logging.

C. MEAL MEMORY

Learn:

* foods at this hour
* usual serving
* common combinations

D. ONE-TAP REPEAT

Examples:

"Yesterday's breakfast"

"Usual whey shake"

"Monday lunch"

E. SMART INCOMPLETE-DAY RECOVERY

Help users repair missing/partial days before they pollute expenditure calculations.

F. EXPLAIN THIS NUMBER

Long-press or info action on important metrics:

TDEE
trend weight
target calories
goal date
weekly adjustment

Give simple deterministic explanations.

G. PHASE PLANNER

Cut → maintenance → bulk without losing history.

H. EVENT DAY

Allow a user to intentionally allocate extra calories to a date such as a dinner or weekend while keeping the planned weekly budget understandable.

Do not make overage compensation punitive or automatic.

I. HISTORY-SAFE EDITING

Changing foods/recipes/goals never rewrites unrelated history.

J. UNDO

Important actions should be reversible where practical.

==================================================
40. DASHBOARD
=============

Minimal, informative, highly polished.

At a glance show:

TODAY

calories eaten / remaining
protein
carbs
fat

TREND

trend weight
weekly change

COACHING

current phase
calibration state
next check-in

OPTIONAL

TDEE
goal progress

Do not show twenty metrics at once.

Use progressive disclosure.

==================================================
41. VISUAL DESIGN: NERD GLASS
=============================

Create a proprietary Nerd Fit visual language internally called:

NERD GLASS

Visual inspirations:

* modern Samsung One UI ergonomics
* iOS 27 Liquid Glass principles
* contemporary floating navigation
* premium modern fitness apps

DO NOT COPY:

* Apple component designs
* Samsung component designs
* MacroFactor layouts
* MacroPhase layouts

Borrow principles only.

Design character:

* dark-first
* elegant
* translucent
* tactile
* floating
* spacious
* information-dense only when necessary
* high contrast
* restrained color
* excellent typography

==================================================
42. GLASS MATERIAL
==================

Glass should be a FUNCTIONAL UI LAYER.

Use true blur primarily for:

* floating bottom navigation
* floating action composer
* context menus
* sheets
* modal controls
* compact toolbars
* important chips
* transient overlays

Do not blur every card.

Most content surfaces should use:

* subtle opacity
* tonal elevation
* border highlights
* restrained shadows

Research current Expo Blur behavior.

On supported Android:

use efficient native blur.

On older/poor-performing devices:

use a translucent non-blur fallback.

The app must remain smooth even when blur is unavailable.

==================================================
43. LIQUID / FLOATING BEHAVIOR
==============================

Create an original floating navigation system.

Navigation should:

* sit detached from the bottom edge
* respect gesture/navigation insets
* have strong touch targets
* shrink subtly when scrolling downward
* expand when required
* never obscure food entries

A central capture control may expand into:

Food
Weight
Scan
Nerd AI

Use morphing transitions only where they improve navigation.

Avoid excessive floating buttons.

==================================================
44. ONE UI ERGONOMICS
=====================

Use Android-first one-handed ergonomics.

Important actions should generally remain reachable.

Large screens should use:

* generous top-space where appropriate
* readable headers
* lower interaction zones
* adaptive multi-column layouts when width permits

Do not simply enlarge a phone screen on tablets.

==================================================
45. RESPONSIVE / RESIZABLE REQUIREMENT
======================================

This is mandatory.

No major UI may assume a fixed S25 Ultra resolution.

Support:

compact phone
large phone
foldable outer display
foldable inner display
tablet
split-screen
landscape where sensible

Use:

safe-area insets
window dimensions
responsive tokens
adaptive grid
max-content widths

Test:

font scaling
display scaling
keyboard
gesture navigation
three-button navigation
rotation
multi-window

==================================================
46. FROSTED GLASS SETTINGS
==========================

Consider a user preference:

Glass intensity:

CLEAR
BALANCED
TINTED

But preserve accessible contrast.

If automatic contrast testing fails, increase tint/opacity regardless of cosmetic preference.

==================================================
47. MOTION
==========

Animations must feel expensive, not busy.

Use Reanimated/native-friendly paths.

Animate:

navigation
sheet transitions
floating menu
number changes
goal slider
progress
logging confirmation
weekly review reveal
card expansion

Use:

spring motion where physicality helps
short easing where it does not

Avoid:

constant pulses
particle backgrounds
bouncing cards
neon glow spam
continuous decorative animation

Respect Reduce Motion.

Target smooth performance on modern 120 Hz Android displays, while treating stable 60 fps as the minimum acceptable interaction standard.

==================================================
48. HAPTICS
===========

Use subtle haptics for:

* successful log
* slider snapping
* goal confirmation
* check-in acceptance
* destructive confirmation

Do not vibrate on every tap.

==================================================
49. ACCESSIBILITY
=================

Mandatory:

* scalable text
* screen-reader labels
* correct semantic roles
* large touch targets
* high contrast
* reduced motion
* color-independent status indicators

Do not encode Cut/Maintain/Bulk status by color alone.

==================================================
50. ONBOARDING
==============

Onboarding must be short.

No Quick Setup alternative.

One coherent flow.

Collect only values that materially affect the app.

STEP 1

Basics:

* units
* age
* sex where required by chosen equation
* height
* current weight

Diet preference only:

* Veg
* Non Veg
* Eggetarian
* Vegan

STEP 2

Choose:

CUT
MAINTAIN
BULK

Select target weight where applicable.

STEP 3

Goal rate where applicable.

Use % bodyweight/week slider.

Ask:

* daily activity
* weekly training frequency

Only if they affect initial estimate or macro recommendation.

DO NOT ask:

* resting heart rate
* BPM
* "physical training focus"
* unnecessary body-fat slider

STEP 4

Weekly calorie distribution.

Then show PLAN SUMMARY / ROADMAP.

The Done button must actually:

* persist profile
* persist goal
* generate targets
* initialize review schedule
* close onboarding
* route Home
* show correct current-day target

End-to-end test this.

==================================================
51. ROADMAP
===========

Show:

current weight
target
phase
rate
estimated weekly change
calorie target
macros
weekly schedule
initial TDEE estimate
calibration state
next check-in
approximate goal window

Keep language simple.

==================================================
52. GOALS / STRATEGY
====================

Strategy is where deeper planning lives.

Include:

phase
goal target
rate
weekly schedule
expenditure
trend
calibration
next review
history

EDIT GOAL opens the same core goal flow with values prefilled.

Do not build a second half-functional editor.

==================================================
53. WEEKLY REVIEW UX
====================

The weekly review should feel like a short coaching conversation.

Not a spreadsheet.

Example structure:

1. This week
2. Your trend
3. Your data quality
4. Recommendation
5. Why
6. Accept / Keep

AI explanation may be available after deterministic calculations.

==================================================
54. PROGRESS
============

Charts:

trend weight
scale weight
expenditure
calorie intake
goal rate

Provide sensible time ranges.

Use high-performance rendering.

Do not expose developer diagnostics by default.

==================================================
55. BODY METRICS
================

Optional:

waist
body fat
chest
arms
other measurements
progress photos

None of these should be required for the core calorie algorithm.

Do not pretend consumer body-fat measurements are highly precise.

==================================================
56. NOTIFICATIONS
=================

Useful notifications only:

* weekly review ready
* weigh-in reminder
* optional food logging reminder
* phase transition reminder

User controls:

time
days
enable/disable

No fake notification settings.

==================================================
57. HOME SCREEN WIDGETS
=======================

Treat Android widgets as a post-core milestone.

Potential widgets:

calories/macros
quick log
trend weight

Do not delay the core app to build widgets.

==================================================
58. SHOPPING / RECEIPTS
=======================

This is a secondary differentiator after the core app is stable.

Potential features:

shopping list
recipe-to-shopping-list
receipt OCR

Do not allow this feature to compromise nutrition tracking quality or delay v1 core reliability.

==================================================
59. SECURITY
============

No secrets in Git.

No shared Gemini key in APK.

No USDA developer key in APK.

Use SecureStore for user BYOK.

Validate all imports.

Sanitize external API responses.

Limit image/file handling.

Audit dependencies.

If Codex Security is connected, run a security scan before release.

Document findings.

==================================================
60. PRIVACY
===========

Create:

docs/PRIVACY_ARCHITECTURE.md

Core data should remain local.

Document precisely what leaves the device for AI.

Do not send full weight history or entire food history merely because an AI model could consume it.

Send only necessary context.

Give users an AI-off mode.

==================================================
61. TESTING
===========

Treat tests as product requirements.

PURE DOMAIN TESTS:

trend weight
goal rate
macro generation
weekly distribution
TDEE
missing data
partial data
fasting
maintenance
check-ins
unit conversion

PROPERTY / INVARIANT TESTS:

weekly daily targets sum to weekly budget

macros sum to calories within tolerance

unit conversion round-trips

editing recipe does not rewrite historical nutrition

partial days are never treated as complete

missing days are never treated as zero intake

SIMULATIONS:

30 days
90 days
180 days
365 days
730 days

Scenarios:

stable maintenance
slow cut
aggressive cut
lean bulk
fast bulk
noisy scale
water spike
weight typo
missing weights
missing food logs
partial logging
holiday week
long tracking break
return from break
goal change
activity change
creatine/water shift
high-carb/low-carb transition

E2E TESTS:

Use a maintained free Android-capable framework such as Maestro if appropriate.

Test:

fresh install
onboarding
Done
home
log food
natural-language logging
date/time prompt
barcode
custom food
recipe
weight
outlier
weekly review
goal edit
unit change
backup
restore
AI offline failure

==================================================
62. PERFORMANCE TESTING
=======================

Test with:

10,000 food entries
multi-year weight history
large search database
long food timeline
large recipe library

Measure:

startup
search latency
scroll smoothness
chart rendering
database query time

Do not load entire tables into React state.

Paginate/virtualize appropriately.

==================================================
63. DATA SOURCE ATTRIBUTION
===========================

Every external food record needs provenance.

Create:

docs/FOOD_DATA_LICENSES.md

Track:

USDA
Open Food Facts
future sources

Never ship a database source whose redistribution terms are unclear.

==================================================
64. DESIGN SOURCE OF TRUTH
==========================

If Figma integration is available:

use it as the visual source of truth.

Define:

tokens
components
states
spacing
navigation
screens

At minimum create/reference designs for:

Onboarding
Home
Universal Capture
Food Timeline
Food Search
Food Review
Weight Log
Progress
Strategy
Weekly Review
Nerd AI
Settings

Do not design 50 screens independently.

Build a reusable component system first.

==================================================
65. CORE COMPONENTS
===================

Create reusable originals such as:

GlassDock
GlassSurface
FloatingComposer
FloatingAction
BottomSheet
MetricCard
MacroProgress
TrendSummary
GoalRateSlider
SegmentedControl
FoodRow
MealGroup
WeightRow
ReviewCard
StatusChip
DateTimeChip
SearchField
NumericField
ConfirmationSheet
EmptyState
Skeleton
Toast

No duplicate one-off variants without reason.

==================================================
66. ERROR STATES
================

Design intentionally for:

no internet
Open Food Facts rate limit
barcode not found
database unavailable
camera permission denied
Health Connect permission denied
AI key missing
AI rate limited
AI malformed response
OCR failure
backup corrupt

Never show a white screen.

Never silently fail.

==================================================
67. FREE BUILD SYSTEM
=====================

Do not require paid EAS cloud builds.

Configure local Android build.

Required development commands should ultimately include equivalent capabilities for:

install dependencies
typecheck
lint
test
prebuild Android
run Android
build debug APK
build release APK if desired
build release AAB

Use Gradle wrapper.

Document Java/Android SDK requirements.

==================================================
68. APK
========

Generate an installable debug or internal-testing APK during development.

Do not wait until the final milestone.

Smoke-test real APK behavior.

==================================================
69. GOOGLE PLAY
===============

Prepare a release-ready AAB.

Do not hardcode signing credentials.

Create a release checklist covering:

application ID
version code
version name
target SDK
icons
adaptive icon
splash
privacy policy
Data Safety
Health Connect declarations
AI disclosure
camera permissions
notifications
signing
AAB validation

Do not publish automatically.

==================================================
70. TEMPORARY PACKAGE NAME
==========================

If I have not explicitly supplied my permanent Google Play package/application ID:

use a development-only placeholder.

Clearly mark permanent application ID selection as a release blocker.

Never accidentally publish under a temporary package ID.

==================================================
71. GIT WORKFLOW
================

Create a working branch:

astra-v1

Keep main stable.

Commit after coherent milestones.

Commit messages should describe real completed work.

Do not commit:

keys
keystores
tokens
generated secret config

Maintain:

docs/BUILD_STATE.md

After each milestone update:

completed
tests
known problems
next step

If your execution window ends, another agent must be able to continue purely from the repository.

==================================================
72. TRACEABILITY
================

Create:

docs/TRACEABILITY_MATRIX.md

For every feature track:

FEATURE
USER ENTRY POINT
UI COMPONENT
DOMAIN LOGIC
DATABASE TABLE
DERIVED OUTPUT
AUTOMATED TEST
E2E TEST
STATUS

Status:

PLANNED
PARTIAL
COMPLETE
BLOCKED

Nothing is COMPLETE simply because a function exists.

==================================================
73. NO DEAD CONTROL RULE
========================

Every visible:

button
slider
toggle
chip
menu
chevron
icon
card action

must perform a real operation.

If it doesn't:

remove it.

==================================================
74. QUALITY GATE
================

Before marking a feature COMPLETE:

1. UI exists.
2. User can reach it normally.
3. Interaction works.
4. State changes.
5. Domain logic consumes state.
6. SQLite persists it.
7. UI visibly reflects result.
8. App reload preserves it.
9. Relevant test passes.
10. Traceability matrix is updated.

==================================================
75. MILESTONES
==============

Proceed through these milestones in order.

Do not stop after planning unless blocked by a genuinely required credential or product decision.

MILESTONE 0
Research, architecture, licenses, algorithm evidence, product spec.

MILESTONE 1
Project scaffold, SQLite, migrations, test harness, design tokens, responsive shell.

MILESTONE 2
Nerd Glass component system and navigation.

MILESTONE 3
Onboarding, Cut/Maintain/Bulk, goal rates, roadmap.

MILESTONE 4
Food database pipeline and search.

MILESTONE 5
Universal Capture, timeline, recipes, barcode, label scanner.

MILESTONE 6
Weight, trend model and outlier handling.

MILESTONE 7
Nerd Expenditure Engine v1 and calibration.

MILESTONE 8
Weekly calorie planning and macro engine.

MILESTONE 9
Weekly check-ins, maintenance and phase transitions.

MILESTONE 10
Nerd AI, AI Wizard and local memory.

MILESTONE 11
Health Connect, backups and imports.

MILESTONE 12
Full visual polish, accessibility and responsive/foldable pass.

MILESTONE 13
Adversarial testing, simulations, performance and security.

MILESTONE 14
Real Android APK.

MILESTONE 15
Release AAB preparation.

==================================================
76. FIRST DOCUMENTS
===================

Create and maintain:

docs/PRODUCT_SPEC.md
docs/RESEARCH_BENCHMARK.md
docs/ALGORITHM_EVIDENCE.md
docs/ALGORITHM_SPEC.md
docs/ARCHITECTURE.md
docs/DATA_MODEL.md
docs/FOOD_DATA_LICENSES.md
docs/DESIGN_SYSTEM.md
docs/USER_FLOWS.md
docs/PRIVACY_ARCHITECTURE.md
docs/TEST_STRATEGY.md
docs/TRACEABILITY_MATRIX.md
docs/ANDROID_RELEASE_PLAN.md
docs/BUILD_STATE.md
docs/DECISIONS.md

==================================================
77. DECISION RULE
=================

Do not ask me to make routine engineering decisions.

Research and choose.

Ask me only if:

* a decision materially changes product behavior
* a credential is required
* a permanent package/application ID is needed
* a legal/license blocker requires approval
* two UX directions are genuinely incompatible
* an irreversible destructive action is required

==================================================
78. NO FAKE COMPLETION
======================

Never tell me:

"fully implemented"

unless the complete traceability chain passes.

Never claim:

"production ready"

because TypeScript compiled.

Never treat:

unit tests

as proof that:

the UI works.

Actually run the app.

Actually click the flow.

Actually build Android.

==================================================
79. PRODUCT SIMPLICITY TEST
===========================

For every feature ask:

Does this make Nerd Fit:

faster
clearer
more accurate
more convenient
more trustworthy

If not:

do not add it merely because a competitor has it.

==================================================
80. FINAL PRODUCT EXPERIENCE
============================

A new user should ultimately be able to do this:

Install Nerd Fit

→ onboarding

→ choose Cut / Maintain / Bulk

→ choose target and pace

→ choose weekly calorie layout

→ see plan

→ Done

→ Home

→ tap floating capture

→ say or type:
"2 eggs and 4 rotis at 9am"

→ review

→ log

→ totals instantly update

→ log weight

→ Nerd Fit gradually learns expenditure

→ user sees simple calibration status

→ weekly review arrives

→ user understands what changed

→ accepts recommendation

→ targets update

→ later switches from Cut to Maintain

→ no history is lost

→ eventually switches to Bulk

All of that should feel like one coherent product.

==================================================
81. START NOW
=============

Begin with Milestone 0.

Research first.

Create the documentation.

Then continue milestone-by-milestone.

Do not use any previous Nerd Fit implementation.

Do not copy competitor code or UI.

Build the product independently.

Before committing the first application architecture, verify:

* current Expo/React Native compatibility
* Android build viability
* SQLite strategy
* native blur strategy
* food-data licenses
* AI-free core behavior
* local APK build strategy

Use connected GitHub for version control.

Use Superpowers methodology where useful for planning, TDD and debugging.

Use Figma as the design source of truth where available.

Use Codex Security before release if connected.

If you encounter a blocker, document it precisely instead of inventing a workaround.

Otherwise continue.

The objective is not to produce the most code.

The objective is to produce the best coherent Nerd Fit v1.0 that can actually be installed, trusted and eventually published.
