# NovaSocial URL Base64 to Uint8Array Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted pure push-key conversion helper.

## Contract

`urlBase64ToUint8Array(base64String)` computes RFC 4648-style Base64 padding from the input length, converts URL-safe `-` and `_` characters to `+` and `/`, decodes the normalized value through `window.atob`, allocates a `Uint8Array` matching the decoded byte length, and copies each decoded character code into the output bytes in order.

The helper does not own push subscription registration, VAPID configuration, network requests, storage, or permission prompts. Invalid Base64 handling remains delegated to the platform decoder and is not changed by this audit.

## Harness coverage

`docs/url-base64-to-uint8-array-contract-harness.js` validates the function signature, padding formula, URL-safe alphabet conversion, `window.atob` delegation, typed-array allocation, ordered byte copying, and non-ownership of push orchestration.

The harness is deterministic and static. It does not contact push services or request notification permission.

## References

1. [`url-base64-to-uint8-array.js`](../src/features/url-base64-to-uint8-array.js)
2. [`index.html`](../index.html), push subscription call site
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

