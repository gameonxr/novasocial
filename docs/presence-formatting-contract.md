# NovaSocial Presence Formatting Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve shared online-status and last-seen formatting behavior used by profiles, posts, search, and chat surfaces.

## Contract

The shared `isOnline(ts)` helper returns false for missing timestamps and treats a timestamp as online only when its age is less than five minutes. The shared `lastSeenText(ts)` helper returns an empty string for missing timestamps, `Active now` for ages under one minute, and otherwise uses minute, hour, or day labels for ages under one hour, one day, or beyond one day respectively.

This contract records pure helper behavior only. It does not change timestamp sources, timezone handling, polling, profile queries, or any protected DM/presence UI.

## Harness coverage

`docs/presence-formatting-contract-harness.js` statically extracts the helper region from `src/core/utils.js` and verifies the exact threshold, null guards, bucket boundaries, labels, and shared definition locations. It does not query Supabase, access a browser clock, render a profile, or mutate presence state.

| Check | Expected behavior | Result |
|---|---:|---|
| Missing online timestamp | `false` | PASS |
| Online threshold | Less than 5 minutes | PASS |
| Missing last-seen timestamp | Empty string | PASS |
| Recent label | `Active now` under 60 seconds | PASS |
| Minute label | `Last seen Xm ago` under 1 hour | PASS |
| Hour label | `Last seen Xh ago` under 1 day | PASS |
| Day label | `Last seen Xd ago` beyond 1 day | PASS |

## Safe boundary

No production logic is changed by this audit. It locks the pure compatibility seam so modular extraction cannot silently alter presence labels or threshold behavior.

## References

1. [`src/core/utils.js`](../src/core/utils.js)
2. [`src/features/profile-view.js`](../src/features/profile-view.js)
3. [`src/features/posts.js`](../src/features/posts.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

