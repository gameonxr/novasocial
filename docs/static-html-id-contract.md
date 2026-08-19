# NovaSocial Static HTML ID Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify that static HTML markup does not contain duplicate element IDs after modularization.

## Contract

Static IDs in actual HTML tags must be unique so DOM lookups remain deterministic. This audit intentionally parses only IDs attached to HTML tags. IDs assigned inside JavaScript strings or through `element.id = ...` are runtime-managed surfaces and are not treated as duplicate static markup. The Calls/WebRTC implementation uses a protected runtime-managed `nova-call-screen` ID for its call-screen lifecycle and remains inline.

## Harness coverage

`docs/static-html-id-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Static ID inventory | 166 actual HTML markup IDs | PASS |
| Static uniqueness | Every markup ID occurs once | PASS |
| Duplicate static IDs | Zero | PASS |
| Dynamic Calls boundary | Runtime-managed call IDs remain protected inline | PASS |
| DMs/Reels boundaries | Protected renderers remain inline | PASS |

The harness is structural and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

No production code was changed in this checkpoint. The earlier broad text scan’s apparent duplicate `nova-call-screen` was correctly classified as two protected runtime assignments, not duplicate static HTML markup.

## Validation

The standalone harness passed with `STATIC_IDS=166`, `DUPLICATE_STATIC_IDS=0`, and `DYNAMIC_CALL_IDS=PROTECTED_RUNTIME_MANAGED`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` static markup and protected inline systems](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
