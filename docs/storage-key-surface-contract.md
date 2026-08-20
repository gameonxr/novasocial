# NovaSocial Storage-Key Surface Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the browser-storage compatibility surface used by accounts, drafts, navigation, themes, media queues, and feature preferences.

## Contract

The application surface (`index.html` plus `src/**/*.js`) currently uses 29 literal localStorage keys and no sessionStorage API. These keys include saved accounts, last-screen restoration, DM drafts, theme/FAB preferences, notes, channels, communities, media deletion queues, Cloudinary counters, music/sticker recents, and related settings.

The audit is limited to literal string keys. Dynamic families such as `type+'_stickers'` remain behavior-owned by their existing helper and are not incorrectly flattened into this allowlist. The contract does not clear storage, migrate values, change account-reset behavior, or claim that all keys share the same lifecycle.

## Harness coverage

`docs/storage-key-surface-contract-harness.js` scans only `index.html` and `src/**/*.js`. It asserts zero `sessionStorage` references, exactly 29 unique literal localStorage keys, and an exact allowlist with no unexpected or missing names. It is static and does not access a browser profile, read real user storage, authenticate, or mutate data.

| Check | Expected behavior | Result |
|---|---:|---|
| Literal localStorage keys | 29 unique compatibility keys | PASS |
| sessionStorage | 0 references | PASS |
| Dynamic storage families | Remain outside literal-key allowlist | PASS |
| Runtime behavior | No storage read/write/clear is executed | PASS |

## Safe boundary

No production logic is changed by this audit. It records the current storage surface so future modularization cannot silently rename or remove a compatibility key.

## References

1. [`index.html`](../index.html)
2. [`src/`](../src/)
3. [`saved-account-schema-contract.md`](./saved-account-schema-contract.md)
4. [`tab-cache-contract.md`](./tab-cache-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

