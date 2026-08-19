# NovaSocial Module Script Reference Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify that every extracted JavaScript module is integrated into `index.html` exactly once.

## Contract

The extracted JavaScript surface contains 211 modules: 9 core scripts, 2 shared component scripts, and 200 feature scripts. Every module must have exactly one matching `<script src="…"></script>` tag in `index.html`. Missing references would create silent feature failures, while duplicate references could register listeners or globals more than once.

All core modules load before the protected inline application script. The final three feature scripts retain their required order: `smart-ranking.js`, `nova-init.js`, and `like-effects.js`. Protected DMs and Reels renderers remain inline.

## Harness coverage

`docs/module-script-reference-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Extracted module inventory | 211 modules remain present | PASS |
| Script integration | Every module is referenced by index.html | PASS |
| Duplicate protection | No module is loaded more than once | PASS |
| Core ordering | All core scripts precede inline application code | PASS |
| Trailing order | `smart-ranking` → `nova-init` → `like-effects` | PASS |
| Protected boundary | DMs and Reels renderers remain inline | PASS |

The harness is structural and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

No production code was changed in this checkpoint. The audit confirms script integration without extracting or rewriting any protected system.

## Validation

The standalone harness passed with `MODULES=211`, `MISSING=0`, and `DUPLICATES=0`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` script integration](../index.html)
2. [`src/` extracted JavaScript modules](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
