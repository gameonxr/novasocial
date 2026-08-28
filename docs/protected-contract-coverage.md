# NovaSocial Protected Contract Coverage Inventory

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-22
**Purpose:** Prove that every remaining protected inline declaration has a matching contract document and standalone mocked harness before any future migration decision.

## Coverage map

| Protected inline system | Contract and harness | Coverage status |
|---|---|---|
| Push permission banner and silent resubscribe | `push-permission-contract` | PASS |
| Story element rendering | `story-editor-contract` | PASS |
| Story viewer | `story-viewer-contract` | PASS |
| Reels persistent renderer | `reels-persistent-contract` | PASS |
| DMs realtime renderer | `dms-realtime-contract` | PASS |
| Story poll voting/results/state | `story-poll-contract` | PASS |
| Voice recording | `voice-recording-contract` | PASS |
| Push settings enable/reset | `push-permission-contract` | PASS |
| Like particles | `spawn-like-particles-contract` | PASS |
| WebRTC peer connection | `calls-webrtc-contract` | PASS |
| Notes submission/deletion/reactions/reactors | `note-viewer-contract` | PASS |

The 19 protected declarations are intentionally mapped to 11 focused contract families because several declarations share one protected subsystem boundary. Every mapping has both a Markdown contract and a standalone `*-harness.js` file in `docs/`. The DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story rendering, and the read-only Notes reactor-list owner plus the contained Reels windowing helper comprise the ten externalized window-assigned production owners; the other 9 protected declarations remain inline and gated.

## Harness coverage

`docs/protected-contract-coverage-harness.js` statically checks that the 9 unapproved protected declaration markers remain in `index.html`, that the externalized DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story rendering, read-only Notes reactor-list owner, and contained Reels windowing helper are represented by window-assigned modules, that each mapped contract and harness file exists, and that the required trailing script order remains intact.

The harness is documentation-only. It does not extract, rewrite, execute, or mutate any protected production system.

## Safe boundary

The 9 unapproved protected implementations remain inline and unchanged. The DMs renderer, particle, deletion-fallback, Push settings, Note viewer, Note deletion, Story rendering, read-only Notes reactor-list owner, and contained Reels windowing helper have moved under their approved window-assigned contracts. The broader DMs/chat/realtime owners, main Reels renderer, Calls/WebRTC, Notes submission/reaction, recording, authentication, and account production code remain protected.

## Validation

The standalone coverage harness passed with `PROTECTED_SEAMS=19` and ten externalized window owners, leaving 9 protected systems gated from direct extraction. The complete repository validation chain passed on the published Branch2 tip.

## References

1. [`index.html` protected inline implementations](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
