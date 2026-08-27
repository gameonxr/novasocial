# DMs Renderer Independent Proof Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Status:** `DETACHED_PROOF_COMPLETE`; production extraction remains `BLOCKED`.

## Purpose

This contract independently executes the current inline `renderDMs()` owner inside a detached Node VM with a synthetic DOM and mocked data adapter. It is intentionally separate from the existing DMs realtime seam harness: the proof runs the actual inline function body rather than only simulating an equivalent reference model.

## Protected boundary

The proof covers only the primary DMs renderer. It does not extract or execute `openChat`, `loadMsgs`, `sendMsg`, `sendMediaMsg`, realtime subscriptions, typing watchers, media handling, authentication, browser navigation, or any real Supabase operation.

## Required cases

| Case | Required observation |
|---|---|
| Populated DMs | Actual inline owner performs the parallel conversations/unread/Notes fetch, dependent member lookup, screen render, `data-cid` rows, Notes Bar handoff, and generation-preserving DOM mutation |
| Empty DMs | Actual inline owner renders the empty state and New Message affordance without a live action |
| Stale navigation | A generation change during the synthetic fetch prevents the actual owner from replacing the screen; the detached query remains mock-only |
| Source boundary | The owner remains inline, the expected guards and query markers remain, and no matching renderer is present in `src/` |
| Synthetic rollback | A test-only dispatcher can restore the original inline owner after a candidate handoff; this is not production rollback approval |

## Forbidden effects

The harness must not authenticate, open a live browser, call Supabase, mutate a database, access service workers or PushManager, request permissions, send messages, upload media, use WebRTC, or invoke live navigation. All DOM, data, timers, and function calls are synthetic.

## Decision

The detached harness executes the actual inline owner and passes populated rendering, empty-state rendering, stale-generation abort, static marker parity, and synthetic dispatcher rollback. `DETACHED_ACTUAL_OWNER_PROOF=PASS` is therefore recorded for this package. `EXACT_PRODUCTION_BEFORE_AFTER_PARITY=REQUIRED`, `SAFE_BROWSER_PROOF=REQUIRED`, `ROLLBACK_ARTIFACT=REQUIRED`, and `EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED` remain outstanding. Synthetic rollback is not production rollback approval. Therefore `PRODUCTION_DECISION=BLOCKED` and `PRODUCTION_CHANGE=0` remain authoritative.
