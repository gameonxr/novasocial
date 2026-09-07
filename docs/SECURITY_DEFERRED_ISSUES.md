# NOVASOCIAL — Security & Bug Deferred-Issues Ledger

**Single source of truth for the security/bug backlog.**
**Created:** 2026-09-07 (H10 task, per owner instruction)
**Repo line:** Branch2 only (`origin/Branch2`), `origin/main` immutable
**Maintenance protocol:**
- Every H-task must import/update entries BEFORE moving on; never silently discard an issue; never mark FIXED unless actually fixed AND regression-tested (commit recorded).
- Duplicate rediscoveries UPDATE the existing entry (dedupe rule).
- Historical issues from: CODEBASE_HEALTH_AUDIT.md, DEAD_V2_GUARD_INVESTIGATION.md, XSS_PRIORITY_AUDIT.md, H1/H1b/H4/H5/H6/H7/H8/H9/H14/H10 task reports, worklog.

**Status legend:** FIXED (fixed + regression-tested, commit recorded) · OPEN (live issue, unowned or awaiting owner decision) · DEFERRED (accepted-risk / task-assigned, not yet fixed) · SAFE (verified non-issue) · HUMAN-DECISION (owner call required)

---

## 1. XSS Priority Audit series (docs/XSS_PRIORITY_AUDIT.md, 19 HIGH / 6 MEDIUM / 7 LOW)

### 1.1 FIXED (esc-at-sink commits on Branch2)

| ID | Finding | File(s) | Sinks | Fix commit |
|----|---------|---------|-------|------------|
| XSS-H1 | Chat message bodies / reply previews / group sender names raw → innerHTML | load-msgs.js | :104, :120-132, :143-144, :150 | 92bb5d3 |
| XSS-H1b | Older-message scroll-up history duplicate renderer raw | -load-older-messages.js | :69, :84-94, :103, :108 → :118 | 10a85bb |
| XSS-H4 | Comment usernames + comment text raw | comments.js | :53-54 | d903268 |
| XSS-H5 | Notification sender names + message payloads raw | notifications.js | :170, :184 | 53cc841 |
| XSS-H6/H6b | DM list name + last-message preview raw (+ refresh prepend) | dms-renderer-owner.js, refresh-dms-in-place.js | :49, :172 | 8fcc2f4 |
| XSS-H7 | Chat header group name / peer username raw | open-chat.js | :102 | 318b0ee |
| XSS-H8/H8b | Pinned-message bars raw (initial + immediate pin) | open-chat.js, pin-msg-from-enc.js | :90, :10 | 8042e59 |
| XSS-H9 | GC Info modal title + group-name div + member list + share-sheet RECENT row raw (post codebase-wide group-name provenance audit) | show-group-info.js, post-actions.js | :21, :40, :107, :128 | e30d6ba |
| XSS-H14 | In-chat search results message text raw | do-search-messages.js | :23 | d5cee8c |
| XSS-H10 | Post-card author username + location raw; share-sheet post-preview @username + caption raw (H10 codebase audit extended scope) | posts.js, post-actions.js | posts.js:127, :130; post-actions.js:332, :333 | THIS COMMIT (H10) |
| XSS-pre-audit wraps | H3 wrap series (typing indicator, optimistic bubble, pinned legacy, feed caption attribution, story editor, search echoes) | 8 files | 9 sites | 83633df…eea3a7a |

Pre-H-audit escaping infrastructure: shared `esc()` (utils.js:4-12, 5-entity, nullish-safe) — verified correct for HTML text + quoted-attribute contexts, preserves all languages byte-for-byte (escape-helper-contract-harness pins behavior).

### 1.2 OPEN — remaining HIGH findings (future H tasks)

| ID | Severity | File:line | Issue | Provenance | Recommended fix | Owning task |
|----|----------|-----------|-------|------------|-----------------|-------------|
| XSS-H11 | HIGH | reels-renderer-owner.js:119, :122 | Reels renderer interpolates username + caption raw (feed's formatCaption escaping NOT used on reels surface) | profiles.username, posts.caption | esc() both; allowlist admission required (NOT in safety allowlist; 15 harness pins) | H11 |
| XSS-H12 | HIGH | home.js:136 | Home story rail renders story usernames raw (adjacent first-letter span = C7) | profiles.username via stories join | esc() at :136 | H12 |
| XSS-H13 | MEDIUM-HIGH | render-sv.js:30, :195 | Story viewer header username raw + reply-input placeholder attr unescaped | profiles.username | esc() at :30 (text) and :195 (double-quoted attr — esc sufficient) | H13 |
| XSS-H15 | HIGH | note-viewer-owners.js:29, :33 | Note viewer renders note author username + full note text raw | profiles.username, quick_notes.text | esc() both; allowlist admission required | H15 |
| XSS-H16 | MEDIUM-HIGH | notes-bar.js:82, :86 | Notes bar renders others' note text (truncated 18) + usernames raw | quick_notes.text, profiles.username | esc() both; allowlist admission required | H16 |
| XSS-H17 | HIGH | note-reactors-list-owner.js:20-21 | Reactor username + typed "emoji" raw — stored XSS executing against the note OWNER (targeted attack) | profiles.username, quick_note_reactions.emoji (arbitrary typed text) | esc() both; allowlist admission required | H17 |
| XSS-H18 | HIGH | profile-view.js:88, 92, 156, 160, 276, 298, 302, 376; follow-list.js:33; show-story-viewers.js:44 | Profile full_name/username raw across profile view, follow lists, story viewers — widest username exposure | profiles.full_name (unvalidated anywhere), profiles.username | esc() in 3 files (follow-list needs allowlist admission) | H18 |
| XSS-H19 | HIGH(edge) | nova-ai.js:162, :251 | AI panel renders raw API response as innerHTML (user's own msg is `<`-escaped, AI reply not) | Nova AI chat API output (prompt-shapable) | esc() at appendNovaMsg call sites; allowlist admission | H19 |

### 1.3 OPEN — MEDIUM findings (M-tier, separate cycle)

| ID | Severity | File:line | Issue | Recommended fix |
|----|----------|-----------|-------|-----------------|
| XSS-M1 | MEDIUM | load-msgs.js:112, 114, 116, 118; **+ posts.js:134, :140-141, :151; post-actions.js:322-323, :363 (H10-discovered sites, same class)** | media_url interpolated into src attributes AND onclick JS-strings (downloadMedia/viewChatImage) — write path does not constrain media_url; DB-write bypass = attribute/JS-string breakout | attr-safe esc for src + encodeURIComponent data-attr pattern for onclick args |
| XSS-M2 | MEDIUM | profile-view.js:135 | Bio uses `<`-only partial escape (safeBio) | replace with esc() — display-identical |
| XSS-M3 | MEDIUM | -update-message-reaction-in-place.js:14 | Reaction badge renders stored emoji raw (join → insertAdjacentHTML) | esc each emoji |
| XSS-M4 | MEDIUM | note-viewer-owners.js:38-39 | Note music metadata raw + JSON.stringify URL inside single-quoted onclick | esc title/artist; data-attr for JSON arg |
| XSS-M5 | MEDIUM | admin-tab-approvals.js:39-40, show-admin-user-detail.js:39-41 | esc()'d usernames inside onclick JS-string-attribute contexts — entity decode-back re-closes JS string (the `.replace(/'/g,"\\'")` after esc is a no-op) | pass row ids only (already done) + look username up in handler, or encodeURIComponent data-attr pattern |
| XSS-M6 | MEDIUM | profile.js:88, 96, 98 | Own-profile full_name/username raw + linkify(bio) without escaping (self-XSS primarily) | esc then linkify (H1's order) |

### 1.4 LOW / informational / resolved

| ID | Severity | File:line | Issue | Status |
|----|----------|-----------|-------|--------|
| XSS-C1 | LOW | utils.js:326-332 av(); posts.js:124; home.js:133; (all av() callers) | av() first letter interpolated raw into text + onerror JS string (leading `\` = syntax breakage, not execution). ALSO: av() computes `safeName` (:329) but never uses it (dead variable, hygiene) | OPEN — av() review task (deferred issue #4) |
| XSS-C2 | LOW | nova-ai.js:219 | Own message `<`-only partial escape | folded into H19 |
| XSS-C3 | LOW | notes-bar.js:84 | Own reaction emoji badge — self-XSS only | OPEN (accepted low) |
| XSS-C4 | — | show-group-info.js:38 | Rename input `value="…"` quote-escaped — double-quoted attr unbreakable | SAFE (verified) |
| XSS-C5 | LOW | load-msgs.js:86 | isSystem() prefix trivially spoofable → renders with system styling (styling only; text now esc'd by H1) | OPEN (cosmetic) |
| XSS-C6 | — | load-msgs.js:153 | Audit claimed reactionMap.id] bug — byte-verified the line is actually reactionMap[m.id] | SAFE (non-issue, verified H1 task) |
| XSS-C8 | — | settings.js:627-628 | Share-link constant, app-origin | SAFE |
| XSS-10.5 | CLASS | (see dedicated JS-string section 5) | esc() insufficient in JS-string-attribute contexts — entity decode-back breakout | OPEN — dedicated hardening task |

---

## 2. Codebase Health Audit series (docs/CODEBASE_HEALTH_AUDIT.md)

| ID | Severity | Issue | Fix commit | Status |
|----|----------|-------|------------|--------|
| HA-H1 | HIGH | Smart-reply buttons dead — read #cinp (stale DOM id) while real textarea is #minp | 26ffd03 | FIXED |
| HA-H2 | HIGH | Video-length picker wiped by prevMedia innerHTML (container missing) | 7c395e6 | FIXED |
| HA-H3 | HIGH | XSS surface systemic (premise corrected in 8176eeb: esc() already existed) → 9 prescribed sites wrapped | 8176eeb…eea3a7a | FIXED |
| HA-M1 | MEDIUM | Notif badge stale dot id (bare-dot consumers) | 5b8ea7a | FIXED |
| HA-M2 | MEDIUM | ai-moderation sendCmt read stale #cinp (ci-<postId>) — moderation lookup never matched | 1e422fa | FIXED |
| HA-M3 | MEDIUM | Following count not updatable (missing id/data-raw) | 60287fb | FIXED |
| HA-M4 | MEDIUM | profile-view eval(a.action) — replaced with type-keyed dispatch table | df4261a | FIXED (zero eval() repo-wide) |
| HA-M5 | MEDIUM | Service-worker cache versioning — stale-JS risk (cache-first, CACHE_NAME 'novasocial-v1' never bumped) | — | DEFERRED (deploy-gated, owner decision; documented in HANDOFF.md:522) |
| HA-hygiene | LOW | Junk root file, dead addStoryTextMode, 3 guarded no-op react-boxes, harness name typo, readiness message counts | 7a1cc80 (+6615800 amendment) | FIXED |

---

## 3. Dead V2 Guard Investigation (docs/DEAD_V2_GUARD_INVESTIGATION.md)

Root cause (all): 2026-07-27 v1-declaration deletion (8e26c10→58615b3 lineage) orphaned v2 wrapper guards; inherited by origin/main and Branch2.

| ID | Severity | Guard | Verdict | Commit | Status |
|----|----------|-------|---------|--------|--------|
| DG-1 | HIGH | _origCheckUnread (nova-universe.js:144-156) — notification Dynamic Island dead since 2026-07-27 | repaired via one-line declaration rename (VM-verified 29/29: no recursion, no double-exec, no sub duplication) | 6bf3db0 | FIXED |
| DG-2 | HIGH | _origSendCmt (ai-moderation.js:20-33) — client-side comment moderation dead (born-broken: never worked even pre-split) | repaired via declaration rename + single authorized harness marker sync (VM 34/34 incl. multilingual pass-through) | 3e29452 | FIXED |
| DG-3 | HIGH | _origInitNova (ai-moderation.js:42-49) — double-blocked (name + load order nova-init.js:1645 after ai-moderation.js:313); name-only fix provably inert; full activation leaks 60s intervals per login | DO NOT REPAIR as-is | — | OPEN (HUMAN-DECISION) |
| DG-4 | HIGH | updateMyInterests (smart-ranking.js:98) never runs on Branch2 — ultra wrapper _origInitNovaFeatures2 (nova-ultra-patches.js:355) inert due to load order (421 < 1645); live in origin/main pre-split | split-induced regression, "preserved behavior" header claim proven wrong | — | OPEN (HUMAN-DECISION) |
| DG-5 | MEDIUM | 3 more same-family dead v2 guards in nova-ultra-patches.js (:60 _origShowNovaUniverseHub, :113 _origGenerateAICaption, :127 _origGetLocalAIResponse) | unactivated | — | OPEN |
| DG-6 | INFO | sendCmt moderation-era stale-id bug (historical) | subsumed by HA-M2 + DG-2 fix | 1e422fa + 3e29452 | FIXED |

---

## 4. H9 audit matrix — deferred classes (recorded in H9, restated here as ledger entries)

| ID | Severity | Scope | Issue | Owning task |
|----|----------|-------|-------|-------------|
| H9-D1 | HIGH(class) | JS-string onclick security: openChat('cid','safeName') (DM list), initiateCall('id','safeName') (open-chat.js:76), sendSharedPostToChat (post-actions.js:126), addToGroup (load-gcsuggestions.js:20), insertMention (check-mention.js:24), search-add-member.js:15, show-call-history.js:41, handle-incoming-call accept, dms-renderer/refresh-dms safeName onclicks, shareText onclicks (post-actions.js:315→:339/:343/:351/:367) | quote-replace-only escaping inside JS-string-attribute contexts — esc() insufficient (XSS-10.5 class); prescribed = encodeURIComponent data-* pattern | Dedicated JS-context hardening task (owner-authorized separately) |
| H9-D2 | HIGH(class) | Username-rendering surface not yet assigned: mentions (check-mention.js:26), call UI (add-remote-tile-to-grid.js:17-18, show-call-history.js:37, handle-incoming-call.js:12, show-call-screen.js:47/:58), share-sheet user pickers (post-actions.js:136/:151), GC Info add-member search/suggestions (search-add-member.js:14, load-gcsuggestions.js:19) | raw username interpolation in HTML text + JS-string onclicks | Username-rendering hardening series (H18-family extensions) |
| H9-D3 | MEDIUM | modal.js shared dynamic title (modal.js:43 fresh-path el.innerHTML) — safe only when callers escape; dynamic callers: voice-rooms.js:53 (prompt() self-XSS), show-staff-actions.js:6 ('Manage '+username admin UI) | caller-side esc audit | Modal dynamic-title caller audit task |
| H9-D4 | LOW | av() first-letter + dead safeName (utils.js:326-332) | XSS-C1 duplicate — deduped into 1.4 | av() review task |
| H9-D5 | LOW(cosmetic) | add-to-group.js:14 reads conversations.name — column does not exist (table has group_name) → undefined → constant 'a group' fallback in notification | no security leak (constant fallback) | Cosmetic fix task |

---

## 5. NEW issues discovered during H10 audit (recorded 2026-09-07, BEFORE fix application)

| ID | Date | Severity | Category | File:line | Exact issue | Provenance | Context | Reproduction | Confirmed? | Recommended fix | Owner | Status |
|----|------|----------|----------|-----------|-------------|------------|---------|--------------|-----------|-----------------|-------|--------|
| H10-1 | 2026-09-07 | HIGH | Stored XSS | post-actions.js:332 | openShareSheet post-preview renders @username raw → mbody.innerHTML | posts join profiles.username (post author, other user) | HTML text | post author username = payload; any viewer taps Share | CONFIRMED (suite NEG N-C, raw payload rendered) | esc() — **APPLIED in H10** | H10 | FIXED (this commit) |
| H10-2 | 2026-09-07 | HIGH | Stored XSS | post-actions.js:333 | openShareSheet post-preview caption rendered raw (truncated 60) — alternate path of the same posts.caption value that formatCaption escapes | posts.caption | HTML text | post caption = payload; viewer opens share sheet | CONFIRMED (suite NEG N-D) | esc() — **APPLIED in H10** | H10 | FIXED (this commit) |
| H10-3 | 2026-09-07 | MEDIUM | XSS class-instance | posts.js:124 | postCard passes username into av() (first-letter + onerror JS-string = C1 class at posts surface) | profiles.username | av() internal | leading `\` in username → onerror syntax breakage | suspected (C1 class) | av() review (XSS-C1) | av() task | OPEN |
| H10-4 | 2026-09-07 | MEDIUM | URL/JS-string | posts.js:134, :140-141, :151; post-actions.js:322-323, :363 | postCard/shareSheet media_url in downloadMedia onclick + src/poster attrs — M1 class at posts surface (sites added to XSS-M1) | posts.media_url / thumbnail_url (DB-write unconstrained) | URL attr + JS-string | crafted media_url row | suspected (M1 class) | fold into M1 fix cycle | M-tier | OPEN (merged into XSS-M1) |
| H10-5 | 2026-09-07 | MEDIUM | JS-string | post-actions.js:315 → :339/:343/:351/:367 | shareText contains raw author username inside 4 onclick JS-string attrs (quote-replace only) — 10.5 class | profiles.username | JS-string-attr | username with `"`/entity-breakout | suspected (10.5 class, verified byte-identical pre/post) | dedicated JS-context task | H9-D1 task | OPEN (merged into H9-D1) |
| H10-6 | 2026-09-07 | LOW | self-XSS | memories.js:59, :66 | Memories screen renders own @username + caption raw — query is .eq('user_id', ME.id) (own posts only) | own profiles.username / own posts.caption | HTML text | self-crafted values, own session | confirmed (code-read; scope=own data) | esc() in a later username sweep | username sweep | OPEN |
| H10-7 | 2026-09-07 | LOW | self-XSS | scheduled-posts.js:35 | Scheduled-posts modal renders caption from localStorage ('nova-scheduled', own submissions) raw | own localStorage caption | HTML text | self-crafted localStorage | confirmed (code-read) | esc() | username sweep | OPEN |
| H10-8 | 2026-09-07 | LOW | self-XSS | insights.js:30 | Post Insights renders @username raw — entry gated by isMine (own posts only from UI) | own profiles.username | HTML text | console-call with foreign pid (not UI-reachable) | suspected | esc() | username sweep | OPEN |
| H10-9 | 2026-09-07 | LOW | DB-write bypass | trending.js:104, :107 | Hashtag names rendered raw + searchHashtag onclick — client extraction is \w-only (safe), direct DB write of hashtags.name renders arbitrary HTML | hashtags.name | HTML text + JS-string | crafted DB row | suspected (M3 class) | esc() + encodeURIComponent | M-tier | OPEN |
| H10-10 | 2026-09-07 | MEDIUM | Username rendering | explore.js:128-:131 | doSearch PEOPLE results render u.username + u.full_name raw | profiles.username/full_name | HTML text | crafted username + search | CONFIRMED (code-read; same class as H18) | esc() both | H18-family sweep | OPEN |
| H10-11 | 2026-09-07 | MEDIUM | Username rendering | universal-search.js:111-:115 | universalAISearch PEOPLE results render username + full_name + bio slice raw | profiles.* | HTML text | crafted bio/username + AI search | CONFIRMED (code-read) | esc() | H18-family sweep | OPEN |
| H10-12 | 2026-09-07 | MEDIUM | Username + JS-string | collaboration.js:37-:40, :54-:58 | Co-author picker renders username raw + selectCollab('${u.id}','${u.username}') onclick | profiles.username (following) | HTML text + JS-string | crafted following username | CONFIRMED (code-read) | esc() + data-attr pattern | username sweep + JS-context task | OPEN |
| H10-13 | 2026-09-07 | MEDIUM | Admin username rendering | load-admin-deleted-posts.js:34 | Admin deleted-posts list renders @username raw (caption already esc'd at :37) — executes against admins/moderators | posts join profiles.username | HTML text | deleted author username = payload; admin opens deleted list | CONFIRMED (code-read) | esc() | admin username sweep | OPEN |
| H10-14 | 2026-09-07 | INFO | hygiene | utils.js:329 | av() computes safeName (quote+quot escape) but never uses it — dead variable | — | — | — | confirmed | remove or use in av() review | av() task | OPEN (deduped into XSS-C1) |
| H10-15 | 2026-09-07 | INFO | display quirk | posts.js:21 | formatCaption more-expander rebuilds with esc(esc(username)) (deliberate double-escape for the attr→JS→innerHTML layering) — `&` in usernames displays as `&amp;` after expansion | profiles.username | nested context | username containing & + long caption + tap "more" | confirmed (pre-existing, audit said DO NOT TOUCH) | keep out of XSS commits; cosmetic fix later | cosmetic task | OPEN |

**Verified SAFE during H10 audit (no action):** news-feed.js:36/:39 (esc'd); profile-view.js:443/:501/:506 post grids (media+UUID only); explore.js:68-72/:138 + universal-search.js:124-129 post grids (media+UUID only); update-post-counts.js (textContent); new-posts-indicator.js (constants + refresh path); setup-posts-realtime.js (no-op); smart-feed.js (constants); submit-create.js / share-story-as-post.js (write-path only, no optimistic render — feed re-renders via postCard); universal-search.js:99 query echo (quote-escaped value attr, C4-adequate) + :104 filters echo (fixed-enum + `\w+` capture — safe by construction); posts.js:18/:21 formatCaption (escaped, H3 wrap 4).

---

## 6. Task report hooks (per owner instruction)

At the end of every H task, report: historical issues imported/updated · issues fixed in this task · issues remaining open · newly discovered issues · ledger changes.

**H10 report block:**
- Historical imported: 10 XSS H-series FIXED rows (H1/H1b/H4-H10/H14 + pre-audit wraps), 8 OPEN HIGH (H11-H19), 6 MEDIUM, C-tier, 9 health-audit rows, 6 dead-guard rows, 5 H9-deferred classes.
- Fixed in this task: XSS-H10 (posts.js:127/:130) + H10-1 + H10-2 (post-actions.js:332/:333) — 4 sinks, 2 files, 4 insertions/4 deletions.
- Newly discovered: H10-1…H10-15 above (H10-1/H10-2 fixed in-task; 13 recorded OPEN/INFO, 2 merged into existing class entries XSS-M1/H9-D1, 1 deduped into XSS-C1).
- Remaining open: 8 HIGH (H11-H19), 6 MEDIUM (M1-M6), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/DG-4/DG-5 human decisions, HA-M5 SW cache versioning (deploy-gated), cosmetic H9-D5/H10-15.
