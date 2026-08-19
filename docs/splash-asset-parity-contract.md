# NovaSocial Splash Asset Parity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Record and guard a pre-existing splash-logo asset defect discovered during local Branch2 browser smoke testing.

## Finding

The splash logo uses an embedded PNG data URL in `index.html`. Both Branch2 and untouched `origin/main:index.html` contain the exact same 48,047-character Base64 payload. After standard padding, it decodes to 36,034 bytes with a valid PNG signature but a truncated chunk stream; Chromium reports `complete: true` with `naturalWidth: 0` and `naturalHeight: 0`.

Because the defect is identical in untouched main, it is **pre-existing and not caused by modularization**. This checkpoint intentionally does not replace the asset or alter production UI behavior. A future product fix can regenerate and replace the splash asset in a separate, explicitly approved change.

## Harness coverage

`docs/splash-asset-parity-contract-harness.js` compares the Branch2 payload with `origin/main:index.html`, verifies byte-for-byte parity and the PNG signature, and detects the same truncated chunk stream in both references.

| Check | Expected behavior | Result |
|---|---|---|
| Branch2/main parity | Splash Base64 payloads are identical | PASS |
| PNG signature | Both decoded payloads begin with the PNG signature | PASS |
| Defect classification | Both references have the same truncated chunk stream | PASS |
| Scope decision | No speculative production fix is applied | PASS |

## Safe boundary

This is a static, documentation-only parity audit. It does not replace the asset, modify HTML, access accounts, or change the protected modularization surface.

## References

1. [`index.html`](../index.html)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`root-deployment-integrity-contract.md`](./root-deployment-integrity-contract.md)

