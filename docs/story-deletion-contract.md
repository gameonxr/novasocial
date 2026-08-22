# NovaSocial Story Deletion and Expiry Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story hard-delete and expired-story cleanup invariants as a standalone contract before any future refactor.

## Contract

`deleteStory(storyId)` requires confirmation, fetches the Story owner and media URL, and rejects missing Stories or Stories owned by another user before any cleanup. Related `story_views`, `story_reactions`, and `story_poll_votes` cleanup is launched with all-settled semantics; a missing or failed reactions table is noncritical and must not block deletion.

The owned Story row is then deleted with the current-user ownership filter. If media exists, the existing Story media-deletion boundary is invoked. Success feedback is followed by modal and Story-viewer closure, Home-cache invalidation, and Home navigation. Any outer failure shows deletion-failed feedback without claiming success.

`cleanupExpiredStories()` is session-once and stops immediately on subsequent calls. On its first call it selects expired Stories with a maximum batch of 100. If none exist, it remains a noncritical no-op. For expired rows, it batches media cleanup, removes related views/reactions/poll votes with all-settled semantics, deletes the Story rows, and treats query/cleanup errors as noncritical.

## Harness coverage

`docs/story-deletion-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Confirmation cancelled | Stop without deletion | PASS |
| Missing Story | Show delete-failed feedback | PASS |
| Non-owner Story | Reject before cleanup | PASS |
| Successful delete | Related cleanup, media cleanup, success navigation | PASS |
| Related-row failure | Continue Story deletion noncritically | PASS |
| Story-row failure | Show failure without success path | PASS |
| Expired cleanup batch | Cap at 100, batch media, clean related rows, delete rows | PASS |
| Empty expired result | Noncritical no-op | PASS |
| Session-once repeat | Skip second cleanup | PASS |
| Expiry query failure | Remain noncritical | PASS |
| Injected deletion dispatch | Delete and expiry-cleanup dependencies dispatch explicitly and preserve media/cache outcomes | PASS |

The harness is deterministic and uses mocked confirmation, Story, database, media, cache, and navigation events only. Its injected deletion dispatcher is test-only and is not loaded by `index.html`. It does not invoke real DOM, Supabase, Cloudinary, authentication, Stories, or deletion actions.

## Safe boundary

The protected `deleteStory()` and `cleanupExpiredStories()` implementations and Story/media/database boundaries remain inline and unchanged. No Story deletion, cleanup, or media production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story deletion and expiry cleanup](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
