# NovaSocial Push Seam Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Prepare a reversible, test-only seam for protected Push settings handlers without moving subscription or service-worker production code.

## Current owner

The inline `enablePushFromSettings()` and `resetPushFromSettings()` handlers in `index.html` remain the protected production owners. They depend on browser capability checks, `Notification.permission`, permission prompts, existing subscription helpers, force-resubscribe behavior, settings refresh, and account/service-worker state.

## Proposed seam

A future adapter may receive injected capability, permission, subscribe, force-resubscribe, toast, and settings-refresh dependencies. The adapter must delegate subscription mutation to existing helpers and must not own service-worker registration, VAPID configuration, database writes, authentication, or notification delivery.

| Boundary | Required invariant | Deterministic proof input |
|---|---|---|
| Capability guard | Missing Service Worker or Push support produces the existing unsupported feedback and no subscription call | Capability matrix mock |
| Permission guard | Denied permission is respected; non-granted reset permission does not resubscribe | Permission-state mock |
| Granted enable | Granted permission delegates to the existing subscription helper and refreshes settings | Granted permission mock |
| Prompt enable | Permission request result controls toast/subscription; the settings UI is refreshed on both outcomes | Prompt-result mock |
| Reset | Granted permission delegates to existing force-resubscribe and refreshes settings | Reset helper mock |
| Logout/race | Delayed or resumed flows do not act on an absent active account | Active-user state mock |
| Ownership | Service-worker registration, VAPID key, DB persistence, and subscription transport remain outside the seam | Negative ownership assertions |

## Readiness gate

This is seam preparation only. Before any production split, the project still requires protected-marker parity, subscription-error and logout-race proof, a reversible browser smoke test, a small Branch2-only adapter checkpoint, and the complete regression gate. Until then, `DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF` remains active and both inline handlers remain unchanged.

## Harness coverage

`docs/push-seam-preparation-contract-harness.js` statically verifies protected inline ownership, existing push behavior contract coverage, required capability/permission/delegation markers, negative ownership boundaries, and zero extracted protected Push handlers. It does not request browser permission, register a service worker, subscribe, reset a subscription, access account state, or change settings.

## References

1. [`index.html`](../index.html)
2. [`push-permission-contract.md`](./push-permission-contract.md)
3. [`push-permission-contract-harness.js`](./push-permission-contract-harness.js)
4. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

