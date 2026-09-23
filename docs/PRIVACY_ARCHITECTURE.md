# Privacy architecture

Core facts and algorithms stay on the device. No account, remote analytics, advertisements or developer-operated backend is required. SQLite is inside Android app-private storage; this does not claim protection on a compromised/unlocked device. SecureStore is used for BYOK secrets and keys are excluded from app backups/export/logs. Configure Android backup deliberately before release; do not imply local-only while silently enabling cloud backup.

| Operation | Data leaving device | Destination / consent |
| --- | --- | --- |
| Local log, trend, plan, review | None | Offline |
| USDA pack update | HTTP connection metadata | Explicit dataset download; never a shared API key |
| OFF lookup | Barcode or explicit query, User-Agent, network metadata | Open Food Facts; attributed cache |
| AI text | User-selected message and minimal needed draft fields | Gemini only after disclosure and BYOK opt-in |
| AI image | Explicitly selected bounded image with metadata removed | Gemini after separate image confirmation |
| Health Connect | Only permitted record types | Android Health Connect; user permission |
| Export/share | Selected backup/CSV | Android share destination chosen by user |

Never attach full food/weight history automatically to an AI prompt. AI explanations can use one deterministic review summary. Local memories are inspectable, editable, deletable and optional. Disabling AI prevents provider requests and keeps normal tracking usable. Provider policy/free-tier terms are rechecked when implemented; do not promise unlimited free inference.

Restore treats JSON and API responses as hostile input, applies byte/record limits and validated schemas before commit, and does not execute embedded content. Camera images are bounded and temporary; remove stale processing copies. Logs contain error categories rather than user meals, images, keys or health histories. Audit events record minimal action metadata.

Before release: verify network traffic in AI-off mode, backup exclusion rules, key removal, reset, permission revocation, image cleanup, attribution and a user-readable privacy policy matching actual implementation. This document describes intended boundaries; TRACEABILITY_MATRIX records implementation state.
