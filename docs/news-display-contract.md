# NovaSocial News Display Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted functional News display invariants before any further structural change.

## Contract

`showNews()` opens the existing News modal and renders the Personalized News heading, the current category strip with `For You` selected, and the fixed article-card set. Each card preserves title, source, relative-time label, visual marker, and article-opening feedback. The display remains a static UI surface; it does not fetch, persist, or mutate news data.

The later inline `showNewsFeed` implementation remains a separate guarded surface and is not changed by this checkpoint.

## Harness coverage

`docs/news-display-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal entry | Open the News modal with the expected heading | PASS |
| Categories | Preserve all eight category labels and selected state | PASS |
| Article cards | Preserve five static article records and card rendering | PASS |
| Metadata | Preserve source and relative-time labels | PASS |
| Article action | Preserve article-opening toast feedback | PASS |
| Scope | Keep the helper static and free of transport/persistence | PASS |
| Inline separation | Keep later inline `showNewsFeed` surface separate | PASS |

The harness is deterministic and static. It does not open modals, fetch articles, navigate externally, or execute article actions.

## Safe boundary

The extracted `src/features/news.js` module remains unchanged in this checkpoint. The inline News Feed implementation and unrelated feed systems remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`news.js`](../src/features/news.js)
2. [`explore-trending-contract.md`](./explore-trending-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

