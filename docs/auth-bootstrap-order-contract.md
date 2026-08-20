# NovaSocial Auth Bootstrap Order Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the classic-script authentication bootstrap ordering around session discovery, profile loading, app initialization, and deferred post-login work.

## Contract

The inline bootstrap performs two `db.auth.getSession()` calls: the initial session gate and the saved-account synchronization helper. It registers one `db.auth.onAuthStateChange(...)` listener after the minimum splash delay. For an already authenticated session, the sequence remains `ME = session.user` → `loadProf()` → `showApp()` → immediate deep-link processing or last-screen restoration. For a first post-login event, the listener retains its `s?.user && !ME` guard, then performs `ME = s.user` → `loadProf()` → `showApp()` before deferred deep-link processing.

This contract records ordering only. It does not change auth events, session persistence, profile queries, splash timing, deep-link queue semantics, or logout/account switching. The protected inline bootstrap remains inline.

## Harness coverage

`docs/auth-bootstrap-order-contract-harness.js` statically scans `index.html` and verifies the two session lookups, one auth listener, the initial and post-login ordering markers, the `!ME` guard, and the existing 500 ms post-login deep-link delay. It does not authenticate, contact Supabase, open the app, or mutate session state.

| Check | Expected behavior | Result |
|---|---:|---|
| Session lookup surface | 2 `db.auth.getSession()` calls | PASS |
| Auth listener surface | 1 `db.auth.onAuthStateChange()` registration | PASS |
| Initial bootstrap order | `ME` → `loadProf` → `showApp` | PASS |
| Post-login order | `ME` → `loadProf` → `showApp` | PASS |
| Duplicate-init guard | `s?.user && !ME` retained | PASS |
| Deep-link settling | Existing 500 ms delay retained | PASS |

## Safe boundary

No production logic is changed by this audit. It records the auth bootstrap seam so future modularization cannot reorder profile loading, app initialization, or queued deep-link handling.

## References

1. [`index.html`](../index.html)
2. [`deep-link-queue-contract.md`](./deep-link-queue-contract.md)
3. [`logout-account-transition-contract.md`](./logout-account-transition-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

