# NovaSocial Story Download Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story download and browser-object-URL cleanup invariants as a standalone contract before any future refactor.

## Contract

`downloadStory(storyId)` closes the Story action modal and shows downloading feedback before fetching Story metadata. If no Story is returned, it stops with `Story not found` feedback. For an existing Story, it fetches the media URL, reads the response blob, creates a temporary browser object URL, and triggers a temporary anchor download.

Video Stories use the filename `novasocial_story.mp4`; all other media use `novasocial_story.jpg`. After the click, the temporary anchor is removed, the object URL is revoked, and success feedback is shown. Any database, fetch, blob, or browser-download failure is caught and reported as `Download failed`.

## Harness coverage

`docs/story-download-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Download start | Close modal and show downloading feedback first | PASS |
| Existing video Story | Fetch, download as `.mp4`, revoke object URL | PASS |
| Existing image Story | Download as `.jpg` | PASS |
| Missing Story | Stop with not-found feedback | PASS |
| Fetch/blob failure | Show download failure feedback | PASS |
| Temporary link cleanup | Remove anchor and revoke object URL | PASS |

The harness is deterministic and uses mocked Story, fetch, blob, link, and object-URL events only. It does not invoke real DOM, browser downloads, fetch, Supabase, media, Stories, or account actions.

## Safe boundary

The protected `downloadStory()` implementation and Story action/viewer boundaries remain inline and unchanged. No Story download, fetch, media, or browser production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story download implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
