# NovaSocial New Posts Indicator Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted non-destructive new-posts indicator.

## Contract

`showNewPostsIndicator()` returns when `#new-posts-pill` already exists or when `#screen` is absent. Otherwise it creates the pill, assigns the `↑ New posts` label and visual styling, appends it to the body, and schedules removal after 8,000 ms.

A tap removes the pill, invalidates the Home tab cache, and delegates navigation to `go('home')`. The helper owns indicator UI and refresh delegation only; feed querying, post persistence, and navigation execution remain outside this module.

## Harness coverage

`docs/new-posts-indicator-contract-harness.js` validates duplicate suppression, screen guard, pill creation/label, body attachment, tap delegation, and timed cleanup.

The harness is deterministic and static. It does not render DOM, invalidate caches, navigate, or query posts.

## Safe boundary

The extracted `src/features/new-posts-indicator.js` module remains unchanged in this checkpoint. Protected feed and post systems remain untouched.

## References

1. [`new-posts-indicator.js`](../src/features/new-posts-indicator.js)
2. [`new-posts-contract.md`](./new-posts-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

