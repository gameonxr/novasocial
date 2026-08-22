# NovaSocial Calls/WebRTC Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected Calls/WebRTC system.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Call state | Inline `_callState` and `_groupCallState` | Explicit state adapter; no duplicate owner |
| Signaling | Inline `db`, `call_signals`, Supabase channel callbacks | Signaling interface preserving own-signal filtering and event order |
| Peer/media | Inline `RTCPeerConnection`, `navigator.mediaDevices`, local/remote streams | Browser API adapter with track and peer cleanup proof |
| ICE | Inline `window._pendingIceCandidates` and `_flushPendingIceCandidates()` | Queue adapter preserving snapshot-clear-drain order |
| DOM/UI | Inline call bubble, audio/video elements, toast/navigation/ringtone helpers | DOM facade with unchanged IDs and UI transitions |
| Timers | Inline call timer and eight-second reconnect end timeout | Timer seam preserving timeout ownership and cleanup |
| Cleanup | Inline `endCall()` | Reversible teardown adapter covering peer, tracks, channels, timers, UI, ringtone, and monitor |

## Gate status

This is a **mapping-only checkpoint**. Calls/WebRTC remains inline. Four non-destructive browser-context mock artifacts now cover mocked WebRTC setup and the missing-video, successful, and failed Picture-in-Picture branches. They prove reversible mock behavior only and are not permission to extract production code. Voice permission and recording artifacts remain covered by their separate seam contracts. Before a split, the project still needs an explicit adapter seam, a protected before/after marker proof, and a reversible browser smoke proof for the production boundary with real call behavior left unchanged.

The first implementation step must be test-only or adapter-only and must preserve the current `createPeerConnection()` and `endCall()` owners until the complete seam harness passes.

## Harness coverage

`docs/calls-webrtc-seam-preparation-contract-harness.js` scans `index.html` and confirms the dependency/global/DOM/timing markers, existing Calls/WebRTC contract and harness, the four passing non-destructive browser mock artifacts, protected inline signatures, and zero protected signature matches in `src/`. It does not open WebRTC, access media devices, call Supabase, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| State owner | `_callState` and `_groupCallState` remain inline | PASS |
| Signaling owner | `call_signals` and Supabase channel markers remain inline | PASS |
| Peer/media owner | `RTCPeerConnection` and media stream markers remain inline | PASS |
| ICE queue | Pending-candidate markers remain inline | PASS |
| Timing | 8-second reconnect timeout marker remains | PASS |
| Teardown | `endCall()` cleanup remains protected | PASS |
| Browser mock inventory | Mocked setup and three PiP branch artifacts are present with PASS markers | PASS |
| Production split | None | PASS |

## References

1. [`calls-webrtc-contract.md`](./calls-webrtc-contract.md)
2. [`calls-webrtc-contract-harness.js`](./calls-webrtc-contract-harness.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`index.html`](../index.html)
5. [`calls-webrtc-mocked-setup-browser-proof-evidence.txt`](./calls-webrtc-mocked-setup-browser-proof-evidence.txt)
6. [`calls-pip-missing-video-browser-proof-evidence.txt`](./calls-pip-missing-video-browser-proof-evidence.txt)
7. [`calls-pip-success-browser-proof-evidence.txt`](./calls-pip-success-browser-proof-evidence.txt)
8. [`calls-pip-failure-browser-proof-evidence.txt`](./calls-pip-failure-browser-proof-evidence.txt)
9. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

