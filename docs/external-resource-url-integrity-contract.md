# NovaSocial External-Resource URL Integrity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Detect unsafe executable or mixed-content resource references without breaking ordinary user-entered link normalization.

## Contract

Tracked application files must not contain `javascript:` URLs or `data:text/html`/`data:application` executable payload URLs. The only intentional `http://` string is the existing user-link normalization fallback in `src/core/utils.js`, which prepends `http://` when a user enters a bare non-domain link; it is not a resource load and remains unchanged. All static resource URLs and external service URLs used by the application must use HTTPS or local paths.

## Harness coverage

`docs/external-resource-url-integrity-contract-harness.js` scans the application HTML, extracted source, service worker, and manifest. It reports insecure-resource findings by file and pattern only, while allowing the two documented `http://` normalization references in `src/core/utils.js`.

| Check | Expected behavior | Result |
|---|---|---|
| Executable URL schemes | Zero `javascript:` URLs | PASS |
| Executable data payloads | Zero `data:text/html` or `data:application` URLs | PASS |
| Insecure resource URLs | Zero unexpected `http://` resource references | PASS |
| User-link compatibility | The two intentional utils normalization references remain | PASS |
| Local/external integration | HTTPS and local paths remain allowed | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not rewrite user URLs, access accounts, fetch external resources, or change production code.

## References

1. [`src/core/utils.js`](../src/core/utils.js)
2. [`local-html-asset-reference-contract.md`](./local-html-asset-reference-contract.md)
3. [`root-deployment-integrity-contract.md`](./root-deployment-integrity-contract.md)

