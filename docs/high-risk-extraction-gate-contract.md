# NovaSocial High-Risk Extraction Gate Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-22
**Purpose:** Define when and how a protected inline system may be considered for a modular split without weakening the stable architecture, and record the twelve verified or validation-pending protected-owner groups plus the contained Reels windowing-helper exception.

## Current decision

The broader protected DM/chat realtime owners, the Reels navigation/media systems beyond the bounded renderer, Calls/WebRTC, Story polls, recording, Notes submission, broader reaction/realtime systems, and Push permission systems remain inline in the current migration and are **not direct-extraction candidates yet**. The bounded Reels renderer and DMs renderer, particle, deletion-fallback, Push-settings, Note-viewer, Note-deletion, Story-editor, read-only Notes reactor-list, and bounded `reactToNote()` owners are the approved protected-owner exceptions; the contained Reels windowing helper is separately approved as a supporting owner. The eleven previously completed owners passed seam, browser or authenticated shell, static parity, and rollback checks; the DMs renderer has now also passed detached parity, authenticated pre/post observation, and the controlled remote rollback/recovery sequence. Existing parity and behavior contracts do not authorize moving any other protected code; the DMs authorization is limited to `renderDMs()` and does not include chat/realtime mutation owners.

## Required gate before any high-risk split

A protected split may begin only for one subsystem at a time, after all of the following are complete; the particle checkpoint is the reference implementation for this gate: an authoritative baseline contract identifies timing, DOM, state, global, and load-order dependencies; a deterministic mock harness proves the existing event/order behavior; an explicit adapter or seam defines the module-to-inline interface; protected-marker parity is captured before and after the change; a reversible local browser smoke test covers the subsystem and its neighboring flows; and the complete Branch2 regression gate passes with a clean worktree. The change must be committed as a small Branch2-only checkpoint. If any parity, harness, syntax, or browser result differs, the split stops and the checkpoint is reverted.

The first implementation step is therefore a **seam/adapter**, not a blind copy of a large function. Only after the seam is proven equivalent may the implementation body move, and only after that move passes the same gates. DMs and Reels remain especially sensitive because of scroll-preserving refresh, persistent DOM containers, closure-owned touch handlers, and shared window state. Calls/WebRTC, Stories, Notes, push, and recording require the same staged treatment because their timing and cleanup dependencies are load-bearing.

## Harness coverage

`docs/high-risk-extraction-gate-contract-harness.js` statically verifies that all tracked protected signatures are approved and externalized (zero unapproved signatures remain inline), that the externalized DMs and Reels renderers, the completed bounded owners, the final-stretch Calls/WebRTC, Story viewer, voice recording, chat/DMs, and media-upload owners, and the contained Reels windowing helper are window-assigned exactly once with their source modules linked before the caller, and that all systems remain covered by the existing contract families. The remaining inline surface (shared state declarations, bootstrap wiring, boundary listeners) remains protected by this gate. It also verifies that the required gate documentation and harness families exist. It does not move code, execute protected behavior, authenticate, call Supabase, or perform browser actions.

| Gate condition | Current status | Result |
|---|---|---|
| Protected systems remain inline | 0 unapproved safeguarded signatures remain; all tracked protected owners are externalized with approved window owners, and the remaining inline surface is the by-design state/bootstrap/listener boundary | PASS |
| Baseline behavior coverage | Existing protected contract/harness families are present, including particle and deletion-fallback after-split evidence | PASS |
| Seam-first policy | Direct extraction remains explicitly blocked for the inline boundary surfaces (shared state declarations, bootstrap wiring, boundary listeners) until adapter and proof work passes | PASS |
| Branch safety | Gate is documentation-only and applies to `Branch2` | PASS |

## Safe boundary

The production logic changes in the completed checkpoints are limited to the isolated DMs renderer owner, bounded Reels renderer owner, particle owner, deletion-fallback owner, Push-settings owners, Note-viewer owners, Note-deletion owner, Story-editor renderer, contained Reels windowing-helper owner, read-only Notes reactor-list owner, and bounded Notes reaction owner. The eleven previously completed owners passed subsystem-specific seam plans, reversible browser or authenticated shell proofs, static parity, and rollback checks; the DMs renderer has also passed its local/remote observation gates and controlled rollback/recovery evidence. Reels navigation/media systems beyond the bounded renderer, Notes submission and broader reaction/realtime owners, and all other high-risk systems remain inline and deferred until their own gates pass.

## References

1. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
2. [`protected-contract-coverage.md`](./protected-contract-coverage.md)
3. [`protected-inline-boundary-contract.md`](./protected-inline-boundary-contract.md)
4. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

