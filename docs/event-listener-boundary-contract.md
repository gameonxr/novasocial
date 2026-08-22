# NovaSocial Event-Listener Boundary Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record where event listeners are allowed to exist after modularization without redesigning protected UI behavior.

## Contract

The modularized application may contain event-listener registrations in extracted JavaScript modules when those registrations are part of the module's existing behavior. This audit does not claim that every listener has a corresponding cleanup path, and it does not alter or refactor any listener. It freezes the current boundary inventory: extracted modules contain 68 `addEventListener` registrations and zero `removeEventListener` registrations; the application entry HTML contains 34 `addEventListener` registrations and zero `removeEventListener` registrations; the service worker contains five lifecycle/event registrations.

The contract is intentionally observational. It protects against an accidental broad listener rewrite during later modularization work while leaving fragile navigation, DMs, Reels, Stories, Calls, and other existing systems untouched. Any future listener cleanup improvement must be proposed and tested as a separate behavior change rather than inferred from this audit.

## Harness coverage

`docs/event-listener-boundary-contract-harness.js` scans the extracted JavaScript tree, `index.html`, and `sw.js` statically. It verifies the current registration counts, confirms source files remain free of `removeEventListener`, and reports the files containing extracted registrations. It does not execute application code, attach listeners, authenticate, access Supabase, or mutate the repository.

| Surface | Expected registration count | Cleanup registrations | Result |
|---|---:|---:|---|
| Extracted `src/**/*.js` | 74 `addEventListener` occurrences after Story editor split | 0 `removeEventListener` occurrences | PASS |
| `index.html` | 28 `addEventListener` occurrences after Story editor split | 0 `removeEventListener` occurrences | PASS |
| `sw.js` | 5 `addEventListener` occurrences | Not applicable | PASS |

## Safe boundary

No production source is changed by this audit. The harness documents the present listener placement and prevents an accidental change to the established modularized architecture. It does not classify the pre-existing listener lifecycle as a defect.

## References

1. [`index.html`](../index.html)
2. [`src/`](../src/)
3. [`sw.js`](../sw.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

