# NovaSocial Reversible Browser Proof Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Define the required reversible browser-proof gate for any future protected production split without executing protected behavior in this checkpoint.

## Current state

All protected production owners remain inline and the global direct-extraction gate remains blocked. A browser-context deterministic mock has now passed for the protected particle owner, with temporary DOM and timer APIs restored afterward. Protected marker/script-order parity and rollback-object checks have also passed against the captured Branch2 baseline. A browser-context deterministic mock has additionally passed for the voice permission-denied branch with real media APIs restored. A second browser-context mock has passed for the Push unsupported-capability guards with the original `PushManager` descriptor restored and no permission or subscription mutation. These results validate mock, parity, and rollback prerequisites only; they do not prove before/after production behavior parity or authorize a split. The high-risk matrix therefore records full reversible browser proof as **remaining**.

## Required proof sequence

A future protected split must be made on `Branch2` as a small, reversible checkpoint. Before and after the change, the proof must capture protected-marker parity, load-order parity, clean startup, and the relevant neighboring flow. The browser proof must be able to revert to the prior commit without data loss or irreversible account action.

| Protected area | Minimum reversible browser scenarios | Required observation |
|---|---|---|
| DMs | Open/close chat, return to list, background refresh | Chat container and scroll state remain stable |
| Reels | Enter, swipe several items, leave, return | Persistent container, index, overflow, and playback lifecycle remain stable |
| Stories | Open, navigate, close, poll/reaction path where applicable | Playback cleanup, bucket transitions, and controls remain stable |
| Calls/voice | Permission denial or mocked setup, cleanup path | No live call or microphone action is required; voice permission-denied browser mock evidence PASS |
| Notes/push | Mocked submission or permission branches | Protected owners and UI state remain unchanged; Push unsupported-capability browser mock evidence PASS |
| Particles | Like-adjacent visual path with deterministic target | Twelve particles and cleanup remain unchanged; browser-context mock evidence PASS |

## Safety rules

The proof must not send messages, create posts, change credentials, request browser permission, access a microphone or camera, call a real WebRTC peer, mutate subscriptions, delete data, or perform irreversible account actions. Any unexpected marker, load-order, DOM, timing, or global difference stops the split and restores the previous Branch2 commit.

## Harness coverage

`docs/reversible-browser-proof-contract-harness.js` verifies that the global matrix still marks full browser proof as remaining, that the protected extraction gate remains blocked, that all current seam-preparation contracts, `docs/particle-browser-proof-evidence.txt`, and `docs/particle-parity-rollback-evidence.txt`, `docs/voice-browser-proof-evidence.txt`, and `docs/push-browser-proof-evidence.txt` exist, and that protected production owners remain absent from `src/`. It reports particle mock, voice permission-denied mock, Push unsupported-capability mock, parity, and rollback evidence while intentionally keeping production-split proof **remaining**.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
3. [`protected-contract-coverage.md`](./protected-contract-coverage.md)
4. [`particle-browser-proof-evidence.txt`](./particle-browser-proof-evidence.txt)
5. [`particle-parity-rollback-evidence.txt`](./particle-parity-rollback-evidence.txt)
6. [`voice-browser-proof-evidence.txt`](./voice-browser-proof-evidence.txt)
7. [`push-browser-proof-evidence.txt`](./push-browser-proof-evidence.txt)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

