# NOVASOCIAL — Security Issues Ledger

**Single source of truth for the security backlog** (successor of `docs/SECURITY_DEFERRED_ISSUES.md`, migrated 2026-09-07 per owner instruction; every historical entry preserved with its original ID).
**Repo line:** Branch2 only (`origin/Branch2`), `origin/main` immutable
**Maintenance protocol:** see `ISSUE_RULES.md`. Every H-task must import/update entries BEFORE moving on; never silently discard an issue; never mark FIXED unless actually fixed AND regression-tested (commit recorded). Duplicate rediscoveries UPDATE the existing entry (dedupe rule).

**Status legend:** FIXED (fixed + regression-tested, commit recorded) · OPEN (live issue, unowned or awaiting owner decision) · DEFERRED (accepted-risk / task-assigned, not yet fixed) · SAFE (verified non-issue) · HUMAN-DECISION (owner call required)

**Re-homing map (rows that lived in the old security ledger but are NOT security by root cause — full entries in their category files, IDs unchanged):**

| Old-ledger ID | Root cause | New home |
|----|----|----|
| HA-H1 (smart-reply dead wiring) | stale DOM-ID wiring | BUG_ISSUES.md |
| HA-H2 (video-length picker never renders) | stale DOM-ID wiring | BUG_ISSUES.md |
| HA-M1 (notification badge chain dead) | stale DOM-ID wiring | BUG_ISSUES.md |
| HA-M2 (comment moderation pre-check dead) | stale DOM-ID wiring | BUG_ISSUES.md |
| HA-M3 (following-count update dead) | stale DOM-ID wiring | BUG_ISSUES.md |
| HA-M5 (SW cache staleness) | PWA cache policy | PLATFORM_ISSUES.md |
| HA-hygiene (junk file / dead code / doc drift) | repository hygiene | CODE_HYGIENE_ISSUES.md |
| DG-1…DG-6 (dead v2 wrapper guards) | orphaned wrapper wiring | BUG_ISSUES.md |
| H9-D5 (conversations.name column bug, cosmetic) | wrong column reference | BUG_ISSUES.md |
| H10-14 (av() dead safeName variable) | dead variable | CODE_HYGIENE_ISSUES.md (deduped into XSS-C1 for the security aspect) |
| H10-15 (formatCaption double-escape display quirk) | display quirk | UI_UX_ISSUES.md |

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
| XSS-H10 | Post-card author username + location raw; share-sheet post-preview @username + caption raw (H10 codebase audit extended scope) | posts.js, post-actions.js | posts.js:127, :130; post-actions.js:332, :333 | 6b6dbf4 |
| XSS-H11 | Reels renderer interpolates username + caption raw (feed's formatCaption escaping NOT used on reels surface); fixed after full H11 reels-surface provenance audit (all 30 rendering-path rows audited — see section 6) | reels-renderer-owner.js | :119 (username), :122 (caption) | THIS COMMIT (H11) |
| XSS-H12 | Home story rail renders story usernames raw; fixed after full H12 home-surface provenance audit (all story-rail rendering paths audited — see section 7). Adjacent first-letter span (:133) was already covered by XSS-C1 — the old "C7" label in this row was a dangling legacy-ledger reference (C7 never existed as its own row; no C-tier entry was deleted or merged) | home.js | :136 | THIS COMMIT (H12) |
| XSS-pre-audit wraps | H3 wrap series (typing indicator, optimistic bubble, pinned legacy, feed caption attribution, story editor, search echoes) | 8 files | 9 sites | 83633df…eea3a7a |

Pre-H-audit escaping infrastructure: shared `esc()` (utils.js:4-12, 5-entity, nullish-safe) — verified correct for HTML text + quoted-attribute contexts, preserves all languages byte-for-byte (escape-helper-contract-harness pins behavior).

### 1.2 OPEN — remaining HIGH findings (future H tasks)

| ID | Severity | File:line | Issue | Provenance | Recommended fix | Owning task |
|----|----------|-----------|-------|------------|-----------------|-------------|
| XSS-H13 | MEDIUM-HIGH | render-sv.js:30, :195 | Story viewer header username raw + reply-input placeholder attr unescaped | profiles.username | esc() at :30 (text) and :195 (double-quoted attr — esc sufficient) | H13 |
| XSS-H15 | HIGH | note-viewer-owners.js:29, :33 | Note viewer renders note author username + full note text raw | profiles.username, quick_notes.text | esc() both; allowlist admission required | H15 |
| XSS-H16 | MEDIUM-HIGH | notes-bar.js:82, :86 | Notes bar renders others' note text (truncated 18) + usernames raw | quick_notes.text, profiles.username | esc() both; allowlist admission required | H16 |
| XSS-H17 | HIGH | note-reactors-list-owner.js:20-21 | Reactor username + typed "emoji" raw — stored XSS executing against the note OWNER (targeted attack) | profiles.username, quick_note_reactions.emoji (arbitrary typed text) | esc() both; allowlist admission required | H17 |
| XSS-H18 | HIGH | profile-view.js:88, 92, 156, 160, 276, 298, 302, 376; follow-list.js:33; show-story-viewers.js:44 | Profile full_name/username raw across profile view, follow lists, story viewers — widest username exposure | profiles.full_name (unvalidated anywhere), profiles.username | esc() in 3 files (follow-list needs allowlist admission) | H18 |
| XSS-H19 | HIGH(edge) | nova-ai.js:162, :251 | AI panel renders raw API response as innerHTML (user's own msg is `<`-escaped, AI reply not) | Nova AI chat API output (prompt-shapable) | esc() at appendNovaMsg call sites; allowlist admission | H19 |

### 1.3 OPEN — MEDIUM findings (M-tier, separate cycle)

| ID | Severity | File:line | Issue | Recommended fix |
|----|----------|-----------|-------|-----------------|
| XSS-M1 | MEDIUM | load-msgs.js:112, 114, 116, 118; posts.js:134, :140-141, :151; post-actions.js:322-323, :363 (H10-discovered sites); **reels-renderer-owner.js:92 (data-media-url/poster/src attrs) + reels-video-windowing.js:21 (src restore) + profile.js:153/:157, profile-view.js:443/:501/:506 (grid img src) (H11-discovered sites, same class)**; home.js:133 (story-tray avatar `<img src="${profiles.avatar_url}">` — avatar_url, URL-attr context) (H12-discovered site, same class) | media_url/avatar_url interpolated into src attributes AND onclick JS-strings (downloadMedia/viewChatImage) — write path does not constrain media_url/avatar_url; DB-write bypass = attribute/JS-string breakout | attr-safe esc for src + encodeURIComponent data-attr pattern for onclick args |
| XSS-M2 | MEDIUM | profile-view.js:135 | Bio uses `<`-only partial escape (safeBio) | replace with esc() — display-identical |
| XSS-M3 | MEDIUM | -update-message-reaction-in-place.js:14 | Reaction badge renders stored emoji raw (join → insertAdjacentHTML) | esc each emoji |
| XSS-M4 | MEDIUM | note-viewer-owners.js:38-39 | Note music metadata raw + JSON.stringify URL inside single-quoted onclick | esc title/artist; data-attr for JSON arg |
| XSS-M5 | MEDIUM | admin-tab-approvals.js:39-40, show-admin-user-detail.js:39-41 | esc()'d usernames inside onclick JS-string-attribute contexts — entity decode-back re-closes JS string (the `.replace(/'/g,"\\'")` after esc is a no-op) | pass row ids only (already done) + look username up in handler, or encodeURIComponent data-attr pattern |
| XSS-M6 | MEDIUM | profile.js:88, 96, 98 | Own-profile full_name/username raw + linkify(bio) without escaping (self-XSS primarily) | esc then linkify (H1's order) |

### 1.4 LOW / informational / resolved

| ID | Severity | File:line | Issue | Status |
|----|----------|-----------|-------|--------|
| XSS-C1 | LOW | utils.js:326-332 av(); posts.js:124; home.js:133; **reels-renderer-owner.js:118 (H11-noted site)**; (all av() callers) | av() first letter interpolated raw into text + onerror JS string (leading `\` = syntax breakage, not execution). ALSO: av() computes `safeName` (:329) but never uses it (dead variable, hygiene) | OPEN — av() review task (deferred issue #4) |
| XSS-C2 | LOW | nova-ai.js:219 | Own message `<`-only partial escape | folded into H19 |
| XSS-C3 | LOW | notes-bar.js:84 | Own reaction emoji badge — self-XSS only | OPEN (accepted low) |
| XSS-C4 | — | show-group-info.js:38 | Rename input `value="…"` quote-escaped — double-quoted attr unbreakable | SAFE (verified) |
| XSS-C5 | LOW | load-msgs.js:86 | isSystem() prefix trivially spoofable → renders with system styling (styling only; text now esc'd by H1) | OPEN (cosmetic) |
| XSS-C6 | — | load-msgs.js:153 | Audit claimed reactionMap.id] bug — byte-verified the line is actually reactionMap[m.id] | SAFE (non-issue, verified H1 task) |
| XSS-C8 | — | settings.js:627-628 | Share-link constant, app-origin | SAFE |
| XSS-10.5 | CLASS | (see dedicated JS-string section 4) | esc() insufficient in JS-string-attribute contexts — entity decode-back breakout | OPEN — dedicated hardening task |
| SEC-001 | LOW | reels-renderer-owner.js:324; home.js:430/:442 (H12-discovered sites — Home feed error paths, same class) | Reels error fallback + Home feed error states render `e.message` raw into innerHTML (Supabase/JS error text — not user-stored; defense-in-depth concern only; discovered during H11 audit, Home sites added during H12 audit) | OPEN (defer — error-path class) |

---

## 2. Security rows from the Codebase Health Audit (docs/CODEBASE_HEALTH_AUDIT.md)

| ID | Severity | Issue | Fix commit | Status |
|----|----------|-------|------------|--------|
| HA-H3 | HIGH (systemic) | XSS surface systemic (premise corrected in 8176eeb: esc() already existed) → 9 prescribed sites wrapped; basis of the H-series | 8176eeb…eea3a7a | FIXED (series continues as sections 1.2-1.4) |
| HA-M4 | MEDIUM | profile-view eval(a.action) — replaced with type-keyed dispatch table | df4261a | FIXED (zero eval() repo-wide) |

(Non-security health-audit rows re-homed: HA-H1/H2/M1/M2/M3 → BUG_ISSUES.md; HA-M5 → PLATFORM_ISSUES.md; HA-hygiene → CODE_HYGIENE_ISSUES.md.)

---

## 3. Dead V2 Guard Investigation — security-relevant excerpt (full table in BUG_ISSUES.md)

Root cause (all): 2026-07-27 v1-declaration deletion (8e26c10→58615b3 lineage) orphaned v2 wrapper guards; inherited by origin/main and Branch2. Security-relevant consequences: DG-3 full activation leaks 60s intervals per login (resource leak, not injection); DG-2 was required for fix 2's moderation gate to execute. Full DG-1…DG-6 entries with verdicts/commits live in BUG_ISSUES.md.

---

## 4. JS-string / inline onclick security class (dedicated hardening task — H9-D1, XSS-10.5)

| ID | Severity | Scope | Issue | Owning task |
|----|----------|-------|-------|-------------|
| H9-D1 | HIGH(class) | JS-string onclick security: openChat('cid','safeName') (DM list), initiateCall('id','safeName') (open-chat.js:76), sendSharedPostToChat (post-actions.js:126), addToGroup (load-gcsuggestions.js:20), insertMention (check-mention.js:24), search-add-member.js:15, show-call-history.js:41, handle-incoming-call accept, dms-renderer/refresh-dms safeName onclicks, shareText onclicks (post-actions.js:315→:339/:343/:351/:367); + H10-5 merged (shareText contains raw author username inside 4 onclick JS-string attrs, quote-replace only) | quote-replace-only escaping inside JS-string-attribute contexts — esc() insufficient (XSS-10.5 class); prescribed = encodeURIComponent data-* pattern | Dedicated JS-context hardening task (owner-authorized separately) |
| H9-D2 | HIGH(class) | Username-rendering surface not yet assigned: mentions (check-mention.js:26), call UI (add-remote-tile-to-grid.js:17-18, show-call-history.js:37, handle-incoming-call.js:12, show-call-screen.js:47/:58), share-sheet user pickers (post-actions.js:136/:151), GC Info add-member search/suggestions (search-add-member.js:14, load-gcsuggestions.js:19) | raw username interpolation in HTML text + JS-string onclicks | Username-rendering hardening series (H18-family extensions) |
| H9-D3 | MEDIUM | modal.js shared dynamic title (modal.js:43 fresh-path el.innerHTML) — safe only when callers escape; dynamic callers: voice-rooms.js:53 (prompt() self-XSS), show-staff-actions.js:6 ('Manage '+username admin UI) | caller-side esc audit | Modal dynamic-title caller audit task |
| H9-D4 | LOW | av() first-letter + dead safeName (utils.js:326-332) | XSS-C1 duplicate — deduped into 1.4 | av() review task |

(H9-D5 cosmetic column-name bug → BUG_ISSUES.md.)

---

## 5. NEW issues discovered during H10 audit (recorded 2026-09-07, before fix application)

| ID | Date | Severity | Category | File:line | Exact issue | Provenance | Context | Reproduction | Confirmed? | Recommended fix | Owner | Status |
|----|------|----------|----------|-----------|-------------|------------|---------|--------------|-----------|-----------------|-------|--------|
| H10-1 | 2026-09-07 | HIGH | Stored XSS | post-actions.js:332 | openShareSheet post-preview renders @username raw → mbody.innerHTML | posts join profiles.username (post author, other user) | HTML text | post author username = payload; any viewer taps Share | CONFIRMED (suite NEG N-C, raw payload rendered) | esc() — APPLIED in H10 | H10 | FIXED (6b6dbf4) |
| H10-2 | 2026-09-07 | HIGH | Stored XSS | post-actions.js:333 | openShareSheet post-preview caption rendered raw (truncated 60) — alternate path of the same posts.caption value that formatCaption escapes | posts.caption | HTML text | post caption = payload; viewer opens share sheet | CONFIRMED (suite NEG N-D) | esc() — APPLIED in H10 | H10 | FIXED (6b6dbf4) |
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
| H10-15 | 2026-09-07 | INFO | display quirk | posts.js:21 | formatCaption more-expander rebuilds with esc(esc(username)) (deliberate double-escape for the attr→JS→innerHTML layering) — `&` in usernames displays as `&amp;` after expansion | profiles.username | nested context | username containing & + long caption + tap "more" | confirmed (pre-existing, audit said DO NOT TOUCH) | keep out of XSS commits; cosmetic fix later | cosmetic task | OPEN (re-homed → UI_UX_ISSUES.md) |

**Verified SAFE during H10 audit (no action):** news-feed.js:36/:39 (esc'd); profile-view.js:443/:501/:506 post grids (media+UUID only); explore.js:68-72/:138 + universal-search.js:124-129 post grids (media+UUID only); update-post-counts.js (textContent); new-posts-indicator.js (constants + refresh path); setup-posts-realtime.js (no-op); smart-feed.js (constants); submit-create.js / share-story-as-post.js (write-path only, no optimistic render — feed re-renders via postCard); universal-search.js:99 query echo (quote-escaped value attr, C4-adequate) + :104 filters echo (fixed-enum + `\w+` capture — safe by construction); posts.js:18/:21 formatCaption (escaped, H3 wrap 4).

---

## 6. H11 — Reels username/caption XSS (this task)

### 6.1 Provenance audit — all Reels rendering paths (2026-09-07, BEFORE fix application)

Data flow: `posts` table (is_reel=true) joined `profiles!posts_user_id_fkey(username,avatar_url,is_verified)` → `reels` rows → template construction in `window.renderReels` → `scr.innerHTML` (DOM sink). Fallback join path (join error → manual profiles fetch → `profMap[p.user_id] || {username:'user'}`) flows into the SAME template. Context classification per value: username/caption = HTML text; media_url/thumbnail_url = URL attribute (M1 class); r.id/r.user_id = JS-string onclick args (UUID-constrained); reaction = HTML attribute + REACT_MAP lookup (map-miss falls back to ❤️); counts = numeric.

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Reel feed/card/viewer attribution username | reels-renderer-owner.js:119 | r.profiles?.username | HTML text | **VULNERABLE — XSS-H11 sink #1 (fixed in-task)** |
| 2 | Reel feed/card/viewer caption | reels-renderer-owner.js:122 | r.caption | HTML text | **VULNERABLE — XSS-H11 sink #2 (fixed in-task)** |
| 3 | Reel avatar first-letter | reels-renderer-owner.js:118 via av() | profiles.username | av() internal (text + onerror JS-string) | DEFERRED — XSS-C1 class |
| 4 | Reel video media attrs | reels-renderer-owner.js:92 (data-media-url/poster/src) + reels-video-windowing.js:21 (src restore) | media_url, thumbnail_url | URL attribute | DEFERRED — XSS-M1 class |
| 5 | Error fallback message | reels-renderer-owner.js:324 | e.message (Supabase/JS error text) | HTML text | NEW finding SEC-001 — error-path, not user-stored, defer |
| 6 | Reel id onclicks (dblLikeReel :91, toggleLike/startLongPress :103, openComments :109) | reels-renderer-owner.js | r.id | JS-string attr | UUID (DB-generated) — safe by construction |
| 7 | goToProfile onclick | reels-renderer-owner.js:117 | r.user_id | JS-string attr | UUID — safe |
| 8 | data-reaction attr (:102) + likeIconHTML (:104) | reels-renderer-owner.js:102/:104; posts.js:25-27 | likes.reaction | HTML attr + REACT_MAP lookup | map lookup with ❤️ fallback — safe by construction |
| 9 | Like/comment counts | reels-renderer-owner.js:106/:110 | likes_count, comments_count via fmt() | HTML text | numeric — safe |
| 10 | Empty state | reels-renderer-owner.js:58-64 | constants | — | safe |
| 11 | Join-error fallback path | reels-renderer-owner.js:38-49 | profMap (fallback {username:'user'}) | same template sinks #1/#2 | covered by the fix |
| 12 | Persistent-container reattach (revisit) | reels-renderer-owner.js:4-26 | — | DOM reattach, no re-render | safe (container built by fixed template) |
| 13 | Tab-cache restore | try-restore-from-cache.js:11-57 | — | transform/windowing only | safe (no data) |
| 14 | Reels↔Notes toggle | switch-reels-view.js (notes mode → loadNotesFeed) | notes data (NOT reel data) | load-notes-feed.js:77 username esc'd | safe (notes = H16 family; avatar :75 = av() class) |
| 15 | Container destroy (delete/create) | destroy-reels-persistent-container.js; post-actions.js:297; submit-create.js:168-170 | — | DOM removal | safe (rebuild goes through fixed renderReels) |
| 16 | Video src windowing | reels-video-windowing.js | dataset.mediaUrl | src attribute management | M1-class noted; no username/caption rendering |
| 17 | Mute toggle | toggle-reels-mute.js | constants | — | safe |
| 18 | Reel poll modal | reel-poll.js | own input values only, no stored-data render | — | safe (write-path UI; no persistence) |
| 19 | Double-like hearts helper | reel-like-helper.js | textContent hearts | — | safe |
| 20 | Reels CSS enhancement | reels-enhancement.js | stylesheet text | — | safe |
| 21 | Own-profile reels grid | profile.js:157 | media+UUID only | — | safe (M1-class media noted) |
| 22 | Other-profile reels grid | profile-view.js:506 | media+UUID only | — | safe (M1-class media noted) |
| 23 | Explore grid + is_reel badge | explore.js:68-72 | media+UUID; badge = constant icon | — | safe (explore query is is_reel=false) |
| 24 | Explore search results grid | explore.js:138 | media+UUID only | — | safe |
| 25 | Reel detail / deep link ?p= | post-detail.js:50 → postCard | esc'd in H10 | — | safe |
| 26 | Reel comments sheet | comments.js:53-54 (openComments) | esc'd in H4 | — | safe |
| 27 | Share button on reels surface | shareIt() post-actions.js:307 | constants (navigator.share) | — | safe (reels surface does not pass data) |
| 28 | Share sheet (any post incl. reel) | post-actions.js:310-334 | esc'd in H10 (:332/:333) | — | safe (shareText onclicks = H9-D1 class, deferred) |
| 29 | Reel creation (write path) | submit-create.js:94-102/:168-173 | user caption/loc → insert → destroy+rebuild | — | no optimistic render — safe (re-render via fixed template) |
| 30 | Admin deleted-posts list | load-admin-deleted-posts.js:34/:37 | H10-13 deferred | — | not H11 (admin sweep; username raw deferred, caption esc'd) |
| 31 | Debug tooling | nova-debug.js:42-43 | console.log only | — | safe |

### 6.2 H11 fix

`reels-renderer-owner.js` (2 lines, esc() at both HTML-text sinks, esc semantics only, no other change):
- `:119` `${r.profiles?.username||''}` → `${esc(r.profiles?.username||'')}`
- `:122` `${r.caption}` → `${esc(r.caption)}`

esc() available: utils.js (index.html:211) loads before reels-renderer-owner.js (index.html:416). Harness maintenance required by the authorized change (established mechanism, DG-2/H4/H9/H10 precedents): branch2-only-safety-contract-harness.js allowlist admission for reels-renderer-owner.js; reels-seam-preparation-contract-harness.js + reels-renderer-navigation-independent-proof-contract-harness.js byte-parity checks updated to revert EXACTLY the two authorized H11 escape substitutions (with occurrence-count assertions) before origin/main comparison, so any other drift still fails; branch2-final-readiness-contract-harness.js nonstandard-docs list synced for the ledger migration.

---

## 7. H12 — Home story-rail username XSS (this task)

### 7.1 Provenance audit — all story-rail rendering paths (2026-09-07, BEFORE fix application)

Data flow: `stories` table joined `profiles!stories_user_id_fkey(username,avatar_url)` (home.js:76, `.gt('expires_at')`, order desc, limit 20) → `svData` map (`_seen` marking from `story_views` + own-story auto-seen, :83-86) → `uniqueTrayUsers` per-user dedupe (:89-96) → tray-item template (:129-137) → `scr.innerHTML` (:98, one whole-screen assignment). Pull-to-refresh re-enters `renderHome` (same template); stories-query failure → `stories=null` → empty tray (no username render on the fallback). Context classification per value: username = HTML text; avatar_url = URL attribute (M1 class); first letter = single-char HTML text (C1 class — 1 char cannot form a tag); startIdx = numeric array index; story ids/user_ids = UUIDs.

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Story tray username span | home.js:136 | s.profiles?.username | HTML text | **VULNERABLE — XSS-H12 sink (fixed in-task)** |
| 2 | Story tray avatar img | home.js:133 (if-branch) | s.profiles.avatar_url | URL attribute (double-quoted src) | DEFERRED — XSS-M1 class (site added to XSS-M1 row) |
| 3 | Story tray first-letter span | home.js:133 (else-branch) | (s.profiles?.username||'?')[0] | single-char HTML text | DEFERRED — XSS-C1 class (:133 already listed in XSS-C1 row) |
| 4 | Your Story avatar | home.js:110 | PROF.avatar_url / PROF.username via av() | av() internal (text + onerror JS-string) | DEFERRED — XSS-C1 class |
| 5 | Feed error path message | home.js:430/:442 | e.message | HTML text | site addition to SEC-001 (error-path, not user-stored, defer) |
| 6 | openSV(startIdx) onclick | home.js:130 | svData.findIndex of s.id | JS-string attr, numeric index | safe by construction |
| 7 | Seen/unseen ring markup | home.js:124-127 | constant ringHtml variants | — | safe (no data) |
| 8 | Your Story item | home.js:108-114 | constants + own av() | — | safe (constant text) |
| 9 | Topbar / feed tabs / feed scaffold | home.js:99-151 | constants | — | safe |
| 10 | Home feed post cards | home.js:411 → postCard (posts.js) | posts + profiles join | esc'd in H10 (posts.js:127/:130) | safe (H10 esc inherited — verified in H12 suite J20) |
| 11 | Empty feed state | home.js:367-373 | constants | — | safe |
| 12 | Feed error screen | home.js:427-444 | e.message (see #5) + constants | HTML text | SEC-001 class (deferred) |
| 13 | renderHome re-entry (pull-to-refresh / switchFeedTab) | home.js:268-287 | same template | same sinks | covered by the fix |
| 14 | Race-guard aborts | home.js:157/:162/:401 | — | — | safe (early returns) |
| 15 | Other story-username surfaces | render-sv.js:30 (H13); show-story-viewers.js:44 (H18) | separate files | separate issues | NOT H12 (owned by H13/H18) |

### 7.2 H12 fix

`home.js` (1 line, esc() at the HTML-text sink, esc semantics only, no other change):
- `:136` `<span class="sname">${s.profiles?.username||''}</span>` → `<span class="sname">${esc(s.profiles?.username||'')}</span>`

esc() available: utils.js (index.html:211) loads before home.js (index.html:338). **No harness changes required**: home.js was already admitted to the branch2-only-safety-contract allowlist; the explicit-error-boundary harness pins home.js `throw new Error(` count (2, unchanged); the video-observer harness pins the `initVideoObserver()` call (unchanged); no byte-parity harness pins the home.js template. Suite-tooling maintenance OUTSIDE the repo (scripts/, H9-H11 precedent): H11 focused suite L1 re-anchored to the fixed hash d7becc7 + last-touch state; H11 migration reverify staged-deletion check made state-aware (staged OR untracked).

**C7 clarification (dangling-reference fix, no issue deleted/merged):** the pre-H12 row's "(adjacent first-letter span = C7)" referenced a C-tier ID that never existed as its own ledger row — home.js:133 was already recorded in XSS-C1. The reference is corrected to XSS-C1 in the FIXED row above.

### 7.3 H12 verification summary

Vulnerability proven first (pre-fix disk = parent d7becc7): all 5 owner-specified payloads rendered raw + executable at the :136 span (19/0 proof). Post-fix focused suite 175 PASS / 0 FAIL (payload neutralization, adjacent-sink byte-identity, nullish/dedupe/ring edges, 11-language multilingual byte-exact, Home functional regression incl. H10-esc inheritance on the feed surface, esc contract, source hygiene). Negative control vs parent d7becc7: pre-fix VULNERABLE at the sink, benign multilingual byte-identical pre/post. Full gates: prior H suites all green (H1 121/0, H1b 78/0, H4 114/0, H5 203/0, H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H14 63/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family); app-load 10/10; listener/realtime harnesses all pass; diff adds zero listeners/subscriptions.

---

## 8. Task report hooks (per owner instruction)

At the end of every H task, report: historical issues imported/updated · issues fixed in this task · issues remaining open · newly discovered issues · ledger changes.

**H11 report block:**
- Historical imported: full old ledger (10 XSS H-series FIXED rows incl. H10, 8 OPEN HIGH, 6 MEDIUM, C-tier, security health-audit rows, dead-guard excerpt, H9-deferred classes, H10-1…15), re-homed by root cause across the new category files.
- Fixed in this task: XSS-H11 (reels-renderer-owner.js:119/:122) — 2 sinks, 1 source file, 2 insertions/2 deletions.
- Newly discovered: SEC-001 (reels error-path e.message, LOW, OPEN); site additions to XSS-M1 (reels-renderer-owner.js:92, reels-video-windowing.js:21, profile grids) and XSS-C1 (reels-renderer-owner.js:118).
- Remaining open: 7 HIGH (H12-H19), 6 MEDIUM (M1-M6), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001, cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H12 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H12 (home.js:136) — 1 sink, 1 source file, 1 insertion/1 deletion.
- Newly discovered: site additions only — XSS-M1 gains home.js:133 (tray avatar_url img src); SEC-001 gains home.js:430/:442 (Home feed error-path e.message). C7 dangling reference clarified → XSS-C1 (no row deleted/merged).
- Remaining open: 6 HIGH (H13, H15-H19), 6 MEDIUM (M1-M6), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (now reels + home error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).
