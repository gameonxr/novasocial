# NovaSocial Call Network Monitor Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected inline call network-monitor lifecycle and quality-indicator invariants before any future refactor.

## Contract

`startNetworkMonitor()` clears any existing interval and starts a three-second sampling interval. Each sample is a no-op unless an active call has a peer connection. For an active peer, it aggregates inbound RTP packets, calculates packet-loss rate, and updates the `#nova-call-network-indicator` label and color: below 2% is **Excellent**/green, below 8% is **Good**/yellow, and 8% or higher is **Poor**/pink-red. Stats failures are swallowed so the call loop remains resilient.

`stopNetworkMonitor()` clears the active interval and resets the stored interval handle to `null`.

## Harness coverage

`docs/network-monitor-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Start | Existing interval is cleared and a 3-second interval starts | PASS |
| Inactive call | Stats are not requested and indicator is unchanged | PASS |
| Excellent quality | Below 2% loss renders green Excellent | PASS |
| Good quality | 2%–under 8% loss renders yellow Good | PASS |
| Poor quality | 8% or higher loss renders pink-red Poor | PASS |
| Stats failure | Error is swallowed | PASS |
| Stop | Interval is cleared and handle resets to null | PASS |

The harness uses mocked window, timer, call-state, peer stats, and indicator boundaries only. It does not invoke real authentication, WebRTC, media, calls, or account actions.

## Safe boundary

The protected network-monitor and WebRTC call implementation remains inline and unchanged. No production call, media, or network-monitor code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` network-monitor implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
