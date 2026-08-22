# NovaSocial High-Risk Seam Readiness Matrix Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Make protected-feature split readiness measurable while recording the four verified particle, deletion-fallback, Push settings, and Note viewer production splits and preserving safeguards for the remaining systems.

## Current matrix

| Readiness layer | Current state | Split implication |
|---|---:|---|
| Protected inline signatures | 13/19 unapproved signatures retained exactly once; particle, deletion-fallback, Push settings, and Note viewer are represented by approved window owners | Baseline and fourth split complete |
| Protected signatures in `src/` | 6 approved owners (`spawnLikeParticles`, `syncLocalDeletionFallback`, `enablePushFromSettings`, `resetPushFromSettings`, `viewNote`, `removeMyNoteFromViewer`); 13 unapproved owners absent | Only the four verified owner groups have moved |
| High-risk gate | Present and passing | Global guard complete |
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, deletion fallback, and particle seam-preparation artifacts present; all nine protected seam contracts explicitly bind their listed mock inventories; 33 protected browser-proof mock artifacts plus Push exact-owner comparison and particle/deletion-fallback comparison/after-split artifacts carry PASS markers | Feature-specific seam maps and deterministic mock boundaries exist; particle, deletion fallback, Push settings, and Note viewer are production-split approved, while the other 13 remain gated |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Particle candidate | SPLIT_COMPLETE; test-only comparison, after-split parity, production browser smoke, and rollback-after-split are PASS | Particle is approved and complete |
| Deletion-fallback candidate | SPLIT_COMPLETE; test-only comparison, after-split production smoke, exact owner hash, and rollback-after-split are PASS | Deletion fallback is approved and complete |
| Note viewer candidate | SPLIT_COMPLETE; synthetic seam parity, login-gated browser proof, exact owner hashes, after-split browser smoke, and detached rollback are PASS | Note viewer is approved and complete |
| Reversible browser proof | Contract and harness are present; particle, deletion-fallback, Push settings, and Note viewer before/after browser proofs are PASS, while browser proof remains outstanding for 13 unapproved systems. Thirty-three non-destructive browser-context mock artifacts plus four comparison and after-split artifact groups are inventoried and passing | Required independently before each remaining production move |
| Protected production splits | 6/19 signatures moved: particle, deletion fallback, the two Push settings owners, and the two Note viewer owners | Direct extraction remains blocked for the 13 unapproved systems |

## Contract decision

The setup is **four-split-complete but not ready for the remaining protected systems**. The repository inventories 33 passing non-destructive browser-context mock artifacts across the protected systems, plus particle, deletion-fallback, Push settings, and Note viewer comparison and after-split browser evidence; all nine protected seam-preparation contracts explicitly bind their corresponding evidence inventories. Particle, deletion fallback, Push settings, and Note viewer passed their full before/after and rollback sequences. Each remaining protected system must independently add or complete its dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, reversible browser proof, and complete Branch2 regression gate before a minimal production extraction is attempted.

The account/bootstrap seam remains the documented adapter reference. Particle was the first low-risk protected candidate, deletion fallback the second, Push settings the third, and Note viewer the fourth; all are now `SPLIT_COMPLETE` after passing comparison, production browser smoke, exact owner-hash parity, and rollback checks. This does not authorize moving DMs, Reels, Calls/WebRTC, Stories, or recording code; each remains subject to its own gate.

## Non-goals

This checkpoint records the fourth protected production owner group, Note viewer, and its script load order; it preserves the `window.spawnLikeParticles`, `window.syncLocalDeletionFallback`, `window.enablePushFromSettings`, `window.resetPushFromSettings`, `window.viewNote`, and `window.removeMyNoteFromViewer` global handoffs and does not alter realtime ownership, media behavior, authentication, or browser state. It does not claim that any remaining protected feature is ready for production extraction.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

