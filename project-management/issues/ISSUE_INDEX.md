# NovaSocial — Issue Index (master)

**Master index of ALL issue categories.** Synchronized whenever issue status changes, an issue is added, or a category file is created.
**Established:** 2026-09-07 (H11 task). **Protocol:** see ISSUE_RULES.md.
**Status legend:** FIXED (fixed + regression-tested, commit recorded) · OPEN · DEFERRED · IN_PROGRESS · WONT_FIX · DUPLICATE · SAFE (verified non-issue) · HUMAN-DECISION (owner call required, legacy rows)

---

## SECURITY_ISSUES.md

### FIXED (XSS H-series — esc-at-sink commits on Branch2)
| ID | Summary | Status |
|----|---------|--------|
| XSS-H1 | Chat message bodies/reply previews/sender names (load-msgs.js) | FIXED (92bb5d3) |
| XSS-H1b | Older-message scroll-up renderer (-load-older-messages.js) | FIXED (10a85bb) |
| XSS-H4 | Comment usernames + text (comments.js) | FIXED (d903268) |
| XSS-H5 | Notification sender names + payloads (notifications.js) | FIXED (53cc841) |
| XSS-H6/H6b | DM list name + last-message preview (+ refresh) | FIXED (8fcc2f4) |
| XSS-H7 | Chat header group name / peer username (open-chat.js) | FIXED (318b0ee) |
| XSS-H8/H8b | Pinned-message bars | FIXED (8042e59) |
| XSS-H9 | GC Info + share-sheet group names / member list | FIXED (e30d6ba) |
| XSS-H10 | Post-card username/location + share-sheet post preview | FIXED (6b6dbf4) |
| XSS-H11 | Reels username + caption (reels-renderer-owner.js:119/:122) | FIXED (d7becc7) |
| XSS-H12 | Home story-rail username (home.js:136) | FIXED (dbf00f9) |
| XSS-H13 | Story viewer header username + reply placeholder (render-sv.js:30/:195) | FIXED (H13 commit) |
| XSS-H15 | Note viewer author username + full note text (note-viewer-owners.js:28/:32) | FIXED (H15 commit) |
| XSS-H16 | Notes Bar text pills + usernames + own PLUS-slot pill + other-profile note pill (notes-bar.js:76/:86/:90 + profile-view.js:389) | FIXED (H16 commit) |
| XSS-H17 | Note reactors list reactor username + typed reaction emoji — targeted stored XSS vs note OWNER (note-reactors-list-owner.js:20/:21) | FIXED (H17 commit) |
| XSS-pre-audit wraps | H3 wrap series, 9 sites | FIXED (83633df…eea3a7a) |
| HA-H3 | Systemic XSS surface premise → wrap series | FIXED (8176eeb…) |
| HA-M4 | eval(a.action) in profile sheet → dispatch table | FIXED (df4261a) |

### OPEN / DEFERRED (security)
| ID | Summary | Status |
|----|---------|--------|
| XSS-H18 | Profile/follow-list/story-viewers full_name+username raw | OPEN |
| XSS-H19 | Nova AI panel raw API response | OPEN |
| XSS-M1 | media_url/avatar_url in src/onclick contexts (posts/reels/profile grids + home tray :133 — H12 site; profile-view :392 viewAvatarFullscreen onclick — H16 site) | OPEN |
| XSS-M2 | profile-view bio partial escape | OPEN |
| XSS-M3 | Reaction badge stored emoji raw | OPEN |
| XSS-M4 | Note music metadata + JSON onclick (+ music search rows :13-25 — H16 site) | OPEN |
| XSS-M5 | Admin approvals esc'd-username-in-onclick decode-back | OPEN |
| XSS-M6 | Own-profile names + linkify(bio) (+ own note pill :75 — H16 site, self-XSS) | OPEN |
| XSS-C1 | av() first-letter + onerror JS-string (all callers incl. reels :118, story-viewer :30, notes surfaces — H16 sites) | OPEN |
| XSS-C2 | nova-ai own-msg partial escape | folded into H19 |
| XSS-C3 | notes-bar own reaction badge (self-XSS) | OPEN (accepted low) |
| XSS-C5 | isSystem() styling spoof | OPEN (cosmetic) |
| XSS-C9 | notes.js personal localStorage notes raw render (self-XSS only — H16-discovered) | OPEN (accepted low) |
| XSS-10.5 | esc() insufficient in JS-string-attr contexts (class) | OPEN |
| H9-D1 | JS-string/inline onclick class (openChat/initiateCall/sendSharedPostToChat/addToGroup/insertMention/shareText…) | OPEN (dedicated hardening task) |
| H9-D2 | Username-rendering surface class (mentions/call-UI/share-pickers/GC-add-member) | OPEN |
| H9-D3 | modal.js dynamic title caller audit (voice-rooms.js:53, show-staff-actions.js:6) | OPEN |
| H9-D4 | av() review | OPEN (deduped into XSS-C1) |
| H10-3 | postCard → av() username (C1 class) | OPEN |
| H10-4 | postCard/shareSheet media_url (M1 class) | OPEN (merged into XSS-M1) |
| H10-5 | shareText onclick JS-strings (10.5 class) | OPEN (merged into H9-D1) |
| H10-6 | memories.js own @username + caption (self-XSS) | OPEN |
| H10-7 | scheduled-posts.js own localStorage caption (self-XSS) | OPEN |
| H10-8 | insights.js own @username (self-XSS) | OPEN |
| H10-9 | trending.js hashtag name DB-write bypass | OPEN |
| H10-10 | explore doSearch PEOPLE raw | OPEN |
| H10-11 | universalAISearch PEOPLE raw | OPEN |
| H10-12 | collaboration picker username + selectCollab onclick | OPEN |
| H10-13 | admin deleted-posts @username raw | OPEN |
| H10-1 | share-sheet post-preview @username | FIXED (6b6dbf4) |
| H10-2 | share-sheet post-preview caption | FIXED (6b6dbf4) |
| SEC-001 | reels error-path e.message raw render (H11-discovered, defense-in-depth; home feed error paths H12-added) | OPEN |
| SEC-002 | story overlay poll question/options raw render to all story viewers (sv-append-overlays.js:44/:51 — H13-discovered) | OPEN |
| XSS-C4 | rename input quote-escaped attr | SAFE |
| XSS-C6 | reactionMap[...] claimed bug | SAFE (non-issue) |
| XSS-C8 | settings share-link constant | SAFE |

## BUG_ISSUES.md

| ID | Summary | Status |
|----|---------|--------|
| HA-H1 | smart-reply dead wiring (cinp→minp) | FIXED (26ffd03) |
| HA-H2 | video-length picker containers missing | FIXED (7c395e6) |
| HA-M1 | notification badge chain dead | FIXED (5b8ea7a) |
| HA-M2 | comment moderation pre-check dead (cinp→ci-<pid>) | FIXED (1e422fa) |
| HA-M3 | following-count stat wiring missing | FIXED (60287fb) |
| DG-1 | _origCheckUnread dead guard repaired | FIXED (6bf3db0) |
| DG-2 | _origSendCmt dead guard repaired | FIXED (3e29452) |
| DG-3 | _origInitNova double-blocked; activation leaks 60s intervals | OPEN (HUMAN-DECISION) |
| DG-4 | updateMyInterests never runs on Branch2 (load order) | OPEN (HUMAN-DECISION) |
| DG-5 | 3 more dead v2 guards in nova-ultra-patches.js | OPEN |
| DG-6 | sendCmt stale-id historical | FIXED (subsumed) |
| H9-D5 | add-to-group.js conversations.name column bug (cosmetic) | OPEN |

## PLATFORM_ISSUES.md

| ID | Summary | Status |
|----|---------|--------|
| HA-M5 | sw.js cache name never versioned (novasocial-v1) + cache-first policy — stale-module risk after deploys | DEFERRED (deploy-gated, owner decision) |

## CODE_HYGIENE_ISSUES.md

| ID | Summary | Status |
|----|---------|--------|
| HA-M6 | feature scaffolding dirs (14 empty) — reorganization decision | OPEN (decision) |
| HA-hygiene (junk root file) | 1-byte junk artifact removed | FIXED (7a1cc80) |
| HA-M7 | addStoryTextMode dead function removed | FIXED (7a1cc80) |
| HA-L4 | react-box no-op removals | FIXED (7a1cc80) |
| HA-L1 | pairing-contract filename drift | FIXED (7a1cc80) |
| HA-L2 | readiness assertion-message drift | FIXED (7a1cc80/6615800) |
| HA-L3 | safety-harness LATEST_CHECKPOINT label lags | OPEN (cosmetic) |
| HA-L5 | nav-debug utilities kept deliberately | WONT_FIX (kept) |
| H10-14 | av() dead safeName variable | OPEN (deduped into XSS-C1) |
| HYG-001 | dblLikeReel declared twice (global + nested in renderReels) — H11-discovered | OPEN |

## UI_UX_ISSUES.md

| ID | Summary | Status |
|----|---------|--------|
| H10-15 | formatCaption double-escape `&`-display quirk after "more" | OPEN |

---

## Category files NOT yet created (no known issues of that category yet)

PERFORMANCE_ISSUES.md · ARCHITECTURE_ISSUES.md · DATABASE_ISSUES.md · REALTIME_NOTIFICATION_ISSUES.md · AI_ISSUES.md · DEPLOYMENT_ISSUES.md

Per ISSUE_RULES.md #9, a category file is created only when an existing or newly discovered issue belongs to that category. (Historical note: HA-M1 was classified BUG by root cause — stale DOM-ID wiring — even though the broken feature is notifications; DG-3's interval leak is also wiring, not realtime.)

## Synchronization log

- 2026-09-07 (H11): index created with full historical import (migration from docs/SECURITY_DEFERRED_ISSUES.md); XSS-H11 → FIXED; SEC-001, HYG-001 added; XSS-M1/XSS-C1 site additions recorded.
- 2026-09-07 (H12): XSS-H12 → FIXED (home.js:136 esc); XSS-M1 site addition (home.js:133 tray avatar img src); SEC-001 site additions (home.js:430/:442 feed error paths); "C7" dangling reference clarified → XSS-C1 (no row deleted/merged); no new issues, no new category files.
- 2026-09-07 (H13): XSS-H13 → FIXED (render-sv.js:30/:195 esc — header username + reply placeholder); NEW issue SEC-002 (story overlay poll content raw — sv-append-overlays.js:44/:51, HIGH, OPEN, future task); XSS-C1 site addition (render-sv.js:30 av() call); no category files created.
- 2026-09-07 (H15): XSS-H15 → FIXED (note-viewer-owners.js:28/:32 esc — author username + full note text; ledger line refs clarified :29/:33 → actual :28/:32, 1-line counting drift, no content change); branch2-only-safety-contract-harness allowlist admission for note-viewer-owners.js; no new issues, no site additions, no category files created.
- 2026-09-08 (H16): XSS-H16 → FIXED (notes-bar.js:76/:86/:90 esc — own PLUS-slot pill + others' pill + others' username; profile-view.js:389 esc — other-profile active-note pill text branch, XSS-H16 family site per dedupe rule #5); NEW issue XSS-C9 (notes.js:57-58 personal localStorage notes self-XSS, LOW, accepted low); site additions — XSS-M1 (profile-view.js:392 viewAvatarFullscreen onclick), XSS-M4 (search-music-for-note.js:13-25), XSS-M6 (profile.js:75 own-profile note pill), XSS-C1 (notes surfaces), XSS-C3 line-ref clarified :84 → actual :88; no category files created; TRACK A audit conclusion recorded (no href sink in Notes Bar; pre-fix breakout minted executable <a href=javascript:> elements — fixed by same esc sinks).
- 2026-09-08 (H17): XSS-H17 → FIXED (note-reactors-list-owner.js:20/:21 esc — reactor username + typed reaction emoji; targeted stored XSS executing against the note OWNER, container gated behind isOwnNote at note-viewer-owners.js:41); branch2-only-safety-contract-harness allowlist admission for note-reactors-list-owner.js; note-reactors-list-production-split-contract-harness parity re-pinned to origin/main + exactly the H17 esc delta; no new issues, no site additions, no category files created; write-path constraint documented (reactToNote upsert unvalidated — maxlength=4 client-side only, receiver-side esc is the only defense).
