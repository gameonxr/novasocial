# NovaSocial Group-Call Setup Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated group-call setup modal renderer without executing protected group membership or call behavior.

## Contract

`showGC()` opens the existing `New Group Chat` modal, resets the local `_gcs` participant-selection list, and replaces the modal body with the group-name input, member-search input, result container, and Create Group button. The search and create controls preserve their existing ids, placeholders, classes, and inline callback wiring. Renderer construction does not invoke `searchGC()` or `createGC()`.

This contract covers only the renderer already isolated in `src/features/show-gc.js`. Group membership lookup or mutation, account validation, database/session state, signaling, media permissions, peer connections, call initiation, realtime channels, and teardown remain outside this contract.

## Harness coverage

`docs/show-gc-renderer-contract-harness.js` loads the renderer in a detached VM with synthetic modal, body, icon, and protected-callback mocks. It verifies global availability, modal title, icon request, selection reset, group-name and member-search markup, callback wiring, and zero invocation of protected group-call actions.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the existing New Group Chat modal and replace its body | PASS |
| Selection reset | Start a fresh local `_gcs` selection list | PASS |
| Setup fields | Preserve group-name and member-search placeholders and ids | PASS |
| Result area | Preserve the `gc-r` result container | PASS |
| Delegation | Keep `searchGC` and `createGC` as non-invoked callbacks | PASS |
| Scope | Keep membership, session, signaling, media, realtime, and call behavior outside the renderer | PASS |

## Safe boundary

The existing `src/features/show-gc.js` module remains unchanged. This checkpoint adds only detached evidence for its modal renderer. Group membership state, database/network access, account state, signaling, WebRTC, realtime behavior, call initiation, and teardown remain outside this contract.

## Validation

The standalone harness must pass with the group-call selection contract, Calls/WebRTC preparation, contract-artifact pairing, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize searching users, creating a group, starting a call, accessing a real account, opening media devices, using WebRTC, or navigating a live application.

## References

1. [`show-gc.js`](../src/features/show-gc.js)
2. [`group-call-selection-contract.md`](./group-call-selection-contract.md)
3. [`calls-webrtc-seam-preparation-contract.md`](./calls-webrtc-seam-preparation-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
