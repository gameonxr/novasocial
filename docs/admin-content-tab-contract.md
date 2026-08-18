# NovaSocial Admin Content Tab Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin-content-tab switching, enrichment, and rendering invariants before any future refactor.

## Contract

`adminTabContent(content)` renders Posts, Comments, and Stories controls, creates the content-list loading state, and loads Posts by default. `loadAdminContent(type)` updates `_contentType`, applies selected-tab styling, reads up to 50 items from the selected table in descending creation order, and enriches distinct authors through a profile lookup.

Post previews use safely escaped caption text truncated to 120 characters, or media/no-content fallbacks. Comment previews use safely escaped text. Story previews use the media type. Each item renders the escaped author identity, creation time, delete action, and—when an author is available—a ban-user action. The generated delete action preserves the item ID and selected content type. Empty results render a stable “No content” state, and query failures render a safe failure state.

The content loader is read-only: it does not execute deletion, ban, notification, or account mutations.

## Harness coverage

`docs/admin-content-tab-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Tab initialization | Three type controls render and Posts load by default | PASS |
| Posts | Query, author enrichment, escaped caption, delete/ban actions | PASS |
| Comments | Query switching, selected styling, escaped text, delete handler | PASS |
| Stories | Query switching, media-type preview, author rendering | PASS |
| Limit/order | Selected content reads newest 50 items | PASS |
| Empty results | Stable “No content” state | PASS |
| Query failure | Safe failure state | PASS |

The harness uses mocked DOM, database query builders, escaping, avatars, and icons only. It does not invoke real authentication, Supabase, deletion RPCs, ban actions, notifications, moderation, or account mutations.

## Safe boundary

The protected content-tab loader and all delete/ban handlers remain inline and unchanged. No production content moderation or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin content implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
