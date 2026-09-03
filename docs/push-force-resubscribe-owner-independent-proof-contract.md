# Force Resubscribe Push Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Date:** 2026-09-03
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`
**Status:** `INDEPENDENT_PROOF_ONLY`

## Owner boundary

| Item | Value |
|---|---|
| Inline owner | `async function forceResubscribePush()` |
| Origin/main range | `index.html:2051–2087` |
| Branch2 range | `index.html:924–957` |
| Owner body SHA-256 | `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d` |

## Required synthetic scenarios

| Scenario | Input mock | Expected behavior | Live effects |
|---|---|---|---|
| `UNSUPPORTED_GATE` | No `navigator.serviceWorker` or no `window.PushManager` | Returns `false`; no SW/PushManager/DB access | 0 |
| `MISSING_USER_GATE` | `ME = null` or `ME = {}` | Returns `false`; no subscription/persistence | 0 |
| `EXISTING_SUBSCRIPTION_CYCLE` | Existing sub returned; unsubscribe succeeds; DB delete succeeds; `subscribeToPushNotifications` returns `true` | Returns `true`; unsubscribe called once; DB delete called once; fresh subscribe called once | 0 (mocked) |
| `NO_EXISTING_SUBSCRIPTION` | `getSubscription` returns `null`; `subscribeToPushNotifications` returns `true` | Returns `true`; unsubscribe NOT called; DB delete NOT called; fresh subscribe called once | 0 (mocked) |
| `UNSUBSCRIBE_FAILURE` | Existing sub; `unsubscribe()` throws | Returns `false`; DB delete NOT called; fresh subscribe NOT called | 0 |
| `DB_DELETE_FAILURE` | Existing sub; unsubscribe succeeds; DB delete throws | Returns `false`; fresh subscribe NOT called | 0 |
| `GET_SUBSCRIPTION_FAILURE` | `getSubscription()` throws | Returns `false`; no unsubscribe/DB/fresh-subscribe | 0 |
| `FRESH_SUBSCRIBE_SUCCESS` | No existing sub; `subscribeToPushNotifications` returns `true` | Returns `true` | 0 |
| `FRESH_SUBSCRIBE_FAILURE` | No existing sub; `subscribeToPushNotifications` returns `false` | Returns `false` | 0 |

## Side-effect policy

| Side effect | Required state |
|---|---|
| Live permission requests | 0 |
| Live service-worker access | 0 |
| Live PushManager access | 0 |
| Database writes | Mocked only |
| Storage writes | 0 |
| Network side effects | 0 |
| Account mutations | 0 |

## Completion criteria

The independent proof harness must:
1. Load the owner body from immutable `origin/main:index.html`
2. Verify the owner body SHA-256 matches `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d`
3. Run all 9 synthetic scenarios in a detached VM with mocked dependencies
4. Assert exact behavior per the scenario table above
5. Assert zero live effects
6. Output `PUSH_FORCE_RESUBSCRIBE_OWNER_INDEPENDENT_PROOF_HARNESS=PASS`
