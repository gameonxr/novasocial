# NovaSocial Network Diagnostics Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected connection-quality and call network-monitor invariants as a standalone contract before any future refactor.

## Contract

`getConnectionQuality()` reads the supported `navigator.connection` vendor variants. Unsupported browsers or missing `effectiveType` default to `good`. `slow-2g` and `2g` map to `low`, `3g` maps to `eco`, and `4g` or unknown effective types map to `good`. The default is intentionally conservative: unsupported browser APIs must not be assumed slow.

`startNetworkMonitor()` replaces an existing three-second interval before scheduling a new one. Each tick is a no-op when there is no active peer or call. For active calls it aggregates `inbound-rtp` packet loss only, computes `packetsLost / (packetsLost + packetsReceived)`, and updates the call indicator as Excellent/green below 2%, Good/amber from 2% to below 8%, or Poor/red at 8% and above. With no received packets, the loss rate defaults to zero.

`stopNetworkMonitor()` clears an active monitor interval and sets its handle to null. Calling it without an active interval is idempotent.

## Harness coverage

`docs/network-diagnostics-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Unsupported connection API | Default to `good` | PASS |
| slow-2g / 2g | Map to `low` | PASS |
| 3g | Map to `eco` | PASS |
| 4g / unknown | Map to `good` | PASS |
| Packet loss below 2% | Excellent / green | PASS |
| Packet loss 2%–<8% | Good / amber | PASS |
| Packet loss ≥8% | Poor / red | PASS |
| No received packets | Zero-loss Excellent default | PASS |
| Inactive/missing peer | Monitor tick no-op | PASS |
| Active peer | Aggregate inbound RTP and update indicator | PASS |
| Stop with active interval | Clear and null handle | PASS |
| Stop without interval | Idempotent no-op | PASS |

The harness is deterministic and uses mocked connection, peer, stats, and interval objects only. It does not invoke real browser networking, WebRTC, DOM, audio/video, or call operations.

## Safe boundary

The protected `getConnectionQuality()`, `startNetworkMonitor()`, and `stopNetworkMonitor()` implementations remain inline and unchanged. No call, media, network, or delivery-URL production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` network diagnostics](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
