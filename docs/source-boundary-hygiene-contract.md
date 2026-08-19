# NovaSocial Source-Boundary Hygiene Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-19
**Purpose:** Ensure extracted source files remain clean standalone classic-script/stylesheets rather than carrying HTML boundaries or binary contamination.

## Contract

Every extracted JavaScript and CSS file under `src/` must be valid UTF-8 text with no NUL bytes, no CRLF line endings, and no executable/template `<script>` or `<style>` container tags. Comments documenting the existing `utils.js` runtime style-element behavior are not embedded markup and are ignored by the harness. These constraints protect the classic-script loader, browser parsing, and the separation between `index.html` and modularized source files.

## Harness coverage

`docs/source-boundary-hygiene-contract-harness.js` scans all 229 extracted JS/CSS files statically and asserts that each file satisfies the boundary rules. It does not execute application code or modify any file.

| Check | Expected behavior | Result |
|---|---|---|
| Source inventory | 211 JavaScript and 18 CSS files are scanned | PASS |
| UTF-8 text | Every extracted file decodes as UTF-8 | PASS |
| Binary contamination | Zero NUL bytes | PASS |
| Line endings | Zero CRLF line endings | PASS |
| HTML boundary contamination | Zero executable/template script or style container tags after comments are removed | PASS |

## Safe boundary

No production logic is changed by this audit. It only validates the boundaries of already-extracted files.

## References

1. [`index.html`](../index.html)
2. [`src/`](../src/)
3. [`extracted-file-hygiene-contract.md`](./extracted-file-hygiene-contract.md)

