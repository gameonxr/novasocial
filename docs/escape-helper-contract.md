# NovaSocial Escape Helper Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the shared `esc()` compatibility behavior used by extracted and protected renderers.

## Contract

The shared `esc(str)` helper in `src/core/utils.js` must return an empty string for `null` and `undefined`, stringify other values, and escape the five HTML-special-character classes currently covered by the implementation: ampersand, less-than, greater-than, double quote, and single quote.

This contract records helper behavior only. It does not claim that every `innerHTML` interpolation is escaped, rewrite existing renderers, add sanitization, or change content display semantics. Any broader render-safety change requires a separate review because many protected UI systems intentionally combine escaped values, trusted icons, URLs, and markup.

## Harness coverage

`docs/escape-helper-contract-harness.js` extracts and evaluates only the `esc()` function body with Node’s VM and asserts null/undefined handling, stringification, and exact special-character replacements. It also confirms the helper remains defined once in `src/core/utils.js`. It does not execute the app, render HTML, call Supabase, or access a browser.

| Check | Expected behavior | Result |
|---|---|---|
| Nullish input | `null` and `undefined` become `''` | PASS |
| Stringification | Numbers and booleans become strings | PASS |
| HTML escaping | `&`, `<`, `>`, `"`, and `'` use current entities | PASS |
| Helper location | One shared definition in `src/core/utils.js` | PASS |
| Production behavior | No renderer or sanitization changes | PASS |

## Safe boundary

No production logic is changed by this audit. It locks the shared pure helper so modular extraction cannot silently change output encoding.

## References

1. [`src/core/utils.js`](../src/core/utils.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

