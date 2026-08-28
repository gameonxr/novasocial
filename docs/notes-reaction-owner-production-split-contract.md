# Notes reaction owner — production split contract

**Status:** `SPLIT_VALIDATION_PENDING`
**Candidate:** bounded `reactToNote(noteId, emoji, clickedEl)` owner only
**Branch:** `Branch2`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

The external owner at `src/features/notes-reaction-owner.js` must remain a classic global assignment, preserve the immutable origin body exactly, and load once before the Note viewer caller. The extraction does not authorize live reactions, database writes, realtime changes, authentication changes, or any excluded Notes/DMs owner.

| Gate | Contract |
|---|---|
| Exact parity | `EXACT_ORIGIN_PARITY=REQUIRED` |
| Detached proof | `DETACHED_SYNTHETIC_PROOF=REQUIRED` |
| Safe browser proof | `OBSERVATION_ONLY_BROWSER_PROOF=REQUIRED` |
| Rollback | `ROLLBACK_AFTER_SPLIT=REQUIRED` |
| Full regression | `CLEAN_FULL_REGRESSION=REQUIRED` |
| Live writes | `LIVE_DATABASE_WRITES=0` |

The companion harness covers the success path, missing clicked element, database-error path, exact upsert payload and conflict policy, success-only Notes-bar refresh, burst and timer cleanup, classic global ownership, script order, forbidden side effects, and immutable origin parity.

`FEATURE_AUTHORIZATION=BOUNDED_REACT_TO_NOTE_EXTRACTION`

`PRODUCTION_DECISION=VALIDATION_PENDING`

`PRODUCTION_CHANGE=AUTHORIZED_ON_BRANCH2_ONLY`

`LIVE_REACTION_SUBMISSIONS=0`

`LIVE_SIDE_EFFECTS=0`

## Rollback rule

If any focused, browser-safe, rollback, accounting, or full-regression gate fails, restore the inline owner and remove only this module/linkage from the candidate checkpoint. Do not mutate `origin/main`, live Notes data, realtime configuration, authentication, media APIs, or unrelated protected owners.
