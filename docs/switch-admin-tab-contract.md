# NovaSocial Switch Admin Tab Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted admin-tab selection helper.

## Contract

`switchAdminTab(tab)` examines every `.admin-tab` element. The element whose `data-tab` equals `tab` receives the active background, border, and color; every other tab receives the inactive background, border, and color.

After applying styles to the complete tab set, the helper delegates exactly once to `loadAdminTab(tab)`, forwarding the selected tab unchanged. The helper owns tab highlighting only; admin data loading and destructive admin operations remain in their existing owners.

The harness is static and documentation-only. It does not open the admin panel, query data, or perform deletion operations.

## Harness coverage

`docs/switch-admin-tab-contract-harness.js` validates the function signature, complete tab iteration, data-tab comparison, active/inactive style markers, exact argument forwarding, single delegation, and scope boundaries.

## References

1. [`switch-admin-tab.js`](../src/features/switch-admin-tab.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

