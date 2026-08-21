# NovaSocial Reversible Browser Proof Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Define the required reversible browser-proof gate for any future protected production split without executing protected behavior in this checkpoint.

## Current state

All protected production owners remain inline and the global direct-extraction gate remains blocked. A browser-context deterministic mock has now passed for the protected particle owner, with temporary DOM and timer APIs restored afterward. Protected marker/script-order parity and rollback-object checks have also passed against the captured Branch2 baseline. A browser-context deterministic mock has additionally passed for the voice permission-denied branch with real media APIs restored. A second browser-context mock has passed for the Push unsupported-capability guards with the original `PushManager` descriptor restored and no permission or subscription mutation. A third browser-context mock has passed for the Notes empty-content guard, returning before database or media paths with temporary DOM and note state restored. A fourth browser-context mock has passed for the deletion-fallback malformed-storage error boundary, with zero deletion calls and local-storage restoration. A fifth browser-context mock has passed for the Push denied-permission branches, with no permission request, subscription helper, reset helper, or settings refresh call. A sixth browser-context mock has passed for the Push granted/resubscribe branch, with exactly one mocked subscription delegation, one mocked settings refresh, and no permission request. A seventh browser-context mock has passed for the Push default-permission denied-result branch, with one mocked permission request, one settings refresh, zero subscription calls, and full restoration of temporary globals. An eighth browser-context mock has passed for the Push default-permission granted-result branch, with one mocked permission request, one subscription delegation, one settings refresh, and full restoration of temporary globals. A ninth browser-context mock has passed for the Push default-permission dismissed-result branch, with one mocked permission request, one settings refresh, zero subscription calls, and full restoration of temporary globals. A tenth browser-context mock has passed for the Push requestPermission failure branch, with one controlled request error, the expected error toast/log, one settings refresh, zero subscription calls, and full restoration of temporary globals. An eleventh browser-context mock has passed for the Push reset-failure branch, with one mocked reset call, the expected reset failure toast, one settings refresh, and full restoration of temporary globals. A twelfth browser-context mock has passed for the Push reset-success branch, with one mocked reset call, the expected success toast, one settings refresh, and full restoration of temporary globals. A thirteenth fresh-context browser mock has passed for the protected recording start/stop branch, with deterministic getUserMedia and MediaRecorder setup, mocked chat upload and message insertion, idle-state restoration, one synthetic track cleanup, and full restoration of temporary globals. A fourteenth fresh-context browser mock has passed for the deletion-fallback valid queue branch, with ordered replay of two synthetic items, one isolated per-item failure, queue finalization, and full restoration of temporary globals. A fifteenth fresh-context browser mock has passed for the Notes music-backed insert branch, with the synthetic payload preserved through the mocked quick_notes insert/select path, success feedback, modal close, Notes Bar reload, and full restoration of temporary globals. A sixteenth fresh-context browser mock has passed for the Notes active-note update-failure branch, with deterministic update targeting, failure feedback, no success-side effects, and full restoration of temporary globals. A seventeenth fresh-context browser mock has passed for the deletion-fallback empty-queue branch, with zero deletion calls, immediate return, preserved empty queue state, and full restoration of temporary globals. An eighteenth fresh-context browser mock has passed for the DMs empty-state renderer branch, with deterministic empty conversation and unread queries, Notes Bar delegation, the expected no-message UI, and full restoration of temporary globals. A nineteenth fresh-context browser mock has passed for the Reels empty-result renderer branch, with the expected no-reel UI, no likes query, no video creation, and full restoration of temporary globals. A twentieth fresh-context browser mock has passed for the Calls/WebRTC mocked setup branch, with synthetic RTCPeerConnection construction, four configured ICE servers, one local-track delegation, pending-candidate initialization, and full restoration of temporary globals. These results validate mock, parity, and rollback prerequisites only; they do not prove before/after production behavior parity or authorize a split. The high-risk matrix therefore records full reversible browser proof as **remaining**.

## Required proof sequence

A future protected split must be made on `Branch2` as a small, reversible checkpoint. Before and after the change, the proof must capture protected-marker parity, load-order parity, clean startup, and the relevant neighboring flow. The browser proof must be able to revert to the prior commit without data loss or irreversible account action.

| Protected area | Minimum reversible browser scenarios | Required observation |
|---|---|---|
| DMs | Open/close chat, return to list, background refresh | Chat container and scroll state remain stable; DMs empty-state browser mock evidence PASS |
| Reels | Enter, swipe several items, leave, return | Persistent container, index, overflow, and playback lifecycle remain stable; Reels empty-state browser mock evidence PASS |
| Stories | Open, navigate, close, poll/reaction path where applicable | Playback cleanup, bucket transitions, and controls remain stable |
| Calls/voice | Permission denial or mocked setup, cleanup path | No live call or microphone action is required; voice permission-denied, recording start/stop, and Calls/WebRTC mocked setup browser mock evidence PASS |
| Notes/push | Mocked submission or permission branches | Protected owners and UI state remain unchanged; Push unsupported-capability, denied-permission, granted/resubscribe, default-denied, default-granted, default-dismissed, request-failure, reset-failure, reset-success, Notes empty-validation, music-backed insert, and update-failure browser mock evidence PASS |
| Particles | Like-adjacent visual path with deterministic target | Twelve particles and cleanup remain unchanged; browser-context mock evidence PASS |

## Safety rules

The proof must not send messages, create posts, change credentials, request browser permission, access a microphone or camera, call a real WebRTC peer, mutate subscriptions, delete data, or perform irreversible account actions. Any unexpected marker, load-order, DOM, timing, or global difference stops the split and restores the previous Branch2 commit.

## Harness coverage

`docs/reversible-browser-proof-contract-harness.js` verifies that the global matrix still marks full browser proof as remaining, that the protected extraction gate remains blocked, that all current seam-preparation contracts, `docs/particle-browser-proof-evidence.txt`, and `docs/particle-parity-rollback-evidence.txt`, `docs/voice-browser-proof-evidence.txt`, `docs/push-browser-proof-evidence.txt`, `docs/push-denied-browser-proof-evidence.txt`, `docs/push-granted-browser-proof-evidence.txt`, `docs/push-default-denied-browser-proof-evidence.txt`, `docs/push-default-granted-browser-proof-evidence.txt`, `docs/push-default-dismissed-browser-proof-evidence.txt`, `docs/push-request-failure-browser-proof-evidence.txt`, `docs/push-reset-failure-browser-proof-evidence.txt`, `docs/push-reset-success-browser-proof-evidence.txt`, `docs/recording-start-stop-browser-proof-evidence.txt`, `docs/calls-webrtc-mocked-setup-browser-proof-evidence.txt`, `docs/dms-empty-state-browser-proof-evidence.txt`, `docs/reels-empty-state-browser-proof-evidence.txt`, `docs/notes-browser-proof-evidence.txt`, `docs/notes-music-insert-browser-proof-evidence.txt`, `docs/notes-update-failure-browser-proof-evidence.txt`, `docs/deletion-fallback-browser-proof-evidence.txt`, `docs/deletion-fallback-valid-queue-browser-proof-evidence.txt`, and `docs/deletion-fallback-empty-queue-browser-proof-evidence.txt` exist, and that protected production owners remain absent from `src/`. It reports particle mock, voice permission-denied mock, recording start/stop mock, Calls/WebRTC mocked setup mock, DMs empty-state mock, Reels empty-state mock, Push unsupported-capability mock, Push denied-permission mock, Push granted/resubscribe mock, Push default-denied mock, Push default-granted mock, Push default-dismissed mock, Push request-failure mock, Push reset-failure mock, Push reset-success mock, Notes empty-validation mock, Notes music-backed insert mock, Notes update-failure mock, deletion-fallback error mock, deletion-fallback valid-queue mock, deletion-fallback empty-queue mock, parity, and rollback evidence while intentionally keeping production-split proof **remaining**.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
3. [`protected-contract-coverage.md`](./protected-contract-coverage.md)
4. [`particle-browser-proof-evidence.txt`](./particle-browser-proof-evidence.txt)
5. [`particle-parity-rollback-evidence.txt`](./particle-parity-rollback-evidence.txt)
6. [`voice-browser-proof-evidence.txt`](./voice-browser-proof-evidence.txt)
7. [`push-browser-proof-evidence.txt`](./push-browser-proof-evidence.txt)
8. [`notes-browser-proof-evidence.txt`](./notes-browser-proof-evidence.txt)
9. [`deletion-fallback-browser-proof-evidence.txt`](./deletion-fallback-browser-proof-evidence.txt)
10. [`push-denied-browser-proof-evidence.txt`](./push-denied-browser-proof-evidence.txt)
11. [`push-granted-browser-proof-evidence.txt`](./push-granted-browser-proof-evidence.txt)
12. [`push-default-denied-browser-proof-evidence.txt`](./push-default-denied-browser-proof-evidence.txt)
13. [`push-default-granted-browser-proof-evidence.txt`](./push-default-granted-browser-proof-evidence.txt)
14. [`push-default-dismissed-browser-proof-evidence.txt`](./push-default-dismissed-browser-proof-evidence.txt)
15. [`push-request-failure-browser-proof-evidence.txt`](./push-request-failure-browser-proof-evidence.txt)
16. [`push-reset-failure-browser-proof-evidence.txt`](./push-reset-failure-browser-proof-evidence.txt)
17. [`push-reset-success-browser-proof-evidence.txt`](./push-reset-success-browser-proof-evidence.txt)
18. [`recording-start-stop-browser-proof-evidence.txt`](./recording-start-stop-browser-proof-evidence.txt)
19. [`deletion-fallback-valid-queue-browser-proof-evidence.txt`](./deletion-fallback-valid-queue-browser-proof-evidence.txt)
20. [`notes-music-insert-browser-proof-evidence.txt`](./notes-music-insert-browser-proof-evidence.txt)
21. [`notes-update-failure-browser-proof-evidence.txt`](./notes-update-failure-browser-proof-evidence.txt)
22. [`deletion-fallback-empty-queue-browser-proof-evidence.txt`](./deletion-fallback-empty-queue-browser-proof-evidence.txt)
23. [`dms-empty-state-browser-proof-evidence.txt`](./dms-empty-state-browser-proof-evidence.txt)
24. [`reels-empty-state-browser-proof-evidence.txt`](./reels-empty-state-browser-proof-evidence.txt)
25. [`calls-webrtc-mocked-setup-browser-proof-evidence.txt`](./calls-webrtc-mocked-setup-browser-proof-evidence.txt)
26. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

