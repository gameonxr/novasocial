# NovaSocial Classic-Script Compatibility Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-19
**Purpose:** Verify that modularization preserves the classic-script execution model required by NovaSocial’s global handlers and ordered dependencies.

## Contract

NovaSocial intentionally loads extracted JavaScript as classic scripts rather than ES modules. Every extracted file under `src/` must therefore avoid top-level `import` and `export` syntax. Every HTML `<script>` tag must remain free of `type="module"`, `defer`, and `async` attributes so the established dependency order is not changed. The page must retain the complete 213-script integration surface.

This contract complements the module-reference and inline-handler contracts. It does not execute application code; it verifies only the syntax and tag attributes that determine whether globals and ordered classic-script dependencies remain available.

## Harness coverage

`docs/classic-script-compatibility-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Script count | 213 HTML script tags remain integrated | PASS |
| Module tags | Zero `type="module"` tags | PASS |
| Deferred/asynchronous tags | Zero `defer` or `async` attributes that could reorder globals | PASS |
| Extracted syntax | Zero top-level `import`/`export` markers in 211 extracted JavaScript files | PASS |
| Classic execution model | Existing global-function and ordered-script architecture remains structurally possible | PASS |

The harness is static and documentation-only. It does not authenticate, call Supabase, register a service worker, send messages, mutate accounts, or execute protected application functions.

## Safe boundary

No production application code was changed by this checkpoint. The audit protects script loading semantics without converting classic scripts to modules or moving any fragile inline code.

## Validation

The standalone harness must pass together with every individual contract harness, all current `/tmp/validate_*.py` checks, JavaScript syntax checks, inline-script syntax validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`index.html`](../index.html)
2. [`src/`](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

