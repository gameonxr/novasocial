# NovaSocial Branch2-Only Safety Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Verify the repository-level safeguards required for every autonomous checkpoint.

## Contract

All work must remain on `Branch2`. The local branch must match `origin/Branch2`, `origin/main` must remain at the protected reference `ef418007c9b9a797488b4825be5f0c807da22369`, and the worktree must be clean after publication. Each current checkpoint must be documentation-only unless the migration plan explicitly authorizes a production extraction; an authorized split may include only its exact owner module, `index.html`, required contract/harness/evidence files, and `MIGRATION_MAP.md`.

The fragile production markers for DMs, the main Reels renderer, Calls/WebRTC, Stories, and all not-yet-approved systems must remain in `index.html`; approved particle effects, local deletion fallback, Push settings, Note viewer/removal, Note deletion, Story editor rendering, and the contained Reels windowing helper are represented by anonymous `window.*` owners in their approved modules.

## Harness coverage

`docs/branch2-only-safety-contract-harness.js` validates the following behavior:

| Check | Expected behavior | Result |
|---|---|---|
| Active branch | `Branch2` | PASS |
| Remote parity | Local `HEAD` matches `origin/Branch2` | PASS |
| Main isolation | `origin/main` remains unchanged | PASS |
| Worktree | No uncommitted changes | PASS |
| Latest checkpoint | Documentation-only files unless an explicitly authorized production split package is being published | PASS |
| Protected markers | Fragile inline functions remain present | PASS |

The harness uses local Git metadata and static source inspection only. It does not execute authentication, Supabase, navigation, media, DMs, Reels, Stories, Notes, push, calls, or account actions.

## Safe boundary

The completed Reels helper checkpoint changed only the exact authorized owner plus its required evidence and harness baselines; the main Reels renderer and all other fragile systems remain protected. The harness reinforces Branch2-only operation.

## Validation

The standalone harness passed with `LATEST_CHECKPOINT=REELS_WINDOWING_HELPER_BASELINE` and `MAIN_REF_UNCHANGED=YES`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` protected inline systems](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
3. [`Branch2` repository history](../.git/)
