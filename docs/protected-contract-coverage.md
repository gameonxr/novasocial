# NovaSocial Protected Contract Coverage Inventory

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
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

The 19 protected declarations are intentionally mapped to 11 focused contract families because several declarations share one protected subsystem boundary. Every mapping has both a Markdown contract and a standalone `*-harness.js` file in `docs/`.

## Harness coverage

`docs/protected-contract-coverage-harness.js` statically checks that all 19 protected declaration markers remain in `index.html`, that each mapped contract and harness file exists, and that the required trailing script order remains `smart-ranking.js`, `nova-init.js`, then `like-effects.js`.

The harness is documentation-only. It does not extract, rewrite, execute, or mutate any protected production system.

## Safe boundary

All 19 protected implementations remain inline and unchanged. No DMs, Reels, Calls/WebRTC, Stories, polls, Notes, push, recording, particle, authentication, or account production code was moved or modified in this checkpoint.

## Validation

The standalone coverage harness passed with `PROTECTED_SEAMS=19`. The complete repository validation chain must pass before this inventory and harness are published to `docs/`.

## References

1. [`index.html` protected inline implementations](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
