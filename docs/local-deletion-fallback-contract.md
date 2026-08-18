# NovaSocial Local Deletion Fallback Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected local deletion fallback synchronization invariants as a standalone contract before any future refactor.

## Contract

`syncLocalDeletionFallback()` reads the `_mediaDeleteFallback` queue from local storage. An empty queue is a no-op and does not remove the storage key. A populated queue is replayed in its stored order through the existing `deleteMediaProduction(mediaUrl, source, reason)` boundary.

Each queued item is isolated inside its own `try/catch`, so one failed deletion does not stop later queued media from being attempted. After the replay loop finishes, including when individual items failed, the fallback queue key is removed. This preserves the current best-effort cleanup semantics and prevents a permanently stuck queue.

Malformed JSON, unavailable local storage, and other outer synchronization failures are caught and logged without throwing to the caller. The queue is not removed when the outer read/parse operation fails because the application cannot safely determine its contents.

## Harness coverage

`docs/local-deletion-fallback-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Empty queue | No-op; preserve storage key | PASS |
| Populated queue | Replay items in stored order | PASS |
| Successful replay | Remove queue after completion | PASS |
| One item fails | Continue with later items | PASS |
| Partial-failure replay | Remove queue after loop | PASS |
| Malformed JSON | Fail silently; preserve queue | PASS |
| Storage failure | Fail silently; preserve queue | PASS |

The harness is deterministic and uses mocked storage and deletion events only. It does not invoke real local storage, Supabase, Cloudinary, account data, or media deletion.

## Safe boundary

The protected `syncLocalDeletionFallback()` implementation and `deleteMediaProduction()` boundary remain inline and unchanged. No deletion, storage, media, or account production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` local fallback synchronization](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
