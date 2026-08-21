# NovaSocial News Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted News display feature.

## Contract

`showNews()` creates a `📰 News` modal and renders a Personalized News view with eight category chips: For You, Tech, Gaming, Sports, Entertainment, Business, Science, and Health. The For You chip is selected by default.

It renders five article fixtures with title, source, time, icon, and gradient metadata: Flutter 4.0, Valorant World Cup 2026, an AI healthcare breakthrough, a SpaceX mission, and a Bitcoin price article. Each article card provides the existing article-opening toast. The feature remains presentation-only; later `showNewsFeed` behavior remains an independent inline checkpoint and is not moved by this audit.

The harness is static and documentation-only. It does not open the News modal or access external news data.

## Harness coverage

`docs/news-contract-harness.js` validates modal construction, category count and labels, default selection, five article fixtures, article metadata, toast routing, and the independent inline boundary.

## References

1. [`news.js`](../src/features/news.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

