# NovaSocial Voice Recording Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected DM voice-recording system.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Recorder state | Inline `toggleRecording(cid)`, `mediaRecorder`, `audioChunks`, and `recording` | Adapter preserving permission guard, start/stop transitions, button state, and feedback |
| Capture lifecycle | Inline `navigator.mediaDevices.getUserMedia()` and `MediaRecorder` callbacks | Capture seam preserving chunk collection, `audio/webm` assembly, minimum-size rejection, and stream-track teardown |
| Upload/message insert | Inline chat media upload and audio-message insert | Adapter preserving upload order, `.throwOnError()`, recipient-blocked feedback, generic failure feedback, and no forced full reload |
| Realtime delivery | Existing conversation realtime path after insertion | Boundary preserving delivery ownership; recording must not duplicate a full conversation refresh |
| Audio cleanup state | Separate `_segmentAudio` Notes-audio state and active Note audio cleanup | Keep this state distinct from DM recorder state; no cross-feature ownership is inferred or moved |
| Error paths | Inline permission, short-recording, upload, insert, and blocked-recipient handling | Failure seam preserving idle state and stopping every microphone track |

## Gate status

This is a **mapping-only checkpoint**. The protected `toggleRecording()` implementation, MediaRecorder callbacks, upload/message insert path, realtime delivery, and `_segmentAudio` Notes-audio state remain inline and unchanged. The existing Voice Recording contract and harness prove behavior, but they are not permission to extract production code. Before a split, the project still needs an explicit adapter seam, protected before/after marker parity, and reversible browser proof covering permission denial, start/stop, short recordings, successful upload, blocked recipients, generic failures, and track cleanup.

The first implementation step must be test-only or adapter-only and must preserve the inline `toggleRecording()` owner until the complete seam harness passes. No WebSocket upload owner was inferred from the current DM recorder implementation; any future socket-based transport must be documented separately rather than introduced speculatively.

## Harness coverage

`docs/voice-recording-seam-preparation-contract-harness.js` scans `index.html` and `src/` to confirm the recorder state, MediaRecorder, permission, upload, insert, cleanup, realtime, and `_segmentAudio` markers, the existing Voice Recording behavior contract/harness, and zero `toggleRecording()` production splits. It does not access a microphone, construct a MediaRecorder, upload media, insert messages, or mutate account data.

| Check | Expected behavior | Result |
|---|---:|---|
| Recorder owner | `toggleRecording()` remains inline | PASS |
| Capture state | MediaRecorder/chunk/permission markers remain protected | PASS |
| Upload path | Audio upload and `.throwOnError()` boundary remain protected | PASS |
| Cleanup/errors | Minimum-size, track-stop, and failure paths remain documented | PASS |
| Cross-feature state | `_segmentAudio` remains separate from DM recorder state | PASS |
| Production split | None | PASS |

## References

1. [`voice-recording-contract.md`](./voice-recording-contract.md)
2. [`voice-recording-contract-harness.js`](./voice-recording-contract-harness.js)
3. [`visibility-audio-lifecycle-contract.md`](./visibility-audio-lifecycle-contract.md)
4. [`index.html`](../index.html)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

