# Protected Calls, WebRTC, and group-call signaling lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers peer creation, signaling, media tracks, ICE/reconnect timers, group-call selection/setup, call-screen lifecycle, and teardown. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

RTCPeerConnection, signaling channels, ICE candidates, MediaStream tracks, permission prompts, reconnect timers, call-screen DOM, participant state, ringtone/audio, and teardown handlers.

Protected source markers used by the detached inventory harness:
- `RTCPeerConnection`
- `getUserMedia`

## Exact before/after parity boundary

Before/after must preserve peer state transitions, offer/answer/candidate ordering, track ownership, permission/error branches, reconnect timing, participant selection, call-screen visibility, ringtone, and complete teardown. No device, permission, or network behavior may be changed implicitly.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached mocks for peer/signaling/media/timers covering offer, answer, ICE, reconnect, denied permission, missing peer, remote hangup, local cancel, and teardown. Browser-safe proof is synthetic only and must never request camera/microphone or create a live peer.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin all peer/signaling owner hashes and the inline boundary; rollback restores the inline implementation and deletes only the external linkage/module. Re-run call lifecycle and protected accounting gates.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must name supported call types, participant limits, media permission behavior, signaling ownership, reconnect policy, teardown guarantees, and rollback authority.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
