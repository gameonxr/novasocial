# NovaSocial Story Poll Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story poll vote, result-refresh, and prior-state restoration invariants as a standalone contract before any future refactor.

## Contract

`voteStoryPoll()` distinguishes single-vote and multi-vote cards through `data-multi-vote`. A single-vote card ignores further taps once `data-voted` is `1`, then stores the selected option and refreshes results. A multi-vote card tracks selected option indexes in `data-picked`; tapping an unselected option upserts it, tapping a selected option deletes it, and removing the final option resets `data-voted` to `0`. Both paths refresh the result UI after local state changes.

Vote persistence is best-effort. If the vote table is unavailable or the upsert/delete fails, the local card state and result refresh still proceed. `refreshPollResults()` counts only valid option indexes, computes rounded percentages, highlights the current user’s picked options, and updates the vote metadata. If result loading fails, it simulates counts for the current picked options so the viewer still provides useful local feedback.

`loadStoryPollState()` restores valid existing vote indexes for the current user, marks the card voted, and refreshes results. Missing votes, invalid indexes, or a missing table are handled without throwing to the viewer.

## Harness coverage

`docs/story-poll-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Single-vote selection | Persist one option and refresh | PASS |
| Single-vote repeat | Ignore re-vote | PASS |
| Multi-vote add | Add option and retain picked state | PASS |
| Multi-vote remove | Delete option and refresh | PASS |
| Multi-vote final removal | Clear picked and voted state | PASS |
| Persistence failure | Preserve local state and fail silently | PASS |
| Result counting | Ignore invalid indexes and round percentages | PASS |
| Multi-vote fallback | Simulate current picked options | PASS |
| Empty result | Show zero percentages and prompt | PASS |
| Prior-state restoration | Restore valid votes and refresh | PASS |
| Missing/failed state load | Leave card unvoted and fail silently | PASS |
| Injected seam dispatch | Vote, result, and state-load dependencies dispatch explicitly in order | PASS |

The harness is deterministic and uses mocked poll/card state only. It does not invoke real DOM, Supabase, Story viewer, authentication, or poll actions. Its injected seam dispatcher is test-only and is not loaded by `index.html`; the protected poll owners remain inline.

## Safe boundary

The protected `voteStoryPoll()`, `refreshPollResults()`, and `loadStoryPollState()` implementations remain inline and unchanged. No Story poll, database, or viewer production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story poll implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
