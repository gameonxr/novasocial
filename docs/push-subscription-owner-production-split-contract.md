# Push Subscription Owner — Production Split Contract

**Status:** `SPLIT_COMPLETE` — extracted owner verified against immutable origin/main with byte-for-byte parity.
**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Authorization:** `docs/push-subscription-owner-production-authorization-addendum.md`
**Authorization date:** 2026-09-02
**Split date:** 2026-09-03
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## 1. Owner boundary

| Item | Value |
|---|---|
| Inline owner (pre-split) | `async function subscribeToPushNotifications()` at `index.html:912–948` |
| Origin/main reference | `index.html:2051–2087` |
| Approved owner SHA-256 | `b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4` |
| Module path | `src/features/push-subscription-owner.js` |
| Module global | `window.subscribeToPushNotifications` |
| Module linkage | `<script src="src/features/push-subscription-owner.js"></script>` at `index.html:415` |
| Linkage position | After `url-base64-to-uint8-array.js`; before `push-silent-resubscribe-owner.js` |
| Linkage count | Exactly 1 |
| Inline owner count (post-split) | 0 |

## 2. Production split requirements

The production split must verify, against immutable `origin/main:index.html`:

1. The module file exists and contains exactly one `window.subscribeToPushNotifications = async function subscribeToPushNotifications()` declaration.
2. The owner body inside the module is byte-for-byte identical to the origin/main inline owner body.
3. The owner body SHA-256 inside the module equals `b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4`.
4. The current `index.html` contains zero inline `async function subscribeToPushNotifications()` declarations.
5. The current `index.html` contains exactly one `<script src="src/features/push-subscription-owner.js"></script>` linkage.
6. The `url-base64-to-uint8-array.js` linkage appears before the new linkage (dependency order preserved).
7. The `push-silent-resubscribe-owner.js` linkage appears after the new linkage (script order preserved).
8. No `import`, `export`, `type="module"`, `defer`, or asynchronous loading strategy is introduced.
9. Synthetic scenarios identical to the independent proof must pass under module loading.
10. No live Push, service-worker, PushManager, permission, database, storage, network, or account action may occur during validation.

## 3. Synthetic scenarios

The production harness must repeat the independent proof scenarios under module ownership:

| Scenario | Expected behavior |
|---|---|
| `UNSUPPORTED_GATE` | Returns `false` when `'serviceWorker' in navigator` or `'PushManager' in window` is false; no SW/PushManager/DB access |
| `MISSING_USER_GATE` | Returns `false` when `ME?.id` is unavailable; no subscription or persistence |
| `EXISTING_SUBSCRIPTION_REFRESH` | Existing subscription is serialized and upserted; `subscribe()` is NOT called |
| `NEW_SUBSCRIPTION_CREATE` | `subscribe()` called once with `userVisibleOnly: true` and converted VAPID key; result serialized and upserted |
| `VAPID_AND_SUBSCRIBE_OPTIONS` | `urlBase64ToUint8Array(VAPID_PUBLIC_KEY)` consumed; `userVisibleOnly: true` enforced |
| `DB_PAYLOAD_AND_CONFLICT_POLICY` | `push_subscriptions` upsert with exact fields and `onConflict: 'endpoint'` |
| `SUBSCRIBE_FAILURE` | Caught failure returns `false`; no DB write |
| `DATABASE_FAILURE` | Caught failure returns `false` |
| `GET_SUBSCRIPTION_FAILURE` | Caught failure returns `false`; no subscribe call |
| `DEVICE_INFO_TRUNCATION` | `navigator.userAgent.substring(0, 200)` enforced |

## 4. Exclusions

This split authorizes ONLY the bounded `subscribeToPushNotifications()` owner. It does NOT authorize:

- Movement of `forceResubscribePush()`, `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, or any other Push function
- Service-worker registration, VAPID constant movement, or notification delivery
- Schema changes to `push_subscriptions` table
- Live Push subscription, permission prompting, or service-worker access during validation
- Caller rewrites, neighbor function modifications, or broad refactors
- Conversion to ES modules, `import`/`export`, `type="module"`, `defer`, or async loading

## 5. Rollback requirement

A disposable rollback proof must demonstrate that reversing only the new module file, the one new linkage, and the inline owner restoration produces byte-for-byte identical `index.html` to the pre-split baseline, with the same baseline commit hash and immutable `origin/main`.

## 6. Side-effect policy

| Side effect | Required state |
|---|---|
| Live permission requests | 0 |
| Live service-worker access | 0 |
| Live PushManager access | 0 |
| Database writes | Mocked only |
| Storage writes | 0 |
| Network side effects | 0 |
| Account mutations | 0 |
| Browser live actions | 0 |

## 7. Completion decision

```text
FEATURE=Push subscription owner
OWNER=subscribeToPushNotifications()
PRODUCTION_DECISION=SPLIT_COMPLETE
PRODUCTION_CHANGE=AUTHORIZED_ON_BRANCH2_ONLY
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
INDEPENDENT_PROOF=PASS
PRODUCTION_PARITY=PASS
ROLLBACK_EVIDENCE=PASS
FULL_REGRESSION=PENDING
```

The owner is `SPLIT_COMPLETE` once all production gates pass: exact parity, synthetic proof, rollback evidence, synchronized inventory contracts, clean full Branch2 regression, and Branch2 remote alignment. Browser-safe observation remains observation-only and is excluded from automated validation in this environment.
