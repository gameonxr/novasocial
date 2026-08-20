# NovaSocial Interval Lifecycle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve timer ownership, teardown, and the existing repeating-effect boundaries during future modularization.

## Contract

The application surface currently contains seven `setInterval()` registrations and ten `clearInterval()` calls. Six repeating systems retain explicit handles: emergency-lock polling, ban recheck, Story-view progress, network monitoring, call-duration timing, and live-stream updates. The Nova Universe dynamic background retains its existing repeating interval without introducing a new shared handle.

This audit records the current lifecycle surface only. It does not claim that cleanup counts must be one-to-one with creation counts, and it does not change timing values, callback behavior, or ownership. The Story viewer, Calls/WebRTC, network monitor, and live-stream intervals remain protected by their existing inline/module boundaries.

## Harness coverage

`docs/interval-lifecycle-contract-harness.js` scans `index.html` and `src/**/*.js` statically. It asserts the current interval/cleanup counts, verifies each managed handle has creation and cleanup references, and confirms the Nova Universe interval remains present. It does not start a timer, wait for callbacks, access the DOM, authenticate, call Supabase, or mutate state.

| Check | Expected behavior | Result |
|---|---:|---|
| Interval registrations | 7 `setInterval()` occurrences | PASS |
| Cleanup calls | 10 `clearInterval()` occurrences | PASS |
| Managed timer handles | 6 named handle surfaces | PASS |
| Nova Universe effect | Existing repeating interval remains present | PASS |
| Runtime behavior | No timer is started or stopped by the harness | PASS |

## Safe boundary

No production logic is changed by this audit. It records timer ownership and cleanup surfaces so later extraction cannot silently duplicate polling, lose teardown, or alter protected timing behavior.

## References

1. [`index.html`](../index.html)
2. [`src/features/live-stream.js`](../src/features/live-stream.js)
3. [`network-monitor-contract.md`](./network-monitor-contract.md)
4. [`reels-persistent-contract.md`](./reels-persistent-contract.md)
5. [`calls-webrtc-contract.md`](./calls-webrtc-contract.md)

