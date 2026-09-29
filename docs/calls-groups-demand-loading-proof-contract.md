# Calls + Groups Demand-Loading Proof Contract

**Harness**: `calls-groups-demand-loading-proof-contract-harness.js`
**Feature area**: calls + groups feature families (`src/features/calls/`, `src/features/groups/`)
**Added**: 2026-09-29 (feature-based architecture migration — final lazy families)

## Contract

The calls and groups families are the last demand-loaded feature chunks. The
harness proves the complete demand-loading loop against the live repository:

1. **P1 Startup exclusion** — `index.html` contains zero lazy calls/groups
   script tags. The four documented eager service files stay tagged:
   `get-connection-quality.js` (synchronous helper used by the eager feed
   media optimizer `optimize-cloudinary-url.js` — cannot be stubbed because
   stubs are async), `init-calling-system.js` (incoming-call realtime
   subscription), `play-ringtone.js`, `stop-ringtone.js`.
2. **P2 Manifest linkage** — all 47 calls + 21 groups lazy files are listed
   exactly once in their manifest chunks, preserving the exact relative script
   order the families had in `index.html`.
3. **P3 On-demand load** — `loadFeature('calls'/'groups')` sequentially
   injects the chunk scripts in manifest order.
4. **P4 Second-visit cache** — repeat calls resolve with zero new injections.
5. **P5 Rapid double navigation** — concurrent calls share one promise and
   load exactly one chunk (no duplicate initialization).
6. **P6 Failed chunk** — a network failure rejects the promise; the pending
   entry is cleared; a retry reloads the chunk.
7. **P7 Stub entry** — `feature-stubs.js` provides the entry stubs:
   `initiateCall`, `handleIncomingCall`, `showCallFeature`, `showCallHistory`,
   `showCallBubble`, `initiateGroupCall`, `joinGroupCall`,
   `showGroupCallScreen`, `showGroupCallTypeMenu`, `endCall` (calls);
   `showGC`, `createGC`, `showGroupInfo` (groups). `showGroupInfo` is required
   because the dms chunk renders `onclick="showGroupInfo(cid)"` chat headers
   (cycle-7 preflight boundary analysis). `getConnectionQuality` is
   deliberately NOT stubbed — it is an eager synchronous service.
8. **P8 Content preservation** — all 72 family files (68 lazy + 4 services)
   are syntax-valid and the family owners (`createPeerConnection`, `showGC`,
   `getConnectionQuality`) remain intact.

## Entry paths

- 1:1 calls: profile call button, dms call button (dms chunk runtime) →
  `initiateCall` stub → calls chunk.
- Incoming calls: eager `init-calling-system.js` realtime subscription →
  `handleIncomingCall` stub → calls chunk (then accept/reject/banner internals
  are already loaded with the chunk).
- Group calls: groups UI / dms group-chat header → `showGroupCallTypeMenu` /
  `initiateGroupCall` stubs → calls chunk (the 11 group-call WebRTC files live
  in the calls chunk because the committed stub design routes them there).
- Groups UI: dms screen create-group / group chat header → `showGC` /
  `createGC` / `showGroupInfo` stubs → groups chunk.

## Boundary decisions (recorded)

- **Group-call files → calls chunk**: `feature-stubs.js` (committed in the
  loader-infrastructure cycle) routes `initiateGroupCall`, `joinGroupCall`,
  `showGroupCallScreen`, `showGroupCallTypeMenu` to `loadFeature('calls')`;
  the manifest membership must match the stub routing or the loader's
  missing-definition guard would fire. The 11 group-call WebRTC files
  (`initiate-group-call`, `join-group-call`, `leave-group-call`,
  `show-group-call-screen`, `show-group-call-type-menu`,
  `create-group-peer-connection`, `listen-for-group-signals`,
  `listen-for-group-participants`, `toggle-group-mute`, `toggle-group-video`,
  `update-participant-count`) therefore live in the calls chunk while their
  folder ownership stays `src/features/calls/` (chunk ≠ folder).
- **`get-connection-quality.js` eager**: `optimize-cloudinary-url.js`
  (eager, feed media path) calls `getConnectionQuality()` synchronously at
  line 8; the stub boundary is promise-based and cannot serve synchronous
  calls, so the file stays an eager service (dms `get-blocked-list` precedent).
- **Cross-chunk analysis**: zero references between calls-chunk and
  groups-chunk globals in either direction (verified by scanning all 70
  family globals against both chunks).
