# NovaSocial New-DM Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the isolated New Message modal renderer without executing protected DM behavior.

## Contract

`showNewDM()` opens the existing `New Message` modal and renders a username-search field plus an empty result container. The input preserves its placeholder, id, style, and inline `searchDM(value)` callback wiring. The renderer does not invoke search, profile lookup, chat opening, message sending, navigation, or persistence while constructing the markup.

This contract covers only `src/features/show-new-dm.js`. The protected `searchDM`, profile/account lookup, `openChat`, message loading, realtime, block enforcement, and messaging actions remain outside this contract.

## Harness coverage

`docs/new-dm-renderer-contract-harness.js` loads the renderer in a detached VM with synthetic modal, body, and icon mocks. It verifies global availability, modal title, one search-icon request, placeholder, input/result ids, callback markup, and zero protected search/chat action execution.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the New Message modal and replace its body | PASS |
| Search UI | Preserve icon, placeholder, input id, and result-container id | PASS |
| Callback wiring | Preserve the delegated `searchDM(value)` handler | PASS |
| Delegation | Keep `searchDM` non-invoked during rendering | PASS |
| Scope | Keep account lookup, chat opening, messaging, realtime, and persistence outside the renderer | PASS |

## Safe boundary

The existing `src/features/show-new-dm.js` module remains unchanged. This checkpoint adds only detached evidence for its modal renderer. Account state, database/network access, realtime messaging, protected DM behavior, and live navigation remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, DM seam preparation, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize searching users, opening a conversation, sending a message, or navigating a live application.

## References

1. [`show-new-dm.js`](../src/features/show-new-dm.js)
2. [`dms-seam-preparation-contract.md`](./dms-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
