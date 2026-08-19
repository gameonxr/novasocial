# NovaSocial PWA Manifest Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-19
**Purpose:** Verify that the installable PWA manifest and its HTML/service-worker integration remain intact after modularization.

## Contract

`manifest.json` must remain valid JSON and describe the NovaSocial standalone application with a root start URL and scope. It must retain the current branding, portrait orientation, theme/background colors, and both required PNG icon sizes. `index.html` must link the manifest, expose the matching theme color, retain the mobile web-app capability metadata, and register the root service worker at `/sw.js`.

The manifest contract is intentionally separate from the service-worker contract. The manifest harness checks installability metadata and file references; the service-worker harness checks caching, push, and notification behavior.

## Harness coverage

`docs/pwa-manifest-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| JSON validity | `manifest.json` parses successfully | PASS |
| Identity | Name and short name are `NovaSocial` | PASS |
| App shell | Start URL and scope are `/` | PASS |
| Display | Standalone portrait app remains configured | PASS |
| Branding | Theme and background colors remain present | PASS |
| Icons | 192px and 512px PNG icons exist and are referenced | PASS |
| HTML link | `index.html` links `/manifest.json` | PASS |
| HTML metadata | Matching theme color and mobile web-app capability remain | PASS |
| Service-worker registration | `index.html` registers `/sw.js` | PASS |

The harness is static and documentation-only. It does not install the PWA, register a service worker, authenticate, call Supabase, or mutate browser state.

## Safe boundary

No production code was changed in this checkpoint. The audit only verifies existing PWA metadata and integration boundaries.

## Validation

The standalone harness must pass with the complete Branch2 validation chain before publication. The audit is independent of the current Vercel deployment because that deployment serves `main`, not Branch2.

## References

1. [`manifest.json`](../manifest.json)
2. [`index.html`](../index.html)
3. [`sw.js`](../sw.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

