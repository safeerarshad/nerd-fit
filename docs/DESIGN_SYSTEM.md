# Nerd Glass design system

Source of truth: [Nerd Fit — Nerd Glass v1](https://www.figma.com/design/hNdcDjtyKpUaQRIK1smFLI). File created 2026-09-23; component and screen validation is tracked below, not implied by file existence.

## Foundation contract

Colors: background #101714, surface #1A2420, raised #25322C, text #F3F5EE, secondary #B7C4BA, accent #C5EDAD, accentInk #1B2C17, information #C7C0E8, warning #F4CCA1, border #3D4C42. Semantic status always also has a label/icon. Typography: Android system sans in app, matching Roboto specimens in design; 14/16 body, 20 section, 32 page, 48 primary metric with scalable text. Never cap font scaling to fix layout.

Spacing 4/8/12/16/24/32/48; radii 12/20/28; minimum touch 48. Content max width 1100; compact gutters16, medium24, expanded32; two columns from720 when content supports it, readable forms max560. No hardcoded device resolution.

## Reusable components

GlassSurface (tonal card / overlay), GlassDock, FloatingAction, FloatingComposer, BottomSheet, MetricCard, MacroProgress, TrendSummary, GoalRateSlider, SegmentedControl, FoodRow, MealGroup, WeightRow, ReviewCard, StatusChip, DateTimeChip, SearchField, NumericField, ConfirmationSheet, EmptyState, Skeleton, Toast. Components are introduced as consumers arrive, with no fake actions.

Buttons expose default/pressed/disabled/busy states and an accessibility role/label. Fields include label, unit, help/error and locale-aware numeric input. Sheets include back dismissal, focus management, safe area, keyboard avoidance and a reachable primary action. Charts include accessible text summaries.

## Material and motion

Content uses tonal elevation. True blur is reserved for navigation/composer/overlays and uses one shared target on Android. Clear/Balanced/Tinted preferences cannot reduce contrast below accessibility requirements; fallback uses a sufficiently opaque surface. Spring only for physical expansion, short ease for opacity and navigation. Reduced motion uses immediate state changes. No perpetual animation. Haptics only on successful meaningful actions.

## Required design coverage

Onboarding, Home, Universal Capture, Timeline, Search, Review, Weight Log, Progress, Strategy, Weekly Review, Nerd AI, Settings. Each needs empty/loading/error/populated states where applicable. Figma artifact is currently a new file; validation must precede a COMPLETE design claim.
