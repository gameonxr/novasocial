# NovaSocial News Feed Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted data-backed News Feed module without executing database access.

## Contract

`showNewsFeed()` creates a `📰 News Feed` modal, renders a loading spinner, and queries `posts` through the existing `db` client for posts created within the last 24 hours. The query selects the documented post and profile fields, orders by descending likes, and limits results to 20.

Database errors produce the existing failure state. Empty results produce the no-trending-news state. Results render a scrollable Trending Now list with rank styling, optional media, escaped captions and usernames, profile/avatar metadata, verification state, and like counts. Each result closes the modal and delegates to `viewPost(id)`.

The harness is static and documentation-only. It does not open the modal, query the database, read external media, or navigate to a post.

## Harness coverage

`docs/news-feed-contract-harness.js` validates modal/loading state, time-window calculation, query fields and ordering, empty/error states, escaped result rendering, result metadata, twenty-item cap, and viewPost delegation.

## References

1. [`news-feed.js`](../src/features/news-feed.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

