# Force Resubscribe Push Owner — Production Split Contract

**Status:** `SPLIT_COMPLETE` — extracted owner verified against immutable origin/main with byte-for-byte parity.
**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Authorization:** `docs/push-force-resubscribe-owner-production-authorization-addendum.md`
**Authorization date:** 2026-09-03
**Split date:** 2026-09-03
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## 1. Owner boundary

| Item | Value |
|---|---|
| Inline owner (pre-split) | `async function forceResubscribePush()` at `index.html:924–957` |
| Origin/main reference | `index.html:2100–2133` |
| Approved owner SHA-256 | `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d` |
| Module path | `src/features/push-force-resubscribe-owner.js` |
| Module global | `window.forceResubscribePush` |
| Module linkage | `<script src="src/features/push-force-resubscribe-owner.js"></script>` |
| Linkage position | After `push-subscription-owner.js`; before `push-silent-resubscribe-owner.js` |
| Linkage count | Exactly 1 |
| Inline owner count (post-split) | 0 |

## 2. Production split requirements

The production split must verify, against immutable `origin/main:index.html`:

1. The module file exists and contains exactly one `window.forceResubscribePush = async function forceResubscribePush()` declaration.
2. The owner body inside the module is byte-for-byte identical to the origin/main inline owner body.
3. The owner body SHA-256 inside the module equals `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d`.
4. The current `index.html` contains zero inline `async function forceResubscribePush()` declarations.
5. The current `index.html` contains exactly one `<script src="src/features/push-force-resubscribe-owner.js"></script>` linkage.
6. The `push-subscription-owner.js` linkage appears before the new linkage (dependency order preserved — forceResubscribePush calls subscribeToPushNotifications).
7. The `push-silent-resubscribe-owner.js` linkage appears after the new linkage (script order preserved).
8. No `import`, `export`, `type="module"`, `defer`, or asynchronous loading strategy is introduced.
9. Synthetic scenarios identical to the independent proof must pass under module loading.
10. No live Push, service-worker, PushManager, permission, database, storage, network, or account action may occur during validation.

## 3. Synthetic scenarios

The production harness must repeat the independent proof scenarios under module ownership:

| Scenario | Expected behavior |
|---|---|
| `UNSUPPORTED_GATE` | Returns `false` when `'serviceWorker' in navigator` or `'PushManager' in window` is false |
| `MISSING_USER_GATE` | Returns `false` when `ME?.id` is unavailable |
| `EXISTING_SUBSCRIPTION_CYCLE` | Existing sub → unsubscribe → DB delete → fresh subscribe; returns `true` |
| `NO_EXISTING_SUBSCRIPTION` | No existing sub → skip to fresh subscribe; returns `true` |
| `UNSUBSCRIBE_FAILURE` | Unsubscribe throws → returns `false` |
| `DB_DELETE_FAILURE` | DB delete throws → returns `false` |
| `GET_SUBSCRIPTION_FAILURE` | getSubscription throws → returns `false` |
| `FRESH_SUBSCRIBE_SUCCESS` | subscribeToPushNotifications returns `true` → returns `true` |
| `FRESH_SUBSCRIBE_FAILURE` | subscribeToPushNotifications returns `false` → returns `false` |

## 4. Exclusions

This split authorizes ONLY the bounded `forceResubscribePush()` owner. It does NOT authorize movement of any other Push function, service-worker registration, VAPID constant, notification delivery, schema changes, live Push actions, caller rewrites, or ES module conversion.

## 5. Completion decision

```text
FEATURE=Force resubscribe push owner
OWNER=forceResubscribePush()
PRODUCTION_DECISION=SPLIT_COMPLETE
PRODUCTION_CHANGE=AUTHORIZED_ON_BRANCH2_ONLY
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
INDEPENDENT_PROOF=PASS
PRODUCTION_PARITY=PASS
ROLLBACK_EVIDENCE=PENDING
FULL_REGRESSION=PENDING
```
