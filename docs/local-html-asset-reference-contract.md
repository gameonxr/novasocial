# NovaSocial Local HTML Asset-Reference Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify that static local asset references in `index.html` resolve to files in the repository.

## Contract

Static local `src`, `href`, and `poster` references must resolve to existing repository files. Root-absolute paths such as `/manifest.json` are resolved against the repository root. External URLs, data URLs, JavaScript URLs, fragment links, and dynamic template expressions are excluded because they are runtime or remote surfaces rather than local repository assets.

## Harness coverage

`docs/local-html-asset-reference-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Static local inventory | 232 unique local references | PASS |
| Missing local assets | Zero unresolved local references | PASS |
| PWA manifest | `manifest.json` exists | PASS |
| Service worker | `sw.js` exists | PASS |
| Dynamic URL boundary | Runtime-generated media URLs excluded | PASS |
| External URL boundary | Supabase CDN and other remote URLs excluded | PASS |

The harness is structural and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

No production code was changed in this checkpoint. The audit confirms local asset availability without moving, rewriting, or modifying protected systems.

## Validation

The standalone harness passed with `STATIC_LOCAL_REFS=232` and `MISSING_REFS=0`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` local asset references](../index.html)
2. [`manifest.json`](../manifest.json)
3. [`sw.js`](../sw.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
