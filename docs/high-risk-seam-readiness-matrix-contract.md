# NovaSocial High-Risk Seam Readiness Matrix Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Make protected-feature split readiness measurable while recording the single verified particle production split and preserving safeguards for the remaining systems.

## Current matrix

| Readiness layer | Current state | Split implication |
|---|---:|---|
| Protected inline signatures | 18/19 unapproved signatures retained exactly once; particle is represented by one approved window owner | Baseline and first split complete |
| Protected signatures in `src/` | 1 approved particle owner; 18 unapproved owners absent | Only particle production code has moved |
| High-risk gate | Present and passing | Global guard complete |
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, deletion fallback, and particle seam-preparation artifacts present; all nine protected seam contracts explicitly bind their listed mock inventories; 33 protected browser-proof mock artifacts plus particle comparison and after-split artifacts carry PASS markers | Feature-specific seam maps and deterministic mock boundaries exist; particle is production-split approved, while the other 18 remain gated |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Particle candidate | SPLIT_COMPLETE; test-only comparison, after-split parity, production browser smoke, and rollback-after-split are PASS | Particle is approved and complete; next candidate requires its own gate |
| Reversible browser proof | Contract and harness are present; particle before/after browser proof is PASS, while browser proof remains outstanding for 18 unapproved systems. Thirty-three non-destructive browser-context mock artifacts plus particle comparison and after-split artifacts are inventoried and passing | Required independently before each remaining production move |
| Protected production splits | 1/19 signatures moved: particle only | Direct extraction remains blocked for the 18 unapproved systems |

## Contract decision

The setup is **particle-split-complete but not ready for the remaining protected systems**. The repository inventories 33 passing non-destructive browser-context mock artifacts across the protected systems, plus particle comparison and after-split browser evidence; all nine protected seam-preparation contracts explicitly bind their corresponding evidence inventories. Particle passed the full before/after and rollback sequence. Each remaining protected system must independently add or complete its dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, reversible browser proof, and complete Branch2 regression gate before a minimal production extraction is attempted.

The account/bootstrap seam remains the documented adapter reference. Particle was the first low-risk protected candidate and is now `SPLIT_COMPLETE` after passing comparison, production browser smoke, exact owner-hash parity, and rollback checks. This does not authorize moving DMs, Reels, Calls/WebRTC, Stories, Notes, Push, recording, or deletion-fallback code; each remains subject to its own gate.

## Non-goals

This checkpoint alters only the particle production owner location and its script load order; it preserves the `window.spawnLikeParticles` global handoff and does not alter realtime ownership, media behavior, authentication, or browser state. It does not claim that any remaining protected feature is ready for production extraction.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

