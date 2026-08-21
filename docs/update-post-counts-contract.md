# NovaSocial Update Post Counts Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted post-count DOM updater.

## Contract

`updatePostCounts(pid, likesCount, commentsCount)` updates the like button dataset when `#lbtn-${pid}` exists, updates the primary like count text and visibility when `#lcnt-${pid}` exists, and updates the alternate like text when `#lcnt-${pid}-txt` exists.

It updates the primary comment count text and visibility when `#ccnt-${pid}` exists and updates the alternate comment text when `#ccnt-${pid}-txt` exists. Like and comment values are formatted through `fmt`; primary count visibility is shown only when the corresponding count is greater than zero.

The helper owns post-count presentation only. Like/comment persistence, server reconciliation, post rendering, and network behavior remain outside this module. The harness is static and does not mutate a browser DOM or post data.

## Harness coverage

`docs/update-post-counts-contract-harness.js` validates per-element guards, like dataset/text/visibility updates, comment text/visibility updates, alternate count targets, formatting, and non-ownership of network behavior.

## References

1. [`update-post-counts.js`](../src/features/update-post-counts.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

