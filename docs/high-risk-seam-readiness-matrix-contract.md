# NovaSocial High-Risk Seam Readiness Matrix Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Make protected-feature split readiness measurable while recording the twelve completed approved protected-owner signatures across the DMs renderer, particle, deletion-fallback, Push settings, Push permission banner, Note viewer, Note deletion, Story editor, Reels windowing-helper, Notes reactor-list, bounded Reels renderer, and bounded Notes reaction checkpoints, while preserving safeguards for the remaining systems.

## Current matrix

| Readiness layer | Current state | Split implication |
|---|---:|---|
| Protected inline signatures | 7/19 unapproved signatures retained exactly once; DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing-helper, Notes reactor-list, bounded Reels renderer, and bounded Notes reaction owners are represented by approved window owners | Twelve protected-owner signatures are externalized; eleven are complete and the Notes reaction owner remains validation-pending |
| Protected signatures in `src/` | 12 externalized owners (`renderReels`, `renderDMs`, `spawnLikeParticles`, `syncLocalDeletionFallback`, `enablePushFromSettings`, `resetPushFromSettings`, `viewNote`, `removeMyNoteFromViewer`, `deleteMyNote`, `renderStoryElements`, `loadNoteReactorsList`, `reactToNote`); 7 unapproved owners absent | Eleven bounded owners are complete; the Notes reaction owner has passed detached/rollback gates and awaits fresh deployment observation |
| High-risk gate | Present and passing | Global guard complete |
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, deletion fallback, and particle seam-preparation artifacts present; all twelve protected seam contracts explicitly bind their listed mock inventories; aggregate preparation harnesses plus the Push permission behavior harness enforce their injected seam-proof markers; 33 protected browser-proof mock artifacts plus DMs, Push, particle/deletion-fallback/Note deletion comparison and after-split artifacts carry PASS markers | Feature-specific seam maps and deterministic mock boundaries exist; DMs renderer, particle, deletion fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, bounded Reels renderer, and Notes reactor list are production-split approved, while the bounded Notes reaction owner is validation-pending on a stale deployment, while the other 7 protected signatures remain gated |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Particle candidate | SPLIT_COMPLETE; test-only comparison, after-split parity, production browser smoke, and rollback-after-split are PASS | Particle is approved and complete |
| Deletion-fallback candidate | SPLIT_COMPLETE; test-only comparison, after-split production smoke, exact owner hash, and rollback-after-split are PASS | Deletion fallback is approved and complete |
| Note viewer candidate | SPLIT_COMPLETE; synthetic seam parity, login-gated browser proof, exact owner hashes, after-split browser smoke, and detached rollback are PASS | Note viewer is approved and complete |
| Note deletion candidate | SPLIT_COMPLETE; synthetic success/failure parity, authenticated shell reload, anonymous-window owner proof, and detached rollback evidence are PASS | Note deletion is approved and complete |
| Reversible browser proof | Contract and harness are present; DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, bounded Reels renderer, and Notes reactor-list before/after browser proofs are PASS, while browser proof is PASS for the fresh Notes reaction deployment observation; authenticated reaction invocation remains intentionally unperformed, and 7 unapproved systems remain blocked. Thirty-three non-destructive browser-context mock artifacts, injected seam-proof inventories including Push permission and DMs, and comparison and after-split artifact groups are inventoried and passing | Required independently before each remaining production move |
| Protected production splits | 14/19 protected signatures moved; 14 bounded scopes are split-complete, including Notes submission; authenticated reaction invocation remains intentionally unperformed | Direct extraction remains blocked for the 5 unapproved protected signatures |

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
| Notes submission owner (`submitNote()` bounded only) | PASS | PASS | PASS (synthetic production harness; no live Note action) | PASS | SPLIT_COMPLETE; live Note/database actions excluded |
| Notes reaction owner (`reactToNote()` bounded only) | PASS | PASS | PASS (fresh Preview module observation; no invocation) | PASS | SPLIT_COMPLETE; authenticated invocation intentionally unperformed |
| Notes reactor list | PASS | PASS | PASS | PASS | SPLIT_COMPLETE; submission/reaction owners remain protected |
| Push permission banner (`maybeShowPushPermissionBanner()` bounded only) | PASS | PASS | PASS (safe module observation; no permission invocation) | PASS | SPLIT_COMPLETE |
| Silent Push resubscribe (`silentPushResubscribeIfGranted()` bounded only) | PASS | PASS | PASS (safe module observation; no invocation) | PASS | SPLIT_COMPLETE; live Push actions excluded |

## Contract decision

The setup has **fourteen externalized protected owners; fourteen bounded scopes are split-complete, including the silent Push resubscribe owner and fresh Notes reaction deployment observation; authenticated reaction invocation remains intentionally unperformed, while the remaining protected systems are not ready**. The repository inventories 33 passing non-destructive browser-context mock artifacts across the protected systems, passing injected seam-proof inventories including Push permission and DMs, plus DMs, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story editor, the contained Reels windowing-helper, and the Notes reactor-list comparison and after-split browser evidence; all fourteen protected seam contracts explicitly bind their corresponding evidence inventories. Particle, deletion fallback, Push settings, Note viewer, Note deletion, Story editor, Reels windowing helper, Notes reactor list, and the DMs renderer passed their available before/after browser sequences; the DMs renderer and bounded Reels renderer additionally passed their remote rollback-after-split sequences. Each remaining protected system must independently add or complete its dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, reversible browser proof, and complete Branch2 regression gate before a minimal production extraction is attempted.

The account/bootstrap seam remains the documented adapter reference. Notes submission (`submitNote()`) was the fourteenth bounded production owner extracted after explicit authorization. Particle was the first low-risk protected candidate, deletion fallback the second, Push settings the third, Note viewer the fourth, Story editor the fifth, Note deletion the sixth, Reels windowing helper the seventh contained helper, Notes reactor list the eighth contained read-only interaction owner, the DMs renderer the tenth externalized protected owner, the main Reels renderer the eleventh bounded owner, and the bounded `reactToNote()` owner the twelfth externalized owner, the bounded `silentPushResubscribeIfGranted()` owner the thirteenth, and the bounded `submitNote()` owner the thirteenth, and the bounded `submitNote()` owner the fourteenth; fourteen bounded boundaries are `SPLIT_COMPLETE`; the Notes reaction owner passed fresh Preview deployment observation, while authenticated invocation remains intentionally unperformed, while broader chat/realtime owners remain protected. This does not authorize moving the broader chat/realtime owners, Reels swipe/navigation or media-policy systems beyond the bounded renderer owner, Calls/WebRTC, Story polls, recording code, Notes reaction, realtime, media, or the broader Push permission/subscription systems; each remains subject to its own gate.

## Non-goals

This checkpoint records fourteen externalized protected owners, including the `renderDMs()` owner, the bounded `renderReels()` owner, the read-only `loadNoteReactorsList()` owner, and the bounded `reactToNote()` owner, and their script load order; it preserves the `window.spawnLikeParticles`, `window.syncLocalDeletionFallback`, `window.enablePushFromSettings`, `window.resetPushFromSettings`, `window.viewNote`, `window.removeMyNoteFromViewer`, `window.deleteMyNote`, `window.renderStoryElements`, `window._applyReelsVideoWindowing`, and `window.loadNoteReactorsList` global handoffs and does not alter realtime ownership, media behavior, authentication, or browser state. It does not claim that excluded navigation/media/action systems or broader chat/realtime owners are ready for extraction; those remain protected.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

