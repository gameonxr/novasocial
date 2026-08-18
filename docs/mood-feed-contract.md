# NovaSocial Smart Mood Feed Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Smart Mood Feed filtering and race-protection invariants as a standalone contract before any future refactor.

## Contract

`applyMoodToFeed(mood)` builds its source scope from the current user’s followed accounts plus the current user’s own posts. It fetches non-reel, non-archived posts in that scope, preserving the database ordering and the explicit query field set. A missing scope falls back to the normal home render.

For a recognized non-default mood, captions are lowercased and retained when any configured keyword is included as a substring. This intentionally preserves the current behavior, including overlaps such as the gaming keyword `cod` matching the word `coding`. The default mood skips keyword filtering while still applying the followed/own scope.

After mood filtering, authors in the bidirectional blocked set and the current user’s muted set are removed. The function then loads the current user’s likes, bookmarks, and reactions for valid posts, records post views, and renders the empty-state message when no valid posts remain. A non-empty feed clears and renders the list, then schedules video-observer initialization and bounded DOM pruning.

The function captures `_renderGeneration` before asynchronous work. If navigation changes the generation before DOM mutation, it returns without overwriting the feed. Database or feed failures are caught and surfaced through the existing mood-feed error toast.

## Harness coverage

`docs/mood-feed-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Followed/own scope | Include followed accounts and current user | PASS |
| Recognized mood | Apply case-insensitive substring keyword matching | PASS |
| Keyword overlap | Preserve `cod` matching `coding` behavior | PASS |
| Default mood | Skip keyword filtering and preserve source order | PASS |
| Blocked/muted authors | Remove after mood filtering | PASS |
| Empty result | Render mood empty state | PASS |
| Non-empty result | Clear/render list and schedule observers/pruning | PASS |
| Stale generation | Abort before feed DOM overwrite | PASS |
| Missing scope | Fall back to normal home render | PASS |

The harness is deterministic and uses mocked posts/state only. It does not invoke real Supabase, DOM, authentication, blocked/muted queries, likes, bookmarks, reactions, or feed actions.

## Safe boundary

The protected `applyMoodToFeed()` implementation and its database, blocked-user, mute, engagement, and feed-rendering boundaries remain inline and unchanged. No Smart Mood Feed production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Smart Mood Feed implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
