# DMs Renderer Independent Proof Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Status:** `DETACHED_PROOF_COMPLETE`; bounded `renderDMs()` extraction is `SPLIT_COMPLETE`, while broader DMs/chat/realtime extraction remains `BLOCKED`.

## Purpose

This contract independently executes the DMs renderer owner inside a detached Node VM with a synthetic DOM and mocked data adapter. It is intentionally separate from the existing DMs realtime seam harness: the proof runs the actual owner body rather than only simulating an equivalent reference model.

## Protected boundary

The proof covers only the primary DMs renderer. It does not extract or execute `openChat`, `loadMsgs`, `sendMsg`, `sendMediaMsg`, realtime subscriptions, typing watchers, media handling, authentication, browser navigation, or any real Supabase operation.

## Required cases

| Case | Required observation |
|---|---|
| Populated DMs | Actual renderer owner performs the parallel conversations/unread/Notes fetch, dependent member lookup, screen render, `data-cid` rows, Notes Bar handoff, and generation-preserving DOM mutation |
| Empty DMs | Actual renderer owner renders the empty state and New Message affordance without a live action |
| Stale navigation | A generation change during the synthetic fetch prevents the actual owner from replacing the screen; the detached query remains mock-only |
| Source boundary | The restored production owner is a classic `window.renderDMs` assignment in `src/features/dms-renderer-owner.js`, with the expected guards and query markers preserved; broader DMs owners remain inline |
| Synthetic rollback | A test-only dispatcher can restore the original inline owner after a candidate handoff; this is not production rollback approval |

## Forbidden effects

The harness must not authenticate, open a live browser, call Supabase, mutate a database, access service workers or PushManager, request permissions, send messages, upload media, use WebRTC, or invoke live navigation. All DOM, data, timers, and function calls are synthetic.

## Decision

The detached harness executes the actual renderer owner and passes populated rendering, empty-state rendering, stale-generation abort, static marker parity, detached candidate-after parity, and synthetic dispatcher rollback. A separate controlled temporary split fixture removes only the renderer from a copied HTML file, inserts a classic `window.renderDMs` module tag before the inline boundary, and restores the copied HTML byte-for-byte. `DETACHED_ACTUAL_OWNER_PROOF=PASS`, `DETACHED_CANDIDATE_AFTER_PARITY=PASS`, and `CONTROLLED_ROLLBACK_EXACT_RESTORE=PASS` are therefore recorded for this package. The bounded split was published on Branch2, authenticated post-split observation passed, and the reversible remote rollback/recovery sequence passed at checkpoints `94d5fc4` and `6faba63`; the recovery checkpoint restores the external owner. The authenticated baseline and post-split observations are recorded in `dms-renderer-authenticated-browser-proof-evidence.txt`; the remote rollback observation is recorded in `dms-renderer-independent-proof-rollback-evidence.txt`. Therefore `PRODUCTION_DECISION=SPLIT_COMPLETE` for the bounded `renderDMs()` owner only. Synthetic and controlled-copy rollback remain supporting evidence; broader chat/realtime owners remain protected.
