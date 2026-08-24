# NovaSocial Reels Poll UI Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record deterministic test-only evidence for the already extracted Reels poll UI helper while keeping the protected Reels renderer and swipe system inline.

## Contract

`showReelPoll(reelId)` opens the existing modal, renders the poll question and two option inputs, and wires the existing `saveReelPoll(reelId)` action. `saveReelPoll(reelId)` reads the three input values, emits the existing validation toast when any value is missing, and otherwise emits the existing success toast and closes the modal.

The helper is **UI-only**. It does not insert or update poll data, fetch Reels, access accounts, upload media, navigate, or mutate the protected Reels renderer/swipe state. The `reelId` is preserved only in the existing generated button callback and is not given new persistence semantics by this contract.

## Harness coverage

`docs/reel-poll-contract-harness.js` loads `src/features/reel-poll.js` in a detached VM with mocked modal, input, toast, and close-modal dependencies. It verifies modal markup and callback wiring, empty-field validation, successful feedback, close behavior, and the absence of database, network, storage, account, media, and navigation ownership. No real DOM, account, Reels playback, network, or database is used.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal construction | Render question, two options, and save callback | PASS |
| Missing question | Emit validation toast and keep modal open | PASS |
| Missing option | Emit validation toast and keep modal open | PASS |
| Complete poll | Emit success toast and close modal | PASS |
| Scope | Keep persistence and protected Reels ownership outside the helper | PASS |

## Safe boundary

The existing `src/features/reel-poll.js` module remains unchanged. This checkpoint adds only a deterministic contract and detached harness. Protected `renderReels`, swipe/navigation, poll persistence decisions, account state, and media behavior remain inline or otherwise unchanged.

## Validation

The standalone harness must pass with the repository contract suite, protected-inline parity, exhaustive Branch2 regression, and clean published-tip checks. This contract does not authorize a production extraction or any live browser action.

## References

1. [`reel-poll.js`](../src/features/reel-poll.js)
2. [`reels-seam-preparation-contract.md`](./reels-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
