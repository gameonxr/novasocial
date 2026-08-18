# NovaSocial Calls/WebRTC Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the fragile Calls/WebRTC peer, signaling, ICE, connection-recovery, and cleanup invariants as a standalone contract before any future refactor.

## Contract

`createPeerConnection(callId, remoteUserId)` constructs the peer with the existing ICE-server configuration, stores it in `_callState.peer`, clears the pending ICE queue, and attaches every track from `_callState.localStream`. It must preserve the audio/video distinction and keep the peer as the single call-state owner.

Local ICE candidates are signaled as `call_signals` rows and null ICE completion events are ignored. Incoming signaling from the current user is ignored. An incoming offer sets the remote description, flushes candidates that arrived early, creates and sets an answer, and signals that answer. An incoming answer is accepted only while the peer has a local offer pending, then the remote description is set and queued ICE is flushed.

Incoming ICE candidates are added immediately when a remote description exists. Before that description is available, candidates are appended to `window._pendingIceCandidates`. `_flushPendingIceCandidates()` copies and clears the queue before draining it in order; an individual candidate failure is logged/ignored without leaving the queue stuck. An incoming `end` signal ends the call without sending a second database end signal.

A remote track stores the remote stream, attaches it to the audio/video elements as appropriate, starts the call timer, and marks the call connected. A connected peer clears any reconnect timeout. A failed or disconnected peer enters reconnecting state and schedules one eight-second end-call timeout. A closed peer ends the call.

`endCall()` clears the call timer, optionally persists the end signal/status, closes the peer, stops every local media track, removes signaling and call-status channels, resets call state and pending candidates, clears reconnect/ring timeouts, hides the call UI, stops ringtone and network monitoring, and removes the call bubble. Cleanup must be safe when the call is already inactive.

## Harness coverage

`docs/calls-webrtc-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Peer creation | Attach all local tracks and initialize peer state | PASS |
| Local ICE | Signal candidates; ignore null completion | PASS |
| Early remote ICE | Queue until remote description exists | PASS |
| Incoming offer | Set remote, flush ICE, create/set/send answer | PASS |
| Incoming answer | Accept only with local offer pending; flush ICE | PASS |
| Own signals | Ignore own signaling rows | PASS |
| Remote track | Store stream, start timer, mark connected | PASS |
| Failed/disconnected state | Reconnecting status and one 8-second timeout | PASS |
| Connected state | Clear reconnect timeout | PASS |
| ICE failure | Drain queue despite individual candidate failure | PASS |
| End cleanup | Timer, peer, tracks, channels, state, UI, ringtone, monitor cleanup | PASS |

The harness is deterministic and uses mocked peer/state objects only. It does not invoke real WebRTC, media devices, Supabase, browser audio/video, authentication, or call operations.

## Safe boundary

The protected `createPeerConnection()`, signaling listeners, WebRTC caller/callee setup, and `endCall()` implementation remain inline and unchanged. No Calls/WebRTC production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Calls/WebRTC implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
