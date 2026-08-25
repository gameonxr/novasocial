# NovaSocial Cross-Module Function Collision Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Verify that classic-script modularization does not introduce duplicate top-level function names that could overwrite global handlers.

## Contract

NovaSocial loads extracted scripts as classic scripts, so top-level function declarations are exposed in the shared page environment. Duplicate names across `index.html` and extracted modules could silently replace handlers depending on load order. The audit covers `index.html` plus all 227 extracted JavaScript modules and identifies 703 unique top-level function names after the authorized forwarding and jump-to-message changes.

Every audited function name must occur only once across the complete classic-script surface. Protected functions remain inline; this audit detects collisions without moving or rewriting them.

## Harness coverage

`docs/cross-module-function-collision-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Files audited | 228 total: index.html plus 227 modules | PASS |
| Function inventory | 703 unique top-level function names | PASS |
| Collision safety | Zero duplicate top-level function names | PASS |
| Protected boundary | Existing inline systems remain in place | PASS |

The harness is static and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

The audit confirms global function-name safety after the authorized inline forwarding implementation; it does not extract or rename protected systems and still requires every top-level function name to remain unique.

## Validation

The standalone harness passed with `AUDITED_FILES=228`, `TOP_LEVEL_FUNCTION_NAMES=703`, and `DUPLICATE_NAMES=0`. The complete repository validation chain must pass after publication.

## References

1. [`index.html` inline application script](../index.html)
2. [`src/` extracted JavaScript modules](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
