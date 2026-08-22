# NovaSocial Push Settings Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Record the controlled, reversible extraction of the two protected Push settings owners while preserving their global HTML-callable surfaces and delegating subscription/service-worker ownership.

## Approved change

The inline `enablePushFromSettings()` and `resetPushFromSettings()` owners were moved from `index.html` into `src/features/push-settings.js` as anonymous assignments to `window.enablePushFromSettings` and `window.resetPushFromSettings`. The classic module loads immediately before `src/features/like-effects.js`; existing inline callers remain global. No service-worker registration, VAPID key, subscription transport, database persistence, account state, or notification delivery code moved.

## Before/after acceptance

| Check | Before | After | Result |
|---|---:|---:|---|
| Opening script tags | 215 | 216 | PASS |
| Closing script tags | 215 | 216 | PASS |
| External script tags | 214 | 215 | PASS |
| Inline `enablePushFromSettings` owner declarations | 1 | 0 | PASS |
| Inline `resetPushFromSettings` owner declarations | 1 | 0 | PASS |
| Source Push window owners | 0 | 2 | PASS |
| Other unapproved protected inline signatures | 17 | 17 | PASS |
| Enable owner SHA-256 | `711adee3890de37d7bf56f2e51355447861f86f89ed550183b7f5aea7997d520` | same | PASS |
| Reset owner SHA-256 | `0bc93e5da2655a6027bc4cb01e87eacb333a46426e5f60a2b4f208a09c543a4b` | same | PASS |
| Module before `like-effects.js` | N/A | true | PASS |
| Global owner availability | N/A | both functions available | PASS |
| Synthetic after-split browser smoke | N/A | login gate, order, guards, restoration | PASS |

## Rollback acceptance

The production split commit is `43ab6a476fa4b0b7853475d09a94241702d7e452`, whose parent is the pre-split Branch2 commit `18778c497f211a6706567ee4fbaf46ae815dcc27`. A detached temporary worktree applied and reverted the equivalent split: temporary split commit `8da2a0ec4958dfae1a8f435bfa8f35796a041d20`, temporary rollback commit `8c38dab084fc4083b9259cbd1828633283107e26`. Rollback restored both inline owners, exact hashes, 215/215/214 script counts, and absence of `push-settings.js` without changing Branch2 or main.

## Evidence

The associated preparation/comparison evidence is `push-settings-seam-comparison-proof-evidence.txt`; the after-split browser evidence is `push-settings-after-split-browser-proof-evidence.txt`. The detached split/rollback proof is recorded in `push-settings-parity-rollback-evidence.txt`. The associated preparation harness is `push-seam-preparation-contract-harness.js`; the production acceptance harness is `push-settings-production-split-contract-harness.js`.

## Safety boundary

All proofs used synthetic mocks and detached or local preview contexts only. No real permission prompt, push subscription, service-worker registration, account, database, VAPID, notification delivery, or settings mutation occurred. `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.
