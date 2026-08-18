# NovaSocial Share Story as Post Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story-to-Post sharing invariants as a standalone contract before any future refactor.

## Contract

`shareStoryAsPost(storyId)` begins with creating-post feedback and retrieves the Story media URL and media type. If the Story does not exist, it stops with `Story not found` feedback and does not insert a Post.

For an existing Story, the function reuses the exact media URL and media type in a new normal Post owned by the current user. The generated Post has `is_reel: false` and an empty caption. On success, it confirms sharing, closes the action modal and Story viewer, and returns to Home. Any lookup, insert, or database failure is caught and reported as `Failed to share` without running the success cleanup path.

## Harness coverage

`docs/share-story-post-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Image Story | Reuse image URL/type in normal Post | PASS |
| Video Story | Reuse video URL/type in normal Post | PASS |
| Post defaults | Current user, `is_reel: false`, empty caption | PASS |
| Successful share | Confirm, close modal/viewer, return Home | PASS |
| Missing Story | Stop with not-found feedback | PASS |
| Insert failure | Show failure feedback without success cleanup | PASS |

The harness is deterministic and uses mocked Story, Post, modal, viewer, and navigation events only. It does not invoke real DOM, Supabase, authentication, Stories, Posts, or account actions.

## Safe boundary

The protected `shareStoryAsPost()` implementation and Story/Post database and viewer boundaries remain inline and unchanged. No Story sharing or Post production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Share Story as Post implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
