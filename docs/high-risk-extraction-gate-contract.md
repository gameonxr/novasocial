# NovaSocial High-Risk Extraction Gate Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Define when and how a protected inline system may be considered for a modular split without weakening the stable architecture, and record the single verified particle exception.

## Current decision

The protected DM, Reels, Calls/WebRTC, Stories, Notes, push, recording, and related navigation systems remain inline in the current migration and are **not direct-extraction candidates yet**. The isolated particle and deletion-fallback owners are the only approved exceptions: both production moves passed seam, browser, static parity, and rollback checks. Existing parity and behavior contracts do not authorize moving any other protected code.

## Required gate before any high-risk split

A protected split may begin only for one subsystem at a time, after all of the following are complete; the particle checkpoint is the reference implementation for this gate: an authoritative baseline contract identifies timing, DOM, state, global, and load-order dependencies; a deterministic mock harness proves the existing event/order behavior; an explicit adapter or seam defines the module-to-inline interface; protected-marker parity is captured before and after the change; a reversible local browser smoke test covers the subsystem and its neighboring flows; and the complete Branch2 regression gate passes with a clean worktree. The change must be committed as a small Branch2-only checkpoint. If any parity, harness, syntax, or browser result differs, the split stops and the checkpoint is reverted.

The first implementation step is therefore a **seam/adapter**, not a blind copy of a large function. Only after the seam is proven equivalent may the implementation body move, and only after that move passes the same gates. DMs and Reels remain especially sensitive because of scroll-preserving refresh, persistent DOM containers, closure-owned touch handlers, and shared window state. Calls/WebRTC, Stories, Notes, push, and recording require the same staged treatment because their timing and cleanup dependencies are load-bearing.

## Harness coverage

`docs/high-risk-extraction-gate-contract-harness.js` statically verifies that the 17 unapproved protected marker inventory remains inline and absent from `src/`, that the approved particle and deletion-fallback owners are window-assigned exactly once with their source modules linked before the caller, and that all systems remain covered by the existing contract families. It also verifies that the required gate documentation and harness families exist. It does not move code, execute protected behavior, authenticate, call Supabase, or perform browser actions.

| Gate condition | Current status | Result |
|---|---|---|
| Protected systems remain inline | 17 unapproved safeguarded signatures present exactly once in `index.html` and absent from `src/`; particle and deletion fallback are represented by approved window owners | PASS |
| Baseline behavior coverage | Existing protected contract/harness families are present, including particle and deletion-fallback after-split evidence | PASS |
| Seam-first policy | Direct extraction remains explicitly blocked for the 17 unapproved systems until adapter and proof work passes | PASS |
| Branch safety | Gate is documentation-only and applies to `Branch2` | PASS |

## Safe boundary

The production logic changes in the completed checkpoints are limited to the isolated particle owner and deletion-fallback owner moves. Both passed subsystem-specific seam plans, reversible browser proofs, static parity, and rollback checks. All other high-risk systems remain inline and deferred until their own gates pass.

## References

1. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
2. [`protected-contract-coverage.md`](./protected-contract-coverage.md)
3. [`protected-inline-boundary-contract.md`](./protected-inline-boundary-contract.md)
4. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

