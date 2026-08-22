# NovaSocial index.html Tag-Integrity Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify that modularized script integration has not damaged the core HTML tag boundaries.

## Contract

`index.html` must retain balanced script tags and a single inline application script boundary. The current modularized page contains 214 extracted/external script references plus one remaining inline application script, for 215 total script tags after the deletion-fallback split. The document, body, and HTML root elements must each open and close exactly once.

## Harness coverage

`docs/index-html-tag-integrity-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| HTML5 doctype | Present | PASS |
| Script tags | 215 opening tags | PASS |
| Script closures | 215 closing tags | PASS |
| Integrated scripts | 214 `src` tags | PASS |
| Inline boundary | One inline application script | PASS |
| Body boundary | One opening and one closing body tag | PASS |
| HTML boundary | One opening and one closing html tag | PASS |
| Protected boundary | DMs and Reels renderers remain inline | PASS |

The harness is structural and documentation-only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

The deletion-fallback production split is limited to its module script reference and removal of the original inline owner. The audit confirms HTML integration integrity without altering the remaining protected systems.

## Validation

The standalone harness passed with `SCRIPT_TAGS=215`, `SCRIPT_CLOSURES=215`, `EXTERNAL_SCRIPT_TAGS=214`, and `INLINE_SCRIPT_TAGS=1`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html`](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
