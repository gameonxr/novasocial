# NovaSocial Realtime Subscription Lifecycle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the current realtime channel registration and cleanup surface while future modular work proceeds.

## Contract

The application currently registers 10 Supabase realtime channels across `index.html` and extracted modules. These cover chat messages, typing, incoming calls, call signals, call status, group-call signals, group-call participants, notifications, self-profile sync, and Notes. Each realtime channel remains subscribed through the existing `.subscribe()` chain. The separate browser PushManager subscription is not counted as a Supabase realtime channel.

The existing lifecycle uses explicit `db.removeChannel(...)` calls at account, chat, profile, notification, Notes, and call transitions. The current application surface contains 21 cleanup call occurrences. This contract records the lifecycle surface but does not claim a one-to-one cleanup ratio, redesign channel ownership, or alter the fragile Calls/WebRTC and DMs implementations.

## Harness coverage

`docs/realtime-subscription-lifecycle-contract-harness.js` scans only `index.html` and `src/**/*.js`. It verifies the 10 channel count, 10 managed channel slot assignments, 21 existing cleanup calls, expected channel-name families, and cleanup references for the managed slots. It does not connect to Supabase, create a realtime channel, authenticate, open a chat, start a call, or mutate application state.

| Check | Expected behavior | Result |
|---|---:|---|
| Supabase realtime channels | 10 `.channel(` registrations | PASS |
| Managed channel slots | 10 assignment surfaces remain | PASS |
| Subscription chains | 10 realtime channel registrations retain `.subscribe()` | PASS |
| Cleanup surface | 21 `removeChannel(` occurrences remain | PASS |
| Protected behavior | No production lifecycle or ownership changes | PASS |

## Safe boundary

No production logic is changed by this audit. The contract makes the current registration and cleanup surface observable so future extraction cannot silently duplicate channels or remove an existing teardown path.

## References

1. [`index.html`](../index.html)
2. [`src/features/notifications.js`](../src/features/notifications.js)
3. [`src/features/setup-self-profile-realtime-sync.js`](../src/features/setup-self-profile-realtime-sync.js)
4. [`src/features/setup-notes-realtime.js`](../src/features/setup-notes-realtime.js)
5. [`dms-realtime-contract.md`](./dms-realtime-contract.md)
6. [`calls-webrtc-contract.md`](./calls-webrtc-contract.md)

