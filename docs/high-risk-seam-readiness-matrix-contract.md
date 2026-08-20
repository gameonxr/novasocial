# NovaSocial High-Risk Seam Readiness Matrix Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Make the remaining protected-feature split setup measurable without moving protected production code.

## Current matrix

| Readiness layer | Current state | Split implication |
|---|---:|---|
| Protected inline signatures | 19/19 retained exactly once | Baseline complete |
| Protected signatures in `src/` | 0 | No protected production code has moved |
| High-risk gate | Present and passing | Global guard complete |
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, and deletion fallback artifacts present | Behavioral baselines exist, but they are not adapter proofs by themselves |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Reversible browser proof | Not yet established for a protected split | Required before the first production move |
| Protected production splits | 0/19 signatures moved | Direct extraction remains blocked |

## Contract decision

The setup is **baseline-complete but split-not-ready** for protected systems. The next required work is per-feature seam preparation, not direct extraction. For one selected system at a time, the project must add a dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, and reversible browser proof. Only then may a minimal production extraction be attempted on `Branch2`.

The account/bootstrap seam is the current documented adapter reference. It does not authorize moving DMs, Reels, Calls/WebRTC, Stories, Notes, Push, recording, or deletion-fallback code.

## Non-goals

This checkpoint does not alter `index.html`, `src/`, load order, protected globals, realtime ownership, media behavior, authentication, or browser state. It does not claim that any protected feature is ready for production extraction.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

