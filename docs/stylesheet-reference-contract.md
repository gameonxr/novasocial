# NovaSocial Stylesheet Reference Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify that every extracted stylesheet is integrated into `index.html` exactly once.

## Contract

The modularized application contains 18 CSS files under `src/styles/`. Each stylesheet must have exactly one matching `<link rel="stylesheet" href="…">` reference in `index.html`. Missing links can silently remove feature styling, while duplicate links can create unnecessary reloads and cascading-order ambiguity.

The protected DMs and Reels renderers remain inline; this audit checks their markers only and does not execute or modify either system.

## Harness coverage

`docs/stylesheet-reference-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Stylesheet inventory | 18 extracted CSS files remain | PASS |
| Integration | Every stylesheet is linked by index.html | PASS |
| Duplicate protection | No stylesheet is linked more than once | PASS |
| Protected boundary | DMs and Reels renderers remain inline | PASS |

The harness is structural and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

No production code was changed in this checkpoint. The audit confirms CSS integration without moving, rewriting, or reordering protected JavaScript systems.

## Validation

The standalone harness passed with `STYLESHEETS=18`, `MISSING=0`, and `DUPLICATES=0`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` stylesheet integration](../index.html)
2. [`src/styles/` extracted stylesheets](../src/styles/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
