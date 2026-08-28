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

The detached harness executes the actual inline owner and passes populated rendering, empty-state rendering, stale-generation abort, static marker parity, detached candidate-after parity, and synthetic dispatcher rollback. A separate controlled temporary split fixture removes only the renderer from a copied HTML file, inserts a classic `window.renderDMs` module tag before the inline boundary, and restores the copied HTML byte-for-byte. `DETACHED_ACTUAL_OWNER_PROOF=PASS`, `DETACHED_CANDIDATE_AFTER_PARITY=PASS`, and `CONTROLLED_ROLLBACK_EXACT_RESTORE=PASS` are therefore recorded for this package. `EXACT_PRODUCTION_BEFORE_AFTER_PARITY=REQUIRED`, `POST_SPLIT_PREVIEW_BROWSER_PROOF=REQUIRED`, and `PRODUCTION_ROLLBACK_ARTIFACT=REQUIRED` remain outstanding. The authenticated baseline browser proof is recorded separately in `dms-renderer-authenticated-browser-proof-evidence.txt`; it proves the inline baseline only, not the post-split preview. Synthetic and controlled-copy rollback are not production rollback approval. The bounded split is currently local on Branch2 and has not been published. Therefore `PRODUCTION_DECISION=GATE_VALIDATION_PENDING` and `PRODUCTION_CHANGE=1` are authoritative for the local working tree; no GitHub push or deployment has occurred from this split.
