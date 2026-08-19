# NovaSocial Root Deployment Integrity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Verify that the root files required for browser deployment and PWA startup remain present, non-empty, and correctly integrated.

## Contract

The deployment root must contain a non-empty `index.html`, valid `manifest.json`, non-empty `sw.js`, and the three required PNG icons at 180×180, 192×192, and 512×512 pixels. `index.html` must reference the manifest, the 192px favicon, the 180px Apple touch icon, and `/sw.js` registration.

The empty legacy file named `chore: add feature architecture` is intentionally not treated as a deployment artifact and is left unchanged.

## Harness coverage

`docs/root-deployment-integrity-contract-harness.js` reads the root artifacts without modifying them, validates PNG signatures and dimensions through a minimal PNG header parser, parses the manifest as JSON, and checks the required HTML references.

| Check | Expected behavior | Result |
|---|---|---|
| Root shell | `index.html`, `manifest.json`, and `sw.js` are present and non-empty | PASS |
| PWA icons | 180px, 192px, and 512px PNG files have matching dimensions | PASS |
| HTML integration | Manifest, favicon, Apple touch icon, and service-worker registration are present | PASS |
| Legacy artifact safety | Empty legacy filename is not modified or used as a deployment asset | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not start a server, register a service worker, access an account, or alter any root asset.

## References

1. [`index.html`](../index.html)
2. [`manifest.json`](../manifest.json)
3. [`sw.js`](../sw.js)

