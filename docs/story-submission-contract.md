# NovaSocial Story Submission Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story submission validation, media-processing, persistence, notification, and cleanup invariants as a standalone contract before any future refactor.

## Contract

`submitStory()` first applies the client-side ban guard and requires either a selected media file or non-empty Story text. It disables the submit button and reports upload progress only after validation succeeds. Video Stories must be 50 seconds or shorter; an over-limit video resets the button and exits without upload.

Image Stories with text use the existing canvas burn-in path. Text-only Stories use the gradient canvas path. Video Stories preserve text overlays as percentage-positioned `overlay_data`. Upload progress updates the submit button, and the Story insert first attempts to persist overlay data, retrying without that column when the schema does not yet contain it.

After a successful insert, follower and explicit mention notifications are best-effort and do not invalidate the Story submission. The function confirms success, invalidates the Home cache, closes the modal, refreshes Story data, and opens the new Story viewer when available or returns Home otherwise. Upload or final persistence failure shows an error and restores the submit button to its enabled `Share Story` state.

## Harness coverage

`docs/story-submission-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Client-banned user | Stop before upload or button disable | PASS |
| Missing media/text | Show validation feedback | PASS |
| Video over 50 seconds | Reject and reset button | PASS |
| Image with text | Burn text to canvas before insert | PASS |
| Text-only Story | Use gradient canvas path | PASS |
| Video text overlays | Capture overlay data and retry without column | PASS |
| Upload progress | Update progress through upload | PASS |
| Notification failure | Keep Story success path nonfatal | PASS |
| Story available after insert | Close modal and open viewer | PASS |
| No Story available after insert | Close modal and return Home | PASS |
| Upload failure | Restore button and show failure | PASS |
| Injected submission dispatch | Submission dependency dispatches explicitly and preserves success, viewer, and reset outcomes | PASS |

The harness is deterministic and uses mocked Story/editor/media/database events only. Its injected submission dispatcher is test-only and is not loaded by `index.html`. It does not invoke real DOM, canvas, media upload, Supabase, notifications, account, or Story actions.

## Safe boundary

The protected `submitStory()` implementation and Story editor/viewer/media/database boundaries remain inline and unchanged. No Story submission, upload, or notification production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story submission implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
