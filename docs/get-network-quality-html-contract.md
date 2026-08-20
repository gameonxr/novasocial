# NovaSocial Get Network Quality HTML Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted Call-UI network indicator builder.

## Contract

`getNetworkQualityHTML()` reads the available browser connection object, defaults to three active bars, maps `4g` to four bars, `3g` to two bars, and `2g` to one bar, then renders four bar elements with active/inactive classes and colors. It returns the generated HTML string.

The helper owns indicator markup only. Call setup, transport, signaling, and protected call execution remain outside this module.

## Harness coverage

`docs/get-network-quality-html-contract-harness.js` validates connection-source fallbacks, quality mapping, default state, four-bar rendering, active/inactive styling, and Call-UI-only scope.

The harness is deterministic and static. It does not access browser connection state, render HTML, or initiate calls.

## Safe boundary

The extracted `src/features/get-network-quality-html.js` module remains unchanged in this checkpoint. Protected Calls systems remain untouched.

## References

1. [`get-network-quality-html.js`](../src/features/get-network-quality-html.js)
2. [`call-feature-contract.md`](./call-feature-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

