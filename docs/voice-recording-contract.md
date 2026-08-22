# NovaSocial Voice Recording Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected DM voice-message recording and upload invariants as a standalone contract before any future refactor.

## Contract

`toggleRecording(cid)` first requires the microphone button and microphone permission. A successful start creates a `MediaRecorder`, clears the audio chunk buffer, changes the button to recording state, and shows recording feedback. The stop toggle restores the idle button and recording state.

When recording stops, the audio chunks are combined as `audio/webm`. Blobs smaller than 500 bytes are rejected as too short, the stream tracks are stopped, and no upload is attempted. Larger recordings show sending feedback, upload through the existing chat media boundary, and insert an audio message using `.throwOnError()`. Realtime delivery remains responsible for updating the conversation; the voice path does not force a full message reload.

Upload or message-insert failures still stop every microphone track. A `MESSAGING_BLOCKED` error shows recipient-specific feedback, while other errors show the generic voice-message failure toast. Permission failures show microphone-denied feedback and leave the recorder inactive.

## Harness coverage

`docs/voice-recording-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Microphone denial | Remain idle and show permission feedback | PASS |
| Recording start/stop | Toggle recorder and button state | PASS |
| Short recording | Reject under 500 bytes; skip upload; stop stream | PASS |
| Successful recording | Upload chat media and insert audio message with `throwOnError` | PASS |
| Blocked recipient | Show messaging-blocked feedback and stop stream | PASS |
| Generic upload/insert failure | Show failure feedback and stop stream | PASS |
| Cleanup | Restore idle state and stop tracks | PASS |
| Injected seam dispatch | Recorder flow dispatches explicitly and preserves success, blocked, and cleanup outcomes | PASS |

The harness is deterministic and uses mocked recorder, blob, upload, database, button, and stream events only. It does not invoke real microphone, MediaRecorder, DOM, Supabase, authentication, or message actions. Its injected seam dispatcher is test-only and is not loaded by `index.html`; the protected `toggleRecording()` owner remains inline.

## Safe boundary

The protected `toggleRecording()` implementation and DM voice-message path remain inline and unchanged. No voice, media, message, or authentication production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` voice recording implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
