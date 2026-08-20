# NovaSocial Deep-Link Queue Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Freeze the authenticated and post-login ordering for group, post, and profile deep links.

## Contract

The inline initialization block parses `?gc=`, `?p=`, and `?u=` into one ordered `pendingDeepLinks` queue. If an authenticated session already exists, the queue is processed after `loadProf()` and `showApp()`. If the user is logged out, the queue is stored in `window._pendingDeepLinks`, consumed after the first authenticated `onAuthStateChange`, and dispatched after the existing 500 ms settling delay.

The extracted `processDeepLinks(links)` helper processes links sequentially. Group links insert the current user into `conversation_members`, show the existing success/error toast, and defer `openChat()` by 1,000 ms on success. Post links await `viewPost(ref)`. User links await `resolveAndOpenProfile(ref)`. A 300 ms settling gap remains between queued actions. UUID profile references open directly; non-UUID references use the existing profile username lookup and preserve the not-found toast behavior.

## Harness coverage

`docs/deep-link-queue-contract-harness.js` loads only `src/features/deep-links.js` in a mocked VM context and statically checks the inline initialization block. It verifies sequential routing, group-chat deferral, post/profile dispatch, UUID direct routing, username fallback, and invalid-input safety. It does not authenticate, call the network, access real Supabase, open a browser, or mutate application state.

| Check | Expected behavior | Result |
|---|---|---|
| URL collection | `gc`, `p`, and `u` are queued in URL order | PASS |
| Logged-in dispatch | Queue runs only after profile load and `showApp()` | PASS |
| Logged-out dispatch | Queue persists in `window._pendingDeepLinks` until auth | PASS |
| Sequential processing | Group, post, and user links run in order with settling gaps | PASS |
| Group link | Membership insert, toast, and deferred `openChat()` | PASS |
| Profile links | UUID direct route and username lookup fallback | PASS |
| Error safety | Invalid/empty profile references do not throw or route | PASS |

## Safe boundary

No production logic is changed by this audit. The inline queue initialization and the extracted pure routing helper remain in their current locations. Any future high-risk deep-link refactor must preserve this contract before changing ownership or timing.

## References

1. [`index.html`](../index.html)
2. [`src/features/deep-links.js`](../src/features/deep-links.js)
3. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

