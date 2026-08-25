# NovaSocial Window-Assignment Surface Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-25
**Purpose:** Prevent accidental expansion or renaming of the shared `window` assignment surface used by classic-script modules and inline handlers.

## Contract

NovaSocial intentionally uses a shared classic-script environment. The current application surface contains 214 explicit `window.<name> =` assignment occurrences spanning 112 unique names across `index.html` and the 227 extracted JavaScript modules. These assignments include UI state, subscriptions, timers, account state, navigation state, and HTML-handler compatibility functions; the authorized forwarding flow adds `_forwardMessagePending`, and the safe jump-to-message split adds `jumpToMessage`.

The contract freezes the current names and occurrence count without changing ownership or behavior. It does not prohibit ordinary local variables, reads from `window`, or intentional repeated writes to an existing state slot. It also does not claim that every global should be redesigned or cleaned up; any namespace refactor requires a separate compatibility review because protected DMs, Reels, Calls, Stories, Navigation, and account transitions depend on shared state.

## Harness coverage

`docs/window-assignment-surface-contract-harness.js` scans only the application surface: `index.html` and `src/**/*.js`. It asserts the exact 112-name allowlist and 214 occurrence count, and reports unexpected additions or missing names. It excludes documentation, harnesses, `sw.js`, and generated artifacts. The harness is static and does not execute application code, authenticate, call Supabase, or mutate state.

| Check | Expected behavior | Result |
|---|---:|---|
| Application files | `index.html` plus 227 extracted JavaScript modules | PASS |
| Explicit assignments | 214 `window.<name> =` occurrences | PASS |
| Unique assignment names | 112 names, all in the audited allowlist | PASS |
| Protected behavior | Only the authorized forwarding state and safe DOM-owner globals are added; protected owner names remain unchanged | PASS |

## Safe boundary

The contract records the shared namespace after the authorized forwarding state slot was added. It does not authorize namespace cleanup, protected-owner extraction, or renaming of compatibility surfaces.

## References

1. [`index.html`](../index.html)
2. [`src/`](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

