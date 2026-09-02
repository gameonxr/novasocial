# Notes Submission Owner — Production Split Contract

`FEATURE=notes-submission-owner`
`OWNER=submitNote`
`BRANCH_SCOPE=Branch2_ONLY`
`PRODUCTION_SPLIT=REQUIRED`
`EXACT_ORIGIN_PARITY=REQUIRED`
`DETACHED_SYNTHETIC_PROOF=REQUIRED`
`POST_SPLIT_PARITY=REQUIRED`
`ROLLBACK_AFTER_SPLIT=REQUIRED`
`SAFE_BROWSER_OBSERVATION=REQUIRED`
`FULL_REGRESSION=REQUIRED`
`LIVE_NOTE_ACTIONS=FORBIDDEN`
`DATABASE_WRITES=MOCKED_ONLY`
`STORAGE_UPLOADS=FORBIDDEN`
`PERMISSION_ACTIONS=FORBIDDEN`
`ACCOUNT_ACTIONS=FORBIDDEN`
`EXCLUDED_SURFACES=MEDIA_EDITOR_VISIBILITY_EXPIRY_REACTIONS_REACTORS_VIEWER_REALTIME_NAVIGATION_SCHEMA_STORAGE_UPLOADS_PERMISSIONS_PUSH_ACCOUNT_MODERATION`

## Exact owner boundary

The only authorized production boundary is the existing inline `async function submitNote(){...}` owner in `index.html`, currently `index.html:10143–10179` on the authorized Branch2 baseline. The external owner must be `src/features/notes-submission-owner.js`, exposed through the classic global `window.submitNote`, with one script linkage and no caller, dependency, schema, or unrelated inline-code changes.

## Required behavioral parity

The extracted owner must preserve empty validation, insert success, active-note update success, insert failure, update failure, exact payloads, visibility forwarding, 24-hour expiry calculation, active-note ID filtering, success toast/modal-close/Notes-bar refresh order, and failure UI rollback. All checks must run with synthetic DOM, time, UI, and database mocks only.

## Explicit production boundary

This contract does not authorize live Note creation/update, real database writes, storage, uploads, media access, permissions, service workers, Push APIs, network side effects, account actions, or real-browser invocation. A production publish decision is valid only after every required gate passes and the worktree is clean on Branch2.
