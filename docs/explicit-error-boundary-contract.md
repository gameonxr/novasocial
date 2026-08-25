# NovaSocial Explicit Error-Boundary Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-25
**Purpose:** Preserve the current explicit error propagation sites while preventing accidental changes to fragile upload, Reels, post, camera, profile, and feed paths.

## Contract

The current application has exactly twelve explicit `throw new Error` sites: eight in the protected inline application script, including the two authorized forwarding guards, and two each in `src/features/profile.js` and `src/features/home.js`. These throws are control-flow boundaries consumed by surrounding `try/catch` paths; the two forwarding guards are covered by the production-parity harness.

No explicit throws are expected in the service worker, stylesheets, manifest, or unrelated extracted modules.

## Harness coverage

`docs/explicit-error-boundary-contract-harness.js` scans the tracked application HTML and extracted JavaScript, asserts the exact per-file counts, and confirms the total boundary inventory without executing any error path.

| Check | Expected behavior | Result |
|---|---|---|
| Inline boundaries | Eight explicit throws remain in `index.html`, including two authorized forwarding guards | PASS |
| Profile boundaries | Two explicit throws remain in `src/features/profile.js` | PASS |
| Home boundaries | Two explicit throws remain in `src/features/home.js` | PASS |
| Total inventory | Exactly twelve explicit error boundaries remain | PASS |
| Other surfaces | No explicit throws appear elsewhere | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not trigger uploads, Reels queries, camera access, profile/feed requests, or any user-facing error path; forwarding errors are exercised only with detached synthetic mocks.

## References

1. [`src/features/profile.js`](../src/features/profile.js)
2. [`src/features/home.js`](../src/features/home.js)
3. [`index.html`](../index.html)

