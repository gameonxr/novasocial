# NovaSocial Trending Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Trending and hashtag-indexing feature without executing database operations.

## Contract

`_extractAndStoreHashtags(postId, caption)` returns for missing inputs or no hashtag matches, extracts `#[\w]+` tags, deduplicates repeated tags within the caption, and processes each unique tag through the atomic `increment_hashtag_count` RPC. When the RPC returns an ID, it inserts the post-to-hashtag link; RPC or link failures are contained and do not escape.

`showTrendingPage()` queries up to 20 hashtag rows ordered by descending `posts_count`, maps them to tag/count pairs, and falls back to eight default trends when the query has no usable data or fails. It renders ranked trend cards and delegates selection to `searchHashtag(tag)`, with a top-three highlight.

`searchHashtag(tag)` navigates to Explore, waits 300 milliseconds, fills `#sq` when present, and delegates to `doSearch(tag)`. The harness is static and documentation-only. It does not update hashtag counts, query the database, navigate, or run a search.

## Harness coverage

`docs/trending-contract-harness.js` validates hashtag extraction, deduplication, atomic RPC and linking behavior, failure containment, top-tag query and fallback fixtures, ranked rendering, top-three styling, and Explore search routing.

## References

1. [`trending.js`](../src/features/trending.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

