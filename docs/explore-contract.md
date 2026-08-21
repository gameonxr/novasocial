# NovaSocial Explore Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Explore and Search feature without executing database or AI-search operations.

## Contract

`renderExplore()` captures `_renderGeneration`, queries non-Reel posts with profile metadata ordered by likes and capped at 30, and falls back to a post-only query plus profile hydration when the joined query fails. It filters both-way blocked users, aborts stale renders when the generation changes, and renders the Explore screen with search input, Trending navigation, six AI suggestions, eight category pills, and a media grid.

`exPill(el, c)` resets all pill styles and marks the selected pill. `onSearchInput(q)` clears the prior debounce, returns for blank input, and delegates after 350 milliseconds. `handleSmartSearch(q)` routes natural-language or three-plus-word queries to the existing `universalAISearch` seam and short queries to `doSearch`.

`doSearch(q)` trims input, queries users and caption-matching posts with 15- and 20-result caps, filters both-way blocked IDs, renders people and post results with profile/media navigation, and preserves the no-results state. The harness is static and documentation-only; it does not query, navigate, or invoke AI search.

## Harness coverage

`docs/explore-contract-harness.js` validates generation and stale-render guards, primary/fallback queries, block filtering, search UI, suggestions and pill counts, debounce, smart-search delegation, query caps, and result rendering.

## References

1. [`explore.js`](../src/features/explore.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

