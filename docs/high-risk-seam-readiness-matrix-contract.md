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
| Feature coverage contracts | DM, Reels, Calls/WebRTC, voice recording, Stories/Notes, Push, deletion fallback, and particle seam-preparation artifacts present; all nine protected seam contracts explicitly bind their listed mock inventories; 33 protected browser-proof evidence artifacts carry PASS markers | Feature-specific seam maps, deterministic mock boundaries, and non-destructive browser evidence exist, but they are not production-split approval |
| Adapter/seam contract | Account/bootstrap contract present | One cross-cutting adapter seam is documented; it is not production-extracted |
| Adapter harness | Account/bootstrap mock harness present | Test-only proof exists for the bootstrap seam |
| Reversible browser proof | Contract and harness are present; browser proof is not yet established for a protected split. Thirty-three non-destructive browser-context mock artifacts are inventoried and passing, but none is before/after proof for a production split | Required before the first production move |
| Protected production splits | 0/19 signatures moved | Direct extraction remains blocked |

## Contract decision

The setup is **baseline-complete but split-not-ready** for protected systems. The repository now inventories 33 passing non-destructive browser-context mock artifacts across the protected systems, and all nine protected seam-preparation contracts explicitly bind their corresponding evidence inventories. These mocks do not establish before/after production-split proof. The next required work is per-feature seam preparation, not direct extraction. For one selected system at a time, the project must add a dependency/DOM/timing/global map, explicit adapter boundary, deterministic mock harness, before/after marker parity, and reversible browser proof. Only then may a minimal production extraction be attempted on `Branch2`.

The account/bootstrap seam is the current documented adapter reference. It does not authorize moving DMs, Reels, Calls/WebRTC, Stories, Notes, Push, recording, or deletion-fallback code.

## Non-goals

This checkpoint does not alter `index.html`, `src/`, load order, protected globals, realtime ownership, media behavior, authentication, or browser state. It does not claim that any protected feature is ready for production extraction.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-extraction-gate-contract-harness.js`](./high-risk-extraction-gate-contract-harness.js)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
5. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

