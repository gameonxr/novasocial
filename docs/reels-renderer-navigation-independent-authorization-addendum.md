# Reels Renderer and Navigation — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline:** `15cbec0d69774ed2b35b8d0d808871204f225195`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants **explicit scoped authorization to complete detached independent proof for the bounded Reels renderer/navigation candidate**. It does not authorize production extraction, script relocation, script-order changes, or any live browser action.

| Gate | Decision |
|---|---|
| Candidate | Inline `async function renderReels()` only, `index.html:4321–4682` |
| Exact origin parity | `PASS`; normalized owner hash `db1f15428a4452e72b4a5223a5050151cb5deea0092b3a858afbd012b09653ca` |
| Detached synthetic proof | `PASS`; independent harness covers restore, empty, and query-failure branches |
| Browser-safe live actions | `0`; no login, live navigation, media device, permission, upload, or mutation |
| Rollback artifact | `PINNED`; see `reels-renderer-navigation-independent-proof-rollback-evidence.txt` |
| Production extraction | `NOT AUTHORIZED` |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Expanded independent gate authorization

The following gates are explicitly authorized and independently passed in the detached harness. The before/after comparison is between the immutable-origin owner and the current Branch2 owner; no source relocation is involved.

| Gate | Evidence result |
|---|---|
| Swipe | PASS: fast forward, cancelled short swipe, last-item edge, and backward swipe |
| Playback | PASS: initial delayed play, active-video reset/play, pause-all transition, and progress update |
| Navigation stack | PASS: `renderReels()` leaves `navStack` unchanged and does not call browser history |
| Overlay wiring | PASS: double-tap, like, comments, share, create-reel, and profile bindings match |
| Timing | PASS: synthetic 100ms first-play, 240ms transition, 290ms settle cleanup, and progress timing |
| Cleanup | PASS: settled transition cleared, no timers remain, and no forbidden operation occurs |
| Rollback-after-split simulation | PASS: linkage-only synthetic split restores byte-identical baseline HTML and owner hash |
| Non-production extraction candidate | PASS: one external linkage, inline owner removal, classic global owner, script order, and candidate lifecycle parity |

The temporary candidate is pinned by module SHA-256 `3b7985ad1d8163a186a757cdd65ca8db80f4fdb3a9054abfabbef8e5a0955a24` and after-HTML SHA-256 `16388e916adbcedbbadf0477b290e2b937fbceda1430cd4160639b8b02e62d5f`. It was generated and tested only under `/tmp`; the Branch2 production tree still has no Reels external linkage.

## Exact candidate and allowed proof surface

The authorized candidate is the current inline `renderReels()` owner from the persistent-container guard through its restore path. The proof may inspect and execute this unchanged body in a detached VM using synthetic `document`, `window`, read-only database, video, timer, and windowing-helper mocks. It may record DOM attachment, read-query, error-boundary, synthetic playback, and windowing-handoff traces.

The exact proof scenarios are: an existing persistent container with a current synthetic video; an empty read result that produces the existing empty state; and a read-query failure that produces the existing error state. The owner is compared byte-for-byte after line-ending normalization to the immutable `origin/main` extraction.

## Dependencies and invariants

The boundary depends on `document.getElementById`, `document.querySelectorAll`, `document.createElement`, `window._savedReelIndex`, `db.from(...).select(...).eq(...).order(...).limit(...)`, `ME.id`, `currentReelIdx`, `reelsMuted`, `_renderGeneration`, `_applyReelsVideoWindowing`, `requestAnimationFrame`, `setTimeout`, synthetic video `play/pause`, and the existing classic-script global environment. No dependency may be replaced by a new abstraction in this proof.

The following invariants are mandatory: item ordering and active index remain unchanged; swipe thresholds remain `0.22` drag ratio or `0.35` pixels per millisecond; the `240ms` transition and `290ms` settle cleanup remain unchanged; persistent-container restore remains non-rebuilding; the generation guard remains intact; video windowing and pause/resume calls remain in their existing order; and the error/empty branches remain behaviorally identical.

## Explicit exclusions

This authorization excludes extraction or modification of the main renderer, swipe/touch lifecycle, keyboard navigation, media playback policy, `IntersectionObserver` or visibility behavior, navigation stack transitions, comments/likes/share overlays, Notes coupling, creation/upload flows, database writes, realtime broadcasts, storage, account state, permissions, WebRTC, live media, live navigation, schema, and protected accounting. A proof result is not authorization to split any excluded surface.

## Required production re-review

A future production request must obtain a new authorization against this exact boundary and must add actual before/after candidate parity, detached/browser-safe success and denial/error/cleanup coverage for every selected branch, a rollback-after-split run, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
