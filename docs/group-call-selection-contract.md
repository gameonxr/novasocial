# NovaSocial Group-Call Selection Toggle Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the isolated group-call participant selection toggle without executing protected call behavior.

## Contract

`togGC(uid, el)` maintains the in-memory `window._gcs` selected-user list and updates the corresponding `gc-chk-<uid>` synthetic checkbox. A first toggle adds the uid, shows a check mark, and applies the selected colors. A second toggle removes the uid, clears the check mark, and restores the unselected colors. Missing checkbox nodes are tolerated.

This contract covers only `src/features/tog-gc.js`. Group-call participant lookup, account validation, database/session state, signaling, media permissions, peer connections, call initiation, realtime channels, and teardown remain outside this contract.

## Harness coverage

`docs/group-call-selection-contract-harness.js` loads the helper in a detached VM with synthetic DOM nodes. It verifies global availability, add/remove ordering, duplicate prevention through toggling, selected/unselected checkbox styling, missing-node tolerance, and zero protected group-call action execution.

| Scenario | Expected behavior | Result |
|---|---|---|
| First toggle | Add the uid exactly once and show selected checkbox state | PASS |
| Second toggle | Remove the uid and restore unselected checkbox state | PASS |
| Multiple users | Preserve independent selection order and state | PASS |
| Missing node | Maintain selection state without throwing | PASS |
| Scope | Keep account, DB/network, media, signaling, call initiation, realtime, and teardown behavior outside the helper | PASS |

## Safe boundary

The existing `src/features/tog-gc.js` module remains unchanged. This checkpoint adds only detached evidence for its in-memory selection/UI owner. All protected group-call behavior remains inline or delegated outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, group-call preparation, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize inviting users, starting a call, accessing a real account, opening media devices, using WebRTC, or navigating a live application.

## References

1. [`tog-gc.js`](../src/features/tog-gc.js)
2. [`calls-webrtc-seam-preparation-contract.md`](./calls-webrtc-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
