# NovaSocial Post Insights Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted data-backed Post Insights dashboard without executing database access.

## Contract

`showEnhancedInsights(pid)` creates a `📊 Post Insights` modal, renders a loading state, and concurrently queries the target post with its username and the related `post_views` timestamps.

A missing post produces the existing not-found state. For a present post, the renderer creates 24 random hourly view values, computes the maximum, and renders the media/profile header, Likes/Comments/Views stats, 24-hour mini chart, engagement-rate calculation and copy, and four top-reaction fixtures: Heart, Fire, Love, and Clap.

The harness is static and documentation-only. It does not open the Insights modal, query the database, inspect media, or calculate metrics live.

## Harness coverage

`docs/insights-contract-harness.js` validates modal/loading state, concurrent post/view queries, not-found handling, 24-point chart generation, stats, engagement formula and thresholds, reaction fixtures, and presentation scope.

## References

1. [`insights.js`](../src/features/insights.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

