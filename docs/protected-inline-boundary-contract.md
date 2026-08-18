# NovaSocial Protected Inline Boundary Inventory

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the final protected inline boundaries that must remain in `index.html` because they depend on fragile lexical state, DOM ownership, realtime lifecycle, browser APIs, or tightly coupled production handlers.

## Protected boundaries

The following systems remain inline and are not safe candidates for direct extraction in the current migration:

| Protected system | Boundary preserved | Reason for inline retention |
|---|---|---|
| Push permission helpers | `maybeShowPushPermissionBanner`, `silentPushResubscribeIfGranted` | Browser permission and subscription timing |
| Story rendering/viewing | `renderStoryElements`, `openSV` | Viewer/editor state, media lifecycle, and inline handlers |
| Reels | `renderReels` | Persistent container, video state, transforms, and cache ownership |
| Direct messages | `renderDMs` | Shared screen ownership, realtime state, and non-destructive refresh |
| Story polls | `voteStoryPoll`, `refreshPollResults`, `loadStoryPollState` | Viewer/editor state and realtime poll updates |
| Voice recording | `toggleRecording` | MediaRecorder and active-chat DOM lifecycle |
| Push settings | `enablePushFromSettings`, `resetPushFromSettings` | Subscription state and permission transitions |
| Like particles | `spawnLikeParticles` | Direct visual effect and DOM/timer lifecycle |
| Calls/WebRTC | `createPeerConnection` | Peer connection, ICE, media, and call-state ownership |
| Notes | `submitNote`, `deleteMyNote`, `reactToNote`, `loadNoteReactorsList`, `submitNativeEmojiReaction` | Inline note state, realtime updates, and action handlers |

These are documented boundaries, not extraction targets. The production functions remain in `index.html` unchanged.

## Safeguards

The boundary harness checks that all 19 protected declaration markers remain present, that the trailing scripts retain the required order—`smart-ranking.js`, then `nova-init.js`, then `like-effects.js`—and that the published contract documentation set remains present. The harness does not execute real authentication, Supabase, WebRTC, media, push, stories, reels, DMs, notes, or account actions.

## Harness coverage

`docs/protected-inline-boundary-contract-harness.js` validates the following behavior:

| Check | Result |
|---|---|
| Protected declaration markers present | PASS |
| Required trailing script tags present | PASS |
| Trailing script order preserved | PASS |
| Published contract documentation set present | PASS |
| Production code unchanged by this checkpoint | PASS |

## Safe boundary

This checkpoint adds documentation and a static harness only. It does not extract, rewrite, reorder, rename, or otherwise modify any protected production function.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` protected inline systems](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
