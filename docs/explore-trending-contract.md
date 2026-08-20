# NovaSocial Explore and Trending Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Explore and Trending discovery invariants before any further structural change.

## Contract

`renderExplore()` captures the current render generation, queries non-reel posts ordered by likes, and prefers the joined profile query. If the joined query fails, it falls back to a post-only query and a bounded profile lookup to reconstruct display data. It applies the bidirectional block filter before rendering and aborts without a DOM write when navigation has superseded the request.

The Explore surface preserves the search input, Enter-key smart-search path, trending entry point, AI suggestion chips, category pills, and media grid. `onSearchInput()` debounces non-empty input before invoking regular search. `handleSmartSearch()` routes natural-language or sufficiently long queries to AI search and short queries to regular search. `doSearch()` queries users and caption-matching posts concurrently, applies the same bidirectional block filter, and renders profile/post results or a stable empty state.

`showTrendingPage()` reads the hashtags table ordered by post count with a bounded result set, tolerates query failure, and renders a stable default-trending fallback. Trending hashtag actions route to Explore and populate the search field before invoking regular search.

## Harness coverage

`docs/explore-trending-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Explore query | Prefer joined non-reel posts ordered by likes | PASS |
| Query fallback | Reconstruct profile data after joined-query failure | PASS |
| Block filtering | Hide users and posts blocked in either direction | PASS |
| Generation race | Avoid stale DOM writes after navigation | PASS |
| Search debounce | Debounce non-empty input and ignore blank input | PASS |
| Smart routing | Select AI search for natural-language queries and regular search otherwise | PASS |
| Search results | Render filtered people/posts and stable empty state | PASS |
| Trending | Query bounded hashtag ranking with safe fallback | PASS |
| Hashtag navigation | Route to Explore and trigger the selected search | PASS |

The harness is deterministic and static. It does not query Supabase, invoke AI search, navigate the application, or modify user-visible discovery state.

## Safe boundary

The extracted Explore/Trending implementation remains unchanged in this checkpoint. No discovery, search, ranking, profile, or navigation production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`explore.js`](../src/features/explore.js)
2. [`trending.js`](../src/features/trending.js)
3. [`block-list-contract.md`](./block-list-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

