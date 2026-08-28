# NovaSocial High-Risk Seam Readiness Matrix Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Make protected-feature split readiness measurable while recording the eleven completed approved protected-owner signatures across the DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing-helper, and Notes reactor-list checkpoints, while preserving safeguards for the remaining systems.

## Current matrix

| Readiness layer | Current state | Split implication |
|---|---:|---|
| Protected inline signatures | 8/19 unapproved signatures retained exactly once; DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing-helper, Notes reactor-list, and bounded Reels renderer owners are represented by approved window owners | Eleven protected-owner signatures are externalized and complete; remaining systems stay blocked |
| Protected signatures in `src/` | 11 approved completed owners (`renderReels`, `renderDMs`, `spawnLikeParticles`, `syncLocalDeletionFallback`, `enablePushFromSettings`, `resetPushFromSettings`, `viewNote`, `removeMyNoteFromViewer`, `deleteMyNote`, `renderStoryElements`, `loadNoteReactorsList`); 8 unapproved owners absent | All eleven bounded owners have moved and completed their required validation |
| High-risk gate | Present and passing | Global guard complete |
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, deletion fallback, and particle seam-preparation artifacts present; all eleven protected seam contracts explicitly bind their listed mock inventories; aggregate preparation harnesses plus the Push permission behavior harness enforce their injected seam-proof markers; 33 protected browser-proof mock artifacts plus DMs, Push, particle/deletion-fallback/Note deletion comparison and after-split artifacts carry PASS markers | Feature-specific seam maps and deterministic mock boundaries exist; DMs renderer, particle, deletion fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, bounded Reels renderer, and Notes reactor list are production-split approved, while the other 8 remain gated |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Particle candidate | SPLIT_COMPLETE; test-only comparison, after-split parity, production browser smoke, and rollback-after-split are PASS | Particle is approved and complete |
| Deletion-fallback candidate | SPLIT_COMPLETE; test-only comparison, after-split production smoke, exact owner hash, and rollback-after-split are PASS | Deletion fallback is approved and complete |
| Note viewer candidate | SPLIT_COMPLETE; synthetic seam parity, login-gated browser proof, exact owner hashes, after-split browser smoke, and detached rollback are PASS | Note viewer is approved and complete |
| Note deletion candidate | SPLIT_COMPLETE; synthetic success/failure parity, authenticated shell reload, anonymous-window owner proof, and detached rollback evidence are PASS | Note deletion is approved and complete |
| Reversible browser proof | Contract and harness are present; DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, bounded Reels renderer, and Notes reactor-list before/after browser proofs are PASS, while browser proof remains outstanding for 8 unapproved systems. Thirty-three non-destructive browser-context mock artifacts, injected seam-proof inventories including Push permission and DMs, and comparison and after-split artifact groups are inventoried and passing | Required independently before each remaining production move |
| Protected production splits | 11/19 protected signatures moved and fully validated; one additional supporting Reels windowing helper is split with its own gate | Direct extraction remains blocked for the 8 unapproved protected signatures |

## Remaining production authorization status

The preparation harnesses are intentionally stronger than a production authorization decision. The following rows make the remaining missing gates explicit so an injected mock proof cannot be mistaken for approval:

| Remaining protected system | Injected seam preparation | Independent before/after parity | Safe browser proof | Rollback artifact | Production decision |
|---|---|---|---|---|---|
| DMs renderer (chat/realtime owners remain protected) | PASS | PASS | PASS | PASS | SPLIT_COMPLETE |
| Reels renderer and swipe/navigation owners (bounded renderer only) | PASS | PASS | PASS | PASS | SPLIT_COMPLETE |
| Reels video windowing helper | PASS | PASS | PASS | PASS | SPLIT_COMPLETE; bounded renderer is separately complete |
| Calls/WebRTC peer and signaling | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED |
| Story viewer, playback, polls, viewers, replies, submission, and deletion | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED |
| Voice recording and delivery | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED |
| Notes submission and reaction submission | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED |
| Notes reactor list | PASS | PASS | PASS | PASS | SPLIT_COMPLETE; submission/reaction owners remain protected |
| Push permission and silent resubscribe helpers | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED |

## Contract decision

The setup has **eleven externalized and fully validated protected owners; eleven bounded scopes are split-complete, while the remaining protected systems are not ready**. The repository inventories 33 passing non-destructive browser-context mock artifacts across the protected systems, passing injected seam-proof inventories including Push permission and DMs, plus DMs, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, the contained Reels windowing-helper, and the Notes reactor-list comparison and after-split browser evidence; all eleven protected seam-preparation contracts explicitly bind their corresponding evidence inventories. Particle, deletion fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, Notes reactor list, and the DMs renderer passed their available before/after browser sequences; the DMs renderer and bounded Reels renderer additionally passed their remote rollback-after-split sequences. Each remaining protected system must independently add or complete its dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, reversible browser proof, and complete Branch2 regression gate before a minimal production extraction is attempted.

The account/bootstrap seam remains the documented adapter reference. Particle was the first low-risk protected candidate, deletion fallback the second, Push settings the third, Note viewer the fourth, Story editor the fifth, Note deletion the sixth, Reels windowing helper the seventh contained helper, Notes reactor list the eighth contained read-only interaction owner, the DMs renderer the tenth externalized protected owner, and the main Reels renderer the eleventh bounded owner completed after browser and rollback validation; eleven bounded boundaries are `SPLIT_COMPLETE`, while broader chat/realtime owners remain protected. This does not authorize moving the broader chat/realtime owners, Reels swipe/navigation or media-policy systems beyond the bounded renderer owner, Calls/WebRTC, Story polls, recording code, Notes submission/reaction owners, or Push permission helpers; each remains subject to its own gate.

## Non-goals

This checkpoint records the eleventh completed externalized protected owner, the `renderDMs()` owner, the bounded `renderReels()` owner, and the read-only `loadNoteReactorsList()` owner, and their script load order; it preserves the `window.spawnLikeParticles`, `window.syncLocalDeletionFallback`, `window.enablePushFromSettings`, `window.resetPushFromSettings`, `window.viewNote`, `window.removeMyNoteFromViewer`, `window.deleteMyNote`, `window.renderStoryElements`, `window._applyReelsVideoWindowing`, and `window.loadNoteReactorsList` global handoffs and does not alter realtime ownership, media behavior, authentication, or browser state. It does not claim that excluded navigation/media/action systems or broader chat/realtime owners are ready for extraction; those remain protected.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

