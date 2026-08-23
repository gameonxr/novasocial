# `jumpToMessage(mid)` Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Candidate:** `jumpToMessage(mid)`  
**Status:** Preparation only; no production split has been made.

## Candidate boundary

`jumpToMessage(mid)` locates the already-rendered message element with the matching `data-msgid`, reports the existing `Message not loaded` toast when the element is absent, and otherwise performs the existing smooth centered scroll, temporary highlight, two-second highlight cleanup, and search-modal removal. It does not fetch, render, mutate, or delete message data.

The immutable normalized owner hash from `origin/main` is `e06fcf2f2e397bb122255d982e07e35a1686641a22f6d46306f0072bd81eb073`. The owner remains inline in `index.html`; no `src/features/jump-to-message-owner.js` exists. The only production caller is the dynamically generated search-result `onclick="jumpToMessage(...)"` control inside `doSearchMessages()`.

## Preparation gates

| Gate | Status |
|---|---|
| Exact normalized origin parity | PASS |
| Caller boundary | PASS — one dynamic search-result caller |
| DOM-only behavior | PASS — lookup, scroll, highlight, timeout cleanup, modal removal, missing-element toast |
| Stateful-boundary audit | PASS — no database, network, browser-storage, account, upload, permission, navigation, or message mutation tokens |
| Protected-DOM coupling | REVIEW — operates on already-rendered in-chat message DOM |
| Detached synthetic proof | PASS — target and missing-message branches |
| Production split | Not started |
| Rollback evidence | Required before any production split |

## Explicit exclusions

This preparation does not alter `renderDMs()`, `_refreshDmsInPlace()`, `_silentBackgroundRefresh()`, `openChat()`, `doSearchMessages()`, message pagination, message rendering, swipe state, `showMsgMenu()`, reaction/pin/unsend/report/delete actions, the unresolved `forwardMessage` seam, cache, scroll ownership, or navigation-race handling. It also does not change crop drag/zoom, crop lifecycle, uploads, accounts, storage, calls, moderation, or any protected high-risk owner.

The candidate must be abandoned if an owner seam requires moving or modifying the protected in-chat renderer, the search query/render path, or the action-menu surface. Any future production split must use an anonymous classic `window.jumpToMessage` assignment, preserve the dynamic caller unchanged, and include detached before/after proof plus a reversible rollback record.

## Evidence

The detached synthetic proof is recorded in [`jump-to-message-preparation-browser-proof-evidence.txt`](jump-to-message-preparation-browser-proof-evidence.txt). The preparation harness is [`jump-to-message-preparation-contract-harness.js`](jump-to-message-preparation-contract-harness.js), and the parity/rollback record is [`jump-to-message-parity-rollback-evidence.txt`](jump-to-message-parity-rollback-evidence.txt).
