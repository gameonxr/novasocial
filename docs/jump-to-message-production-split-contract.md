
**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Owner:** `jumpToMessage(mid)`
**Status:** Production split complete; protected-DOM behavior remains unchanged.

## Contract

The prepared DOM-only `jumpToMessage(mid)` owner is now externalized to `src/features/jump-to-message-owner.js` as the anonymous classic global assignment `window.jumpToMessage = function(mid){...}`. The dynamic search-result caller remains unchanged, and the external owner is loaded after the inline application script and before the established post-inline owner tail.

The extracted owner locates an already-rendered message element by `data-msgid`, reports the existing `Message not loaded` toast when absent, and otherwise preserves the existing smooth centered scroll, temporary highlight, two-second cleanup, and search-modal removal. It does not fetch, render, mutate, delete, upload, navigate, access account state, or interact with message persistence/realtime systems.

## Parity and safety evidence

The immutable normalized origin owner hash remains `e06fcf2f2e397bb122255d982e07e35a1686641a22f6d46306f0072bd81eb073`. The production split harness reconstructs the canonical named owner from the anonymous external function body and verifies that hash, unchanged caller count, script placement, classic global assignment, detached target/missing branches, and absence of forbidden stateful side effects.

| Gate | Result |
|---|---|
| Exact normalized origin owner parity | PASS |
| Caller preservation | PASS — one dynamic search-result caller |
| Classic global exposure | PASS — anonymous `window.jumpToMessage` assignment |
| Target branch | PASS — smooth centered scroll, highlight, cleanup, modal removal |
| Missing branch | PASS — existing toast and no DOM mutation |
| Stateful-boundary audit | PASS — no DB, network, storage, account, upload, permission, or message mutation |
| Rollback | PASS — revert the split commit and remove only the external script reference |

## Protected boundary

The split does not move or modify `renderDMs`, `_refreshDmsInPlace`, `_silentBackgroundRefresh`, `openChat`, `loadMsgs`, `doSearchMessages`, message pagination/rendering, swipe state, `showMsgMenu`, reactions, pin, unsend, report, delete, forwarding, cache, scroll ownership, navigation-race handling, or any account/media/call/moderation system. It changes only the already-prepared DOM helper owner and its script linkage.

## Validation

`docs/jump-to-message-production-split-contract-harness.js` is detached and synthetic-only. It does not authenticate, open a live application, navigate, access a real account, call Supabase, mutate a database, upload media, or request permissions. The full Branch2 regression gate remains required after publication.

## References

1. [`jump-to-message-owner.js`](../src/features/jump-to-message-owner.js)
2. [`jump-to-message-preparation-contract.md`](./jump-to-message-preparation-contract.md)
3. [`jump-to-message-parity-rollback-evidence.txt`](./jump-to-message-parity-rollback-evidence.txt)
4. [`index.html`](../index.html)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
