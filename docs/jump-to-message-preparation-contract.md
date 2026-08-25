# `jumpToMessage(mid)` Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-25
**Candidate:** `jumpToMessage(mid)`  
**Status:** Preparation closed; production split complete under the companion production-split contract.

## Candidate boundary

`jumpToMessage(mid)` locates the already-rendered message element with the matching `data-msgid`, reports the existing `Message not loaded` toast when the element is absent, and otherwise performs the existing smooth centered scroll, temporary highlight, two-second highlight cleanup, and search-modal removal. It does not fetch, render, mutate, or delete message data.

The immutable normalized owner hash from `origin/main` is `e06fcf2f2e397bb122255d982e07e35a1686641a22f6d46306f0072bd81eb073`. The owner is now the anonymous classic global in `src/features/jump-to-message-owner.js`; the inline owner is absent from `index.html`. The only production caller remains the dynamically generated search-result `onclick="jumpToMessage(...)"` control inside `doSearchMessages()`.

## Preparation gates

| Gate | Status |
|---|---|
| Exact normalized origin parity | PASS |
| Caller boundary | PASS — one dynamic search-result caller |
| DOM-only behavior | PASS — lookup, scroll, highlight, timeout cleanup, modal removal, missing-element toast |
| Stateful-boundary audit | PASS — no database, network, browser-storage, account, upload, permission, navigation, or message mutation tokens |
| Protected-DOM coupling | REVIEW — operates on already-rendered in-chat message DOM |
| Detached synthetic proof | PASS — target and missing-message branches |
| Production split | Complete — external classic global owner |
| Rollback evidence | Published in the production-split contract and rollback record |

## Explicit exclusions

This preparation and its production split do not alter `renderDMs()`, `_refreshDmsInPlace()`, `_silentBackgroundRefresh()`, `openChat()`, `doSearchMessages()`, message pagination, message rendering, swipe state, `showMsgMenu()`, reaction/pin/unsend/report/delete actions, the authorized `forwardMessage` behavior, cache, scroll ownership, or navigation-race handling. It also does not change crop drag/zoom, crop lifecycle, uploads, accounts, storage, calls, moderation, or any protected high-risk owner.

The candidate was abandoned only if the owner seam required moving or modifying the protected in-chat renderer, search query/render path, or action-menu surface; that condition did not occur. The completed split uses an anonymous classic `window.jumpToMessage` assignment, preserves the dynamic caller unchanged, and has detached before/after proof plus a reversible rollback record.

## Evidence

The detached synthetic proof is recorded in [`jump-to-message-preparation-browser-proof-evidence.txt`](jump-to-message-preparation-browser-proof-evidence.txt). The preparation harness is [`jump-to-message-preparation-contract-harness.js`](jump-to-message-preparation-contract-harness.js). The production-split proof is [`jump-to-message-production-split-contract-harness.js`](jump-to-message-production-split-contract-harness.js), and the parity/rollback record is [`jump-to-message-parity-rollback-evidence.txt`](jump-to-message-parity-rollback-evidence.txt).
