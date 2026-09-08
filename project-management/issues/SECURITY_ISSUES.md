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
| XSS-H13 | Story Viewer header username rendered raw (HTML text, :30) + reply-input placeholder attribute unescaped (double-quoted attr, :195 — quote payloads break out); fixed after full H13 story-viewer provenance audit (all 7 renderSV entry paths + adjacent surfaces audited — see section 8). All entry paths (open/next/prev/next-user/prev-user/mute-toggle re-render/recursive bucket-skip) funnel through the single renderSV template — both sinks inherit one fix | render-sv.js | :30 (header username, HTML text), :195 (reply placeholder, attr) | THIS COMMIT (H13) |
| XSS-H15 | Note viewer renders note author username + full note text raw (both HTML-text sinks); fixed after full H15 note-viewer provenance audit (all 5 viewNote entry paths + adjacent surfaces audited — see section 9). All entry paths (own-profile pill / notes-bar own+others / notes-feed / other-profile pill) funnel through the single viewNote template — both sinks inherit one fix. Ledger/audit rows originally cited :29/:33 (1-line drift vs the original docs/XSS_PRIORITY_AUDIT.md:215 counting — actual current lines :28/:32, sinks unambiguous by content) | note-viewer-owners.js | :28 (author username, HTML text), :32 (full note text, HTML text) | THIS COMMIT (H15) |
| XSS-H16 | Notes Bar renders others' note text pill (slice 18) + others' usernames raw (ledger refs :82/:86 = actual current :86/:90, line drift, sinks unambiguous by content), PLUS own PLUS-slot text pill (:76, slice 16) and the receiver-side other-profile active-note pill text (profile-view.js:389) — the receiver surfaces of the PLUS (+) composer output; fixed after full H16 notes-bar provenance audit (TRACK A href/URL + TRACK B PLUS composer — see section 10). TRACK A: Notes Bar contains NO href construction (no <a>/href/window.open driven by note data; navigation = onclick JS-strings with DB UUIDs, safe by construction); pre-fix, quote-breakout payloads minted real parsed <a href="javascript:…"> / <img onerror> elements from the unescaped zones (the executable-href vector — proven); pure scheme strings (javascript:/data:/vbscript:/mixed-case/percent/entity-encoded/whitespace-control variants) render as literal text (no href sink exists). URL-valued deferred classes untouched: av() img src (XSS-C1), music artwork/preview (XSS-M4), viewAvatarFullscreen avatar_url onclick (XSS-M1-class site addition) | notes-bar.js + profile-view.js | notes-bar.js:76 (own pill, HTML text), :86 (others' pill, HTML text), :90 (others' username, HTML text); profile-view.js:389 (other-profile pill text branch, HTML text) | THIS COMMIT (H16) |
| XSS-H17 | Note reactors list renders reactor username + typed reaction "emoji" raw (both HTML-text sinks) — a TARGETED stored XSS executing against the note OWNER (the only viewer who can open the reactors list: note-viewer-owners.js:41 gates the container behind isOwnNote, :73 invokes the loader); fixed after full H17 reactors-list provenance audit (reaction write paths + all render paths + adjacent surfaces — see section 11). Reaction write paths (quick 5 constant emojis OR openMoreEmojiPicker native input maxlength=4 CLIENT-SIDE ONLY → submitNativeEmojiReaction → reactToNote upsert {note_id, user_id:ME.id, emoji} onConflict note_id,user_id, notes-reaction-owner.js:17 — NO write-side validation; DB-write bypass = arbitrary emoji string). av() avatar block (:19) untouched — XSS-C1 class; onclick row UUID JS-string (:18) safe by construction (user_id = ME.id auth session uid, not free text) | note-reactors-list-owner.js | :20 (reactor username, HTML text), :21 (typed reaction emoji, HTML text) | THIS COMMIT (H17) |
| XSS-H18 | Profile/preview/full-profile/follow-list/story-viewers render attacker-stored `profiles.username` + `profiles.full_name` raw across 11 HTML-text sinks — the widest username exposure (write path: settings.js saveEdit — username regex validation CLIENT-SIDE ONLY, full_name has NO validation; DB-write bypass = arbitrary strings; receiver = ANY user who opens the attacker's profile/preview, any follower/following list containing the attacker, and the story OWNER for viewer lists); fixed after full H18 provenance audit (profile 4 render paths + followers/following + story viewers + adjacent user-list surfaces — see section 12). Ledger row cited :88, :92, :156, :160, :276, :298, :302, :376 (all verified exact) + follow-list.js:33 (actual sink :34 — 1-line drift, unambiguous by content) + show-story-viewers.js:44 (exact); :403 (bio-section full_name) added in-task as the 9th same-file/same-class sink. av() blocks (:82/:150/:286/:391, follow-list :33, viewers :43) untouched — XSS-C1 class; viewAvatarFullscreen onclick :392 untouched — M1/H9-D1 class; bio :135/:408 untouched — M2 class; cover_url :62/:267/:366 untouched — M1 class; error path :213 — SEC-001-family site | profile-view.js + follow-list.js + show-story-viewers.js | profile-view.js:88, :92, :156, :160, :276, :298, :302, :376, :403; follow-list.js:34; show-story-viewers.js:44 (all HTML text) | THIS COMMIT (H18) |
| XSS-H19 | Nova AI panel renders EVERY message through one shared innerHTML sink raw — `appendNovaMsg` (nova-ai.js:157-166, `div.innerHTML = text` at :162) — fed by (a) the raw GLM API response (:251 — prompt-shapable model output; call-nova-ai.js:30-44 keyword-redaction is NOT markup sanitization), (b) the local canned fallback (:247→:251), (c) `handleNovaCommand` responses containing DB-stored `profiles.username` from follows joins (:336 milta-jhulta contact list, :341 open-chat match, :351 similar list, :647 friend recommendations — cross-user stored XSS via the panel; username signup-unconstrained per H18), (d) the user's own message with `<`-only partial pre-escape (:219 — the old XSS-C2), and (e) the same sink from the voice pipeline (voice-assistant.js:139 user / :155 AI+command). PLUS the Nova AI response rendering path's modal variant: `showTranslatedCaption` (nova-universe.js:97-113) renders the GLM translation response raw (:108 — the translation prompt embeds the post's own stored caption, so caption content is prompt-injectable into model output) AND the original `posts.caption` raw (:104 — the same posts.caption value class that formatCaption/H10-2 escape; alternate path, per dedupe rule #5 recorded here as the H19-audit-discovered site of that class and fixed in this commit). Content model determined by runtime audit, not assumption: PLAIN TEXT — NO Markdown parser, linkify, or sanitizer exists anywhere in the Nova AI pipeline; all producers are Hinglish+emoji+\n text; no caller passes intentional HTML; the panel welcome message is static index.html markup; nova-user-name is set via textContent (:37); .nova-msg CSS has no white-space:pre-wrap so \n visually collapses both pre- and post-fix (display model unchanged). Fixed at the shared sink per the H-series shared-renderer principle — one esc() at :162 covers all 8 call sites, both text and voice pipelines, the command DB-username paths, and all future callers; the two `<`-only pre-escapes removed so esc() is the single escaping stage (no double-escape) | nova-ai.js + voice-assistant.js + nova-universe.js | nova-ai.js:162 (sink esc), :219 (pre-escape removed); voice-assistant.js:139 (pre-escape removed); nova-universe.js:104 (translate ORIGINAL), :108 (translate TRANSLATED) | THIS COMMIT (H19) |
| XSS-pre-audit wraps | H3 wrap series (typing indicator, optimistic bubble, pinned legacy, feed caption attribution, story editor, search echoes) | 8 files | 9 sites | 83633df…eea3a7a |

Pre-H-audit escaping infrastructure: shared `esc()` (utils.js:4-12, 5-entity, nullish-safe) — verified correct for HTML text + quoted-attribute contexts, preserves all languages byte-for-byte (escape-helper-contract-harness pins behavior).

### 1.2 OPEN — remaining HIGH findings (future H tasks)

| ID | Severity | File:line | Issue | Provenance | Recommended fix | Owning task |
|----|----------|-----------|-------|------------|-----------------|-------------|
| SEC-002 | HIGH | sv-append-overlays.js:44, :51 | Story overlay poll content (question + option text) rendered raw into innerHTML — story-author-controlled stored content executing against every viewer who opens the story (overlay authoring-path constraints NOT verified; DB-write bypass = arbitrary HTML; H13-audit discovery). Mention/link/text overlay branches use textContent (safe). CSS-context residuals: ov.color/fontSize/fontWeight/textShadow into cssText (breakage class, not execution) + ov.url into window.open (URL class) | stories.overlay_data (JSON — poll question/options authored by the story owner via story-editor poll UI) | esc() at :44 (question) and :51 (option text); residuals stay deferred same-row | future H-task (owner assigns; suggest after H19) |

### 1.3 OPEN — MEDIUM findings (M-tier, separate cycle)

| ID | Severity | File:line | Issue | Recommended fix |
|----|----------|-----------|-------|-----------------|
| XSS-M1 | MEDIUM | load-msgs.js:112, 114, 116, 118; posts.js:134, :140-141, :151; post-actions.js:322-323, :363 (H10-discovered sites); **reels-renderer-owner.js:92 (data-media-url/poster/src attrs) + reels-video-windowing.js:21 (src restore) + profile.js:153/:157, profile-view.js:443/:501/:506 (grid img src) (H11-discovered sites, same class)**; home.js:133 (story-tray avatar `<img src="${profiles.avatar_url}">` — avatar_url, URL-attr context) (H12-discovered site, same class); **profile-view.js:392 (viewAvatarFullscreen('${prof.avatar_url||''}','${prof.username}') single-quoted onclick JS-string — avatar_url in onclick arg, H16-discovered site, same class)**; **profile-view.js:62 (cover_url inside single-quoted CSS url() within the double-quoted style attribute — quote payloads can break the attr; H18-discovered site, same class) + profile-view.js:267/:366 (cover img src via cldUrl — H18-discovered sites, same class)** | media_url/avatar_url/cover_url interpolated into src attributes, CSS url() contexts AND onclick JS-strings (downloadMedia/viewChatImage) — write path does not constrain these URL columns; DB-write bypass = attribute/JS-string breakout | attr-safe esc for src + encodeURIComponent data-attr pattern for onclick args |
| XSS-M2 | MEDIUM | profile-view.js:135; **profile-view.js:408 (full-profile bio rendered via linkify(prof.bio) with NO escaping — linkify wraps URLs only, all other text passes raw; cross-user stored bio → innerHTML; H18-audit-discovered site, same bio class)** | Bio uses `<`-only partial escape (safeBio) on the preview path, and NO escape at all on the full-profile path | replace with esc() + esc-then-linkify (H1's order) at both sites |
| XSS-M3 | MEDIUM | -update-message-reaction-in-place.js:14 | Reaction badge renders stored emoji raw (join → insertAdjacentHTML) | esc each emoji |
| XSS-M4 | MEDIUM | note-viewer-owners.js:38-39; **search-music-for-note.js:13-25 (iTunes API rows: trackName/artistName raw text + JSON.stringify args inside single-quoted onclick — H16-discovered sites, same music-metadata class)** | Note music metadata raw + JSON.stringify URL inside single-quoted onclick | esc title/artist; data-attr for JSON arg |
| XSS-M5 | MEDIUM | admin-tab-approvals.js:39-40, show-admin-user-detail.js:39-41 | esc()'d usernames inside onclick JS-string-attribute contexts — entity decode-back re-closes JS string (the `.replace(/'/g,"\\'")` after esc is a no-op) | pass row ids only (already done) + look username up in handler, or encodeURIComponent data-attr pattern |
| XSS-M6 | MEDIUM | profile.js:88, 96, 98; **profile.js:75 (own-profile active-note pill — own quick_notes.text raw, self-XSS only, H16-discovered site, same own-profile self-XSS class)** | Own-profile full_name/username raw + linkify(bio) without escaping (self-XSS primarily) | esc then linkify (H1's order) |

### 1.4 LOW / informational / resolved

| ID | Severity | File:line | Issue | Status |
|----|----------|-----------|-------|--------|
| XSS-C1 | LOW | utils.js:326-332 av(); posts.js:124; home.js:133; **reels-renderer-owner.js:118 (H11-noted site)**; **render-sv.js:30 (H13-noted site — story viewer header avatar)**; **notes-bar.js:75/:85, note-viewer-owners.js:26, load-notes-feed.js:75 (H16-noted sites — notes surfaces)**; **profile-view.js:82/:150/:286/:391, follow-list.js:33, show-story-viewers.js:43 (H18-noted sites — profile preview/full/blocked paths, follow-list rows, story-viewer rows; byte-identity disk vs parent proven in H18 S-F)**; (all av() callers) | av() first letter interpolated raw into text + onerror JS string (leading `\` = syntax breakage, not execution). ALSO: av() computes `safeName` (:329) but never uses it (dead variable, hygiene) | OPEN — av() review task (deferred issue #4) |
| XSS-C2 | LOW | nova-ai.js:219 (and voice-assistant.js:139 — same pre-escape, voice pipeline) | Own message `<`-only partial escape | FIXED in H19 (pre-escape removed at both call sites; the shared appendNovaMsg sink now applies full esc() — single escaping stage, no double-escape) |
| XSS-C3 | LOW | notes-bar.js:84 (ledger counting; actual current line :88 — 4-line drift, sink unambiguous by content; H16-audit re-verified: badge renders myReactionsMap[n.id] = own reaction emoji, byte-identical pre/post H16 fix, untouched) | Own reaction emoji badge — self-XSS only | OPEN (accepted low) |
| XSS-C4 | — | show-group-info.js:38 | Rename input `value="…"` quote-escaped — double-quoted attr unbreakable | SAFE (verified) |
| XSS-C5 | LOW | load-msgs.js:86 | isSystem() prefix trivially spoofable → renders with system styling (styling only; text now esc'd by H1) | OPEN (cosmetic) |
| XSS-C6 | — | load-msgs.js:153 | Audit claimed reactionMap.id] bug — byte-verified the line is actually reactionMap[m.id] | SAFE (non-issue, verified H1 task) |
| XSS-C8 | — | settings.js:627-628 | Share-link constant, app-origin | SAFE |
| XSS-C9 | LOW | notes.js:57-58; **nova-ultra-patches.js:46 moodChip `innerHTML` interpolating currentMood (source: smart-feed.js fixed-enum OR ai-moderation.js:39 `localStorage.getItem('nova-current-mood')` — self-set localStorage, H19-audit-discovered site, same self-XSS class)** | Personal "My Notes" modal renders localStorage `nova-notes` myNotes title/content raw into innerHTML — self-XSS only (own-device localStorage, no cross-user vector; separate feature from the quick_notes Notes Bar — H16 audit discovery). The smart-feed mood ids are a developer fixed-enum; only the localStorage restore path (ai-moderation.js:39) is self-XSS-class | OPEN (accepted low — self-XSS class, C3/M6 family treatment) |
| XSS-10.5 | CLASS | (see dedicated JS-string section 4) | esc() insufficient in JS-string-attribute contexts — entity decode-back breakout | OPEN — dedicated hardening task |
| SEC-001 | LOW | reels-renderer-owner.js:324; home.js:430/:442 (H12-discovered sites — Home feed error paths, same class); **profile-view.js:213 (preview render-exception path `Error: ${e.message}` raw into innerHTML — H18-discovered site, same error-path class; only reachable via a render-section exception, exercised with benign stub data in the H18 suite)** | Reels error fallback + Home feed error states + profile preview error path render `e.message` raw into innerHTML (Supabase/JS error text — not user-stored; defense-in-depth concern only; discovered during H11 audit, Home sites added during H12 audit, profile site added during H18 audit) | OPEN (defer — error-path class) |

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
| H9-D2 | HIGH(class) | Username-rendering surface not yet assigned: mentions (check-mention.js:26), call UI (add-remote-tile-to-grid.js:17-18, show-call-history.js:37, handle-incoming-call.js:12, show-call-screen.js:47/:58), share-sheet user pickers (post-actions.js:136/:151), GC Info add-member search/suggestions (search-add-member.js:14, load-gcsuggestions.js:19); **close-friends.js:46 (privacy-modal following-list rows render u.username raw — H18-discovered site), show-blocked-list.js:15 (blocked-users rows render u.username raw — H18-discovered site), se-search-mention-users.js:48/:51 (story-editor mention-search rows render @u.username raw + seSelectMentionUser('${u.id}','${u.username}') JS-string arg — H18-discovered sites, mention family)** | raw username interpolation in HTML text + JS-string onclicks | Username-rendering hardening series (H18-family extensions) |
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

## 8. H13 — Story Viewer header username + reply placeholder XSS (this task)

### 8.1 Provenance audit — all Story Viewer rendering paths (2026-09-07, BEFORE fix application)

Data flow: `stories` table joined `profiles!stories_user_id_fkey(username,avatar_url)` at 4 fetch sites (home.js:76 main story rail · notifications.js:252 story-reply/reaction/mention deep-link · submit-story.js:181 post-publish · publish-story-editor.js:304 editor-publish) → `svData` (no transformation of username) → open-sv.js:11-15 per-user grouping → `svBuckets[].username` → renderSV template → `sv-hdr` innerHTML (:34 assignment, header) / `sv-reply-box` innerHTML (:195, reply input — rendered only when bucket.user_id !== ME.id, i.e. others' stories). Context classification per value: username = HTML text (:30) + double-quoted attribute (:195 — a quote in the payload breaks the attribute; a leading `"` fully breaks out and injects an executable element after the input tag); avatar_url = av() internal (C1 class); user_id / story.id = UUIDs in JS-string onclick args (DB-generated — safe by construction, established codebase treatment); created_at = ago() relative time; viewers count = numeric.

All 7 renderSV entry paths funnel through the single template (one construction site per sink — every path inherits both fixes): open-sv.js:28 (tray open) · next-sv.js:13 / prev-sv.js:13 (story nav) · next-user-sv.js:11 / prev-user-sv.js:11 (bucket nav) · toggle-sv-mute-owner.js:6 (mute re-render) · render-sv.js:13 (recursive bucket-skip).

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Header username div | render-sv.js:30 → :34 sv-hdr innerHTML | bucket.username | HTML text | **VULNERABLE — XSS-H13 sink #1 (fixed in-task)** |
| 2 | Reply-input placeholder attr | render-sv.js:195 sv-reply-box innerHTML | bucket.username | double-quoted attribute (others' stories only) | **VULNERABLE — XSS-H13 sink #2 (fixed in-task)** |
| 3 | Header avatar | render-sv.js:30 via av() | bucket.avatar_url + username first letter | av() internal (img src + onerror JS-string + 1-char text) | DEFERRED — XSS-C1 class (site added to C1 row) |
| 4 | goToProfile / showStoryActions / reactToStory onclicks | render-sv.js:30/:32/:195 | bucket.user_id, story.id | JS-string attrs | UUID (DB-generated) — safe by construction |
| 5 | ago() timestamp | render-sv.js:30 | story.created_at | relative-time text | safe |
| 6 | Viewers-count branch (own stories) | render-sv.js:191-193 | story.id + numeric count | JS-string attr + numeric text | safe (no username render — verified C11-C14) |
| 7 | Reply Enter handler / analytics upsert | render-sv.js:198-204/:209-211 | replyInp.value, ME.id | function args, not markup | safe |
| 8 | Progress bars / mute icon / nav zones / media loader | render-sv.js:20-38/:186 | numeric widths, ico() constants, static template | — | safe |
| 9 | Story viewers list | show-story-viewers.js:44 | u.username | HTML text | NOT H13 — XSS-H18 (separate issue/task) |
| 10 | Story actions modal | show-story-actions.js | storyId only + constants | — | safe (no username render) |
| 11 | Story overlay content (polls) | sv-append-overlays.js:44/:51 | overlay_data question/options | HTML text | NEW finding SEC-002 (recorded, deferred to future task) |
| 12 | Story overlay mention/link/text branches | sv-append-overlays.js:83/:90/:98 | ov.text | textContent assignment | safe (no HTML parsing) |
| 13 | svData re-population paths (refresh/re-entry) | home.js:83 / notifications.js:256 / submit-story.js:182 / publish-story-editor.js:305 | same svBuckets → same template | same sinks | covered by the fix |

### 8.2 H13 fix

`render-sv.js` (2 lines, esc() at the two audited sinks, esc semantics only, no other change):
- `:30` header username div: `+(bucket.username||'')+` → `+esc(bucket.username||'')+`
- `:195` reply-input placeholder: `placeholder="Reply to '+(bucket.username||'')+'..."` → `placeholder="Reply to '+esc(bucket.username||'')+'..."` (esc sufficient for the double-quoted attribute context — `"` → `&quot;` prevents the breakout)

esc() available: utils.js (index.html:211) loads before render-sv.js. **No harness changes required**: render-sv.js was already admitted to the branch2-only-safety-contract allowlist; the render-sv-referencing harnesses (toggle-sv-mute preparation/production-split, stories-seam preparation) all pass unchanged post-fix; no byte-parity harness pins the render-sv.js username/placeholder markup. Suite-tooling maintenance OUTSIDE the repo (scripts/, H9-H12 precedent): H11 focused E4 made evolution-tolerant (the M1 index row gains site additions from later tasks — the exact-string match is replaced by row-exists + OPEN + reels-content checks); H12 focused L-section re-anchored to the fixed hash d7becc7 with a worktree-state branch (original pre-commit H12 state OR committed-and-intact with later tasks free to dirty other files) — both re-ran green (H11 277/0 + NC 26/26; H12 176/0).

### 8.3 H13 verification summary

Vulnerability proven first (pre-fix disk = parent dbf00f9): all 5 owner-specified payloads rendered raw + executable at the :30 header div (element-level proof, 30/0), and raw/unescaped at the :195 placeholder with full attribute breakout for quote payloads — a leading `"` breaks the double-quoted attribute and injects an executable `<img onerror>` element into the reply box (browser-accurate parse-tree evidence). Post-fix focused suite 249 PASS / 0 FAIL (S-A header payload neutralization ×5; S-B placeholder payload neutralization ×5 incl. parse-level IMG/SCRIPT absence + intact parsed attribute; S-C combined/nullish/branch edges incl. own-story viewers-count branch + recursive bucket-skip; S-D 11-language multilingual byte-exact on both sinks; S-E adjacent-sink byte-identity — av() C1, ago, bars, nav, media, video mute button, own-story branch; S-F Story Viewer functional regression F1-F24 incl. progress bars, header nav, gestures/swipes, double-tap reaction, media lifecycle, reply Enter → sendStoryReply + REAL toast, analytics upsert, count query shape, re-render replacement, stopSVPlayback timer clear, mute-toggle re-render, zero listeners/channels; S-K esc contract; S-L hygiene incl. exactly-2-esc-wrap diff bound). Negative control vs parent dbf00f9: pre-fix VULNERABLE at both sinks (raw + executable + attr broken), post-fix esc-exact contrast, benign multilingual byte-identical pre/post. Full gates: prior H suites all green (H1 121/0, H1b 78/0, H4 114/0, H5 203/0, H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H12 176/0, H14 63/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family); app-load 10/10; listener/realtime harnesses 9/9; diff adds zero listeners/subscriptions.

---

## 9. H15 — Note Viewer username + note text XSS (this task)

### 9.1 Provenance audit — all Note Viewer rendering paths (2026-09-07, BEFORE fix application)

Data flow: `quick_notes` table row joined `profiles(username,avatar_url)` (note-viewer-owners.js:4, `.eq('id',noteId).single()`) → `note` object (no transformation of username or text) → single viewNote template literal (:21-68) → `overlay.innerHTML` → `document.body.appendChild` (:70). Write side: `note-text-inp` input → `submitNote` (notes-submission-owner.js:2 → :8 update / :21 insert) — NO write-side escaping (correct escape-at-sink architecture; arbitrary text storable). Second source: `profiles.username` (user-stored, unvalidated). Context classification per value: username = HTML text (:28); note text = HTML text (:32, rendered only when truthy — card omitted otherwise); avatar_url = av() internal (C1 class); user_id/noteId = UUIDs in JS-string onclick args (DB-generated — safe by construction, established codebase treatment); created_at = ago() relative time; viewCount = numeric; music metadata = XSS-M4 (M-tier, untouched).

All 5 viewNote entry paths funnel through the single template (one construction site per sink — every path inherits both fixes): profile.js:73 (own-profile active-note pill) · notes-bar.js:73 (own active note bubble) · notes-bar.js:83 (others' note bubbles) · load-notes-feed.js:74 (notes feed surface) · profile-view.js:388 (other-profile active-note pill). Each passes a DB UUID noteId (safe by construction).

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Note author username div | note-viewer-owners.js:28 | note.profiles?.username | HTML text | **VULNERABLE — XSS-H15 sink #1 (fixed in-task)** |
| 2 | Full note text card | note-viewer-owners.js:32 (card :31-33) | note.text | HTML text | **VULNERABLE — XSS-H15 sink #2 (fixed in-task)** |
| 3 | Author avatar | note-viewer-owners.js:26 via av() | profiles.avatar_url + username first letter | av() internal (img src + onerror JS-string + 1-char text) | DEFERRED — XSS-C1 class |
| 4 | goToProfile onclick | note-viewer-owners.js:25 | note.user_id | JS-string attr | UUID (DB-generated) — safe by construction |
| 5 | ago()/views line | note-viewer-owners.js:29 | note.created_at + numeric viewCount | relative-time text | safe |
| 6 | Music chip (title/artist/artwork/JSON onclick) | note-viewer-owners.js:35-38 | music metadata | HTML text + img src + JSON-in-single-quoted-onclick | DEFERRED — XSS-M4 (M-tier class, NOT H15) |
| 7 | Reaction emoji row + more-emoji picker | note-viewer-owners.js:43-44 | constant emoji + noteId UUID | JS-string attrs + text | safe (constants + UUID) |
| 8 | Reply input + send | note-viewer-owners.js:51-52 | noteId + note.user_id | JS-string attrs | UUID — safe by construction |
| 9 | Own-note Edit/Remove controls | note-viewer-owners.js:54-67 | constants + noteId | JS-string attrs | safe |
| 10 | Reactors list container | note-viewer-owners.js:41 → loadNoteReactorsList | rendered by note-reactors-list-owner.js | separate file | NOT H15 — XSS-H17 (separate issue/task) |
| 11 | Expired-note fallback | note-viewer-owners.js:5 | toast + loadNotesBar | no markup render | safe |
| 12 | removeMyNoteFromViewer | note-viewer-owners.js:82-101 | DB values only, no innerHTML render | — | safe (no markup render) |
| 13 | Notes bar surface itself (previews/usernames) | notes-bar.js:82/:86 | others' note text + usernames | HTML text | NOT H15 — XSS-H16 (separate issue/task) |
| 14 | Re-open / re-entry paths (viewer close → reopen, notes-bar refresh) | 5 entry paths re-invoke viewNote | same template | same sinks | covered by the fix |

SEC-002 (sv-append-overlays.js:44/:51, story overlay poll content) is a different file + different data source (stories.overlay_data) — NOT the H15 root cause; stays OPEN untouched per owner instruction.

### 9.2 H15 fix

`note-viewer-owners.js` (2 lines, esc() at the two audited HTML-text sinks, esc semantics only, no other change):
- `:28` author username div: `${note.profiles?.username}` → `${esc(note.profiles?.username)}` (esc nullish-safe — null/undefined profiles render empty instead of the pre-fix cosmetic "null"/"undefined" text, consistent with every prior H-fix esc() contract)
- `:32` full note text: `${esc(note.text)}` (inside the existing `note.text ?` truthy branch — card-omission behavior unchanged)

esc() available: utils.js (index.html:211) + constants.js (index.html:208) load before note-viewer-owners.js (index.html:1658). Harness maintenance required by the authorized change (established mechanism, H11 precedent): branch2-only-safety-contract-harness.js allowlist admission for note-viewer-owners.js (the file was NOT previously admitted — the audit-prescribed "allowlist admission required"). No byte-parity harness pins the note-viewer-owners.js username/text markup; all 12 file-referencing harnesses pin owner-function counts / load order / the autoPlayNoteMusic call only (all re-verified green post-change).

### 9.3 H15 verification summary

Vulnerability proven first (pre-fix disk = parent 0a6cd52, proof artifact scripts/h15_proof_result.txt): all 5 owner-specified payloads rendered raw + executable at BOTH the :28 username div and the :32 text card (raw IMG/SCRIPT elements created in parsed zones, onerror=alert(1) handler attribute surviving parse — 47/0 proof). Post-fix focused suite 296 PASS / 0 FAIL (S-A username payload neutralization ×5 incl. parse-level IMG/SCRIPT absence; S-B note-text payload neutralization ×5 incl. parse-level; S-C combined payloads + nullish/branch edges incl. own/other note branches, empty/null text card omission, views-count, expired path; S-D 11-language multilingual byte-exact on both sinks + UTF-8 byte preservation + long-string untruncated; S-E adjacent-sink byte-identity — av() C1 block, ago/views line, music chip (M4 deferred, raw title/artist unchanged), reply row, reaction row; S-F Note Viewer functional regression F1-F14 incl. view upsert shape, own-count query, reaction query, reactors-list load gating, music autoplay, myReaction highlight, expired-note toast+reload, backdrop dismiss, removeMyNoteFromViewer success + failure paths (cloudinary cleanup, audio pause, toasts), zero channels/listeners/intervals, re-open no-accumulation; S-K esc contract; S-L hygiene incl. exactly-2-esc-wrap + 2-line diff bound + load order). Negative control vs parent 0a6cd52: pre-fix VULNERABLE at both sinks (raw + element + executable, 10 checks/payload), post-fix esc-exact contrast, benign multilingual visible-identical pre/post. Full gates: prior H suites all green (H1 121/0, H1b 78/0, H4 114/0, H5 203/0, H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H12 176/0, H13 249/0, H14 63/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family); app-load 10/10; event-listener boundary, interval lifecycle, DM/chat protected readiness, notes protected readiness, and all 12 note-viewer-referencing harnesses pass; diff adds zero listeners/subscriptions/intervals.

---

---

## 10. H16 — Notes Bar XSS (TRACK A href/URL + TRACK B PLUS composer) (this task)

### 10.1 Provenance audit — all Notes Bar rendering paths (2026-09-08, BEFORE fix application)

**TRACK B (PLUS (+) composer → storage → receiver → rendering) data flow:** `note-text-inp` textarea (open-note-creator.js:15, maxlength 60, draft pre-fill `<`-escaped for display only — textarea is RCDATA, `</textarea` cannot form) → `window._noteTextDraft` (raw) → `submitNote` (notes-submission-owner.js:2 reads `.value.trim()`, :8 update / :21 insert — NO write-side escaping, correct escape-at-sink architecture; arbitrary text + emoji storable) → `quick_notes.text` (raw storage) → receiver reads (notes-bar.js:14-18 join `profiles(username,avatar_url)`; note-viewer-owners.js:4; load-notes-feed.js:23; check-user-active-note.js:5 → profile-view.js:339) → HTML-text sinks. Second value source: `profiles.username` (user-stored, unvalidated).

**All Notes Bar render paths funnel through the single `_renderNotesBarHtml` template (one construction site per sink — every path inherits the fixes):** dms-renderer-owner.js:13/:70 (initial DM parallel fetch+render) · refresh-dms-in-place.js:15/:37 (refresh) · setup-notes-realtime.js:6 (INSERT realtime → loadNotesBar when on dms tab) · note-viewer-owners.js:5/:100 (expired fallback + after remove) · note-deletion-owner.js:19 (after delete) · notes-reaction-owner.js:21 (after reaction) · notes-submission-owner.js:34 (after PLUS send) · loadNotesBar thin wrapper.

**TRACK A (href/URL) audit conclusion:** notes-bar.js and the whole notes family contain NO href construction — no `<a>` elements, no href attributes, no window.open/location assignment driven by note data; navigation is onclick JS-string (`viewNote('<uuid>')`, `goToProfile('<uuid>')`, `sendNoteReply('<uuid>','<uuid>')`, `reactToNote('<uuid>','<constant emoji>')`) with DB-generated UUID args — safe by construction (established H1–H15 codebase treatment). `sanitizeUrl()` (utils.js:344) exists but is NOT referenced by any notes-family file (only profile website rendering — separate family). URL-valued interpolations in the notes family classify as: av() img src via cldUrl passthrough (XSS-C1, deferred), music_artwork img src + music_preview_url JSON-in-onclick + `new Audio(url)` (XSS-M4, M-tier deferred), viewAvatarFullscreen onclick avatar_url (XSS-M1-class site addition). **Pre-fix executable-href vector (proven):** quote-breakout payloads (`"><a href="javascript:alert(1)">X</a>`, `"><img src=x onerror=alert(1)>`) interpolated raw at the unescaped :86/:90 zones mint REAL parsed `<a href="javascript:…">` / `<img onerror=…>` elements in the bar DOM — the browser-accurate parse-tree proof (h16_proof_result.txt). Pure scheme strings (javascript:/JaVaScRiPt:/JAVASCRIPT:/data:/vbscript:/mixed-case/percent-encoded/entity-encoded/leading-space/tab/newline variants) have no href sink to activate and render as literal text; the H16 esc() fix additionally entity-escapes them as inert text.

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Others' note text pill (slice 18) | notes-bar.js:86 | quick_notes.text (others) | HTML text | **VULNERABLE — XSS-H16 sink 1 (fixed in-task)** |
| 2 | Others' username span | notes-bar.js:90 | profiles.username | HTML text | **VULNERABLE — XSS-H16 sink 2 (fixed in-task; NO slice — full-length payloads mint complete elements + handlers, strongest pre-fix vector)** |
| 3 | Own PLUS-slot text pill (slice 16) | notes-bar.js:76 | quick_notes.text (own) | HTML text | **VULNERABLE (self-XSS severity, in-target-file PLUS composer output slot — fixed in-task; truncation window defangs >16-char payloads but short vectors like `<script src=//x>` (16 chars) minted real script elements pre-fix)** |
| 4 | Other-profile active-note pill text (slice 16) | profile-view.js:389 (text branch) | quick_notes.text (others) | HTML text | **VULNERABLE — XSS-H16 family site, receiver-side cross-user stored XSS (fixed in-task; same value + context + root cause as sink 1 — dedupe rule #5, site appended, no new ID)** |
| 5 | Note Viewer author username + full text | note-viewer-owners.js:28/:32 | username + quick_notes.text | HTML text | SAFE — FIXED in H15 (esc), negative-control re-verified |
| 6 | Notes feed username + text + music title | load-notes-feed.js:77/:78/:72 | username + text + music_title | HTML text | SAFE — already esc'd pre-H16 |
| 7 | Own-profile active-note pill text | profile.js:75 (text branch) | quick_notes.text (own) | HTML text | DEFERRED — self-XSS only (M6 own-profile class site addition; sender-side self-view, M-tier) |
| 8 | Own reaction emoji badge | notes-bar.js:88 (ledger :84) | quick_note_reactions.emoji (own) | HTML text | DEFERRED — XSS-C3 (accepted low, byte-identical untouched) |
| 9 | Composer draft re-display | open-note-creator.js:15 | own note.text (draft) | textarea RCDATA (`<`-escaped) | safe — RCDATA + `<`-escape prevents `</textarea` breakout |
| 10 | Own + others avatar blocks | notes-bar.js:75/:85 via av() | avatar_url + username first-letter | img src + onerror JS-string + text | DEFERRED — XSS-C1 class (av() review task) |
| 11 | Music note 🎵 indicator | notes-bar.js:77/:87 | music_title truthiness (constant glyph) | boolean → constant | safe (no value interpolated) |
| 12 | Note Viewer music chip (title/artist/artwork/JSON onclick) + composer music chip + music search rows | note-viewer-owners.js:35-38; render-note-music-section.js:11-17; search-music-for-note.js:13-25 | music metadata (API/own-composer) | HTML text + img src + JSON-in-onclick | DEFERRED — XSS-M4 class (site additions recorded) |
| 13 | Reactors list (note viewer) | note-viewer-owners.js:41 → note-reactors-list-owner.js | reactor username + typed emoji | HTML text | NOT H16 — XSS-H17 (separate task) |
| 14 | Reply flow → chat message | send-note-reply.js:23 → messages.text → load-msgs.js:104/:120/:143-144 | reply text (prefixed) | HTML text (chat renderer) | safe — chat rendering esc'd (H1 family) |
| 15 | onclick JS-string args (all bubbles/pills) | notes-bar.js:73/:83; profile-view.js:388; profile.js:73 | noteId/user_id UUIDs | JS-string attr | safe by construction (DB UUIDs; proven — note text never reaches an onclick attr) |
| 16 | viewAvatarFullscreen fallback onclick | profile-view.js:392 | avatar_url + username | single-quoted JS-string | DEFERRED — XSS-M1-class site addition (M-tier) |
| 17 | Personal "My Notes" modal (separate localStorage feature) | notes.js:57-58 | localStorage myNotes title/content | HTML text | DEFERRED — NEW XSS-C9 (self-XSS only, accepted low) |
| 18 | Expired-note fallback / remove / re-render paths | note-viewer-owners.js:5/:82-101 → loadNotesBar | re-render via single template | same sinks as 1-3 | covered by the fix (funnel paths listed above) |

### 10.2 H16 fix

`notes-bar.js` (3 lines, esc() at the three audited HTML-text sinks, esc semantics only, no other change):
- `:76` own PLUS-slot pill: `${(activeNote.text||'').slice(0,16)}` → `${esc((activeNote.text||'').slice(0,16))}` (pre-existing `||''` nullish guard preserved — esc is also nullish-safe)
- `:86` others' pill: `${(n.text||'').slice(0,18)}` → `${esc((n.text||'').slice(0,18))}`
- `:90` others' username: `${n.profiles?.username||''}` → `${esc(n.profiles?.username||'')}`

`profile-view.js` (1 line):
- `:389` other-profile pill text branch: `profileActiveNote.text.slice(0,16)` → `esc(profileActiveNote.text.slice(0,16))` (music fallback branch in the same pill untouched — M4 class; esc() global available — utils.js loads at index.html:211, before profile-view.js :233 and notes-bar.js :320)

No allowlist admission required (H16 edits no NEW files into Branch2 — notes-bar.js and profile-view.js both pre-existed; branch2-only-safety-contract harness failure set unchanged = owner main-pin family only).

### 10.3 H16 verification summary

Vulnerability proven first (pre-fix disk = parent 687d8d0, proof artifact scripts/h16_proof_result.txt): TRACK A — breakout payloads minted real parsed `<a href="javascript:alert(1)">` / `<img onerror>` elements in the bar DOM (parse-level, 5 URL-payload families × element+handler proofs); TRACK B — stored payload rendered raw at :76/:86/:90 and profile-view :389 (username zone = full payload, complete SVG+onload elements minted; pill windows = raw string + short truncation-fitting vectors `<script src=//x>` (16 chars) minting real script elements). Post-fix focused suite 445 PASS / 0 FAIL (TA URL payload neutralization ×17 incl. no-href/no-`<a>` parse proofs, scheme-as-literal-text, esc-exact pills, av() img-src C1 behavior documentation, UUID onclick isolation; TB-flow full receiver-flow stored-XSS neutralization; TB-payloads ×13 × 3 sinks; TB-short truncation-fitting vectors ×5; TB-legit 15-value multilingual/emoji/special byte-exact + UTF-8 round-trip + no-mojibake; PV-pill profile-view fragment + music-branch byte-identity; PJ-pill own-pill deferred byte-identity; S-F functional F1-F7 incl. PLUS empty/active states, viewNote UUID onclicks, music 🎵, C3 badge byte-identity, mutual-follow filter, per-user dedupe, close_friends, repeated-render no-accumulation, render-only parity, nullish guards; S-E adjacent-sink byte-identity outside fixed zones; S-K esc contract; S-L hygiene — exactly-3 esc wraps in notes-bar.js + 1 in profile-view.js, 1-line diff bound in profile-view, profile.js untouched, zero new listeners/channels/intervals; NEG negative control vs parent 687d8d0 — parent re-proven VULNERABLE (≥20 zone-hits), disk esc-exact contrast, benign multilingual visible-identical pre/post). Full gates: prior H suites all green (H1 121/0, H1b 78/0, H4 114/0, H5 203/0, H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H12 176/0, H13 249/0, H14 63/0, H15 296/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family); app-load 10/10; event-listener boundary, interval lifecycle, dm-chat-realtime protected readiness, dms-realtime, notes-submission-reactions-protected-readiness, index-html-tag/root-deployment/external-resource-url integrity harnesses all pass; diff adds zero listeners/subscriptions/intervals.

## 11. H17 — Note Reactors List XSS (reactor username + typed reaction emoji) (this task)

### 11.1 Provenance audit — all note-reactors rendering paths (2026-09-08, BEFORE fix application)

**RECEIVER FLOW (stored XSS, TARGETED at the note OWNER — the only user who can see this surface):** the reactors-list container is gated behind `isOwnNote` (note-viewer-owners.js:41 — `<div id="note-reactors-list">` renders ONLY on the author's own note; :73 invokes `loadNoteReactorsList(noteId)`). Attacker (User A) reacts to the owner's (User B's) note via (a) the 5 quick emoji buttons (❤️😂😮🔥👀 — constants, safe) or (b) openMoreEmojiPicker native input (open-more-emoji-picker.js:10, maxlength=4 — CLIENT-SIDE only) → submitNativeEmojiReaction (:10) → `reactToNote(noteId, emoji)` → notes-reaction-owner.js:17 upsert `{note_id, user_id: ME.id, emoji}` (quick_note_reactions, onConflict `note_id,user_id`) — NO write-side validation; DB-write bypass = arbitrary emoji string. Second value source: `profiles.username` joined via `.select('emoji,user_id,profiles(username,avatar_url)')` — user-stored, unvalidated anywhere (XSS-H18/D2 provenance class, this surface only). Owner (User B) opens own note → viewNote → :73 loader → :8 container lookup → :16 `container.innerHTML =` count header + `reactions.map(...)` rows — single template construction, every open/reopen/reaction-refresh path funnels through it and inherits both fixes.

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Reactor username div | note-reactors-list-owner.js:20 | profiles.username (reactor's, FK join) | HTML text | **VULNERABLE — XSS-H17 sink 1 (fixed in-task; NO truncation — full-length payloads mint complete elements + handlers pre-fix)** |
| 2 | Typed reaction "emoji" div | note-reactors-list-owner.js:21 | quick_note_reactions.emoji | HTML text | **VULNERABLE — XSS-H17 sink 2 (fixed in-task; maxlength=4 is client-side only — DB-write bypass = arbitrary string; 3-char UI-window vectors like `<b>` verified pre-fix)** |
| 3 | Row avatar block | note-reactors-list-owner.js:19 via av() | avatar_url + username first-letter | img src + onerror JS-string + text | DEFERRED — XSS-C1 class (av() review task; byte-identity disk vs parent proven) |
| 4 | Row onclick goToProfile JS-string | note-reactors-list-owner.js:18 | r.user_id | single-quoted JS-string attr | safe by construction — user_id upserted from ME.id (auth session uid, not free text — write path verified notes-reaction-owner.js:17); username/emoji NEVER enter the JS-string (proven) |
| 5 | Count header | note-reactors-list-owner.js:16 | reactions.length + constant grammar (REACTION/REACTIONS) | number + constant | safe |
| 6 | Empty state | note-reactors-list-owner.js:12 | constant string | HTML constant | safe |
| 7 | Container gating + loader invocation | note-viewer-owners.js:41 (isOwnNote) → :73 | — | — | receiver = note OWNER only (targeted stored XSS; own-note re-render paths all funnel through the same loader) |
| 8 | Reaction write path — quick buttons | note-viewer-owners.js:43-44 → reactToNote | 5 constant emojis | constant | safe (constants) |
| 9 | Reaction write path — typed input | open-more-emoji-picker.js:10 (maxlength=4 client-side only) → submit-native-emoji-reaction.js:10 → notes-reaction-owner.js:17 upsert | emoji unvalidated | storage write | arbitrary string storable — receiver-side esc() is the ONLY defense (escape-at-sink architecture confirmed) |
| 10 | Query shape | note-reactors-list-owner.js:3-6 | emoji, user_id, profiles(username,avatar_url) ordered created_at desc | — | passthrough of stored values — no transformation (row order = query order, verified F22) |
| 11 | Adjacent: own reaction badge | notes-bar.js:88 | quick_note_reactions.emoji (own) | HTML text | DEFERRED — XSS-C3 (self-XSS only, accepted low — NOT H17, untouched) |
| 12 | Adjacent: Note Viewer username/text | note-viewer-owners.js:28/:32 | username + quick_notes.text | HTML text | SAFE — FIXED in H15 (esc), re-verified green post-H17 |
| 13 | Adjacent: Notes Bar pills/usernames | notes-bar.js:76/:86/:90 + profile-view.js:389 | quick_notes.text + username | HTML text | SAFE — FIXED in H16 (esc), re-verified green post-H17 |
| 14 | Adjacent: reply flow → chat | send-note-reply.js → messages.text → load-msgs.js | reply text | HTML text (chat renderer) | safe — chat rendering esc'd (H1 family) |
| 15 | SEC-002 relationship | sv-append-overlays.js:44/:51 | stories.overlay_data | unrelated file + unrelated data source | NOT the H17 root cause — stays OPEN untouched (dedupe rule: quick_note_reactions/profiles vs stories.overlay_data) |

### 11.2 H17 fix

`src/features/note-reactors-list-owner.js` (2 lines, esc() at the two audited HTML-text sinks, esc semantics only, no other change — line count identical, exactly 2 insertions/2 deletions):
- `:20` reactor username: `${r.profiles?.username||'User'}` → `${esc(r.profiles?.username||'User')}` (pre-existing `||'User'` fallback preserved — esc is also nullish-safe)
- `:21` typed reaction emoji: `${r.emoji}` → `${esc(r.emoji)}`

Harness maintenance required by the authorized change (established mechanism, H15 precedent):
- `branch2-only-safety-contract-harness.js` — allowlist admission for note-reactors-list-owner.js (the file was NOT previously admitted — the audit-prescribed "allowlist admission required" in the ledger row)
- `note-reactors-list-production-split-contract-harness.js` — parity pin updated from "origin/main exactly" to "origin/main + EXACTLY the H17 esc delta" (replace-based expected owner over the two wrapped interpolations — any additional drift still fails the harness)
- esc() global available: utils.js (index.html:211) loads before note-reactors-list-owner.js (index.html:1656)

### 11.3 H17 verification summary

Vulnerability proven first (pre-fix state = parent 541196a source, proof artifact scripts/h17_proof_result.txt — prove mode reads parent content so disk≠parent does not mask the pre-fix behavior): 24 username payload variants (img-onerror, script, svg-onload, div-onclick, dq/sq quote-breakout img + script, domain variants, mixed-case, iframe, anchor-js-href, multiline, unicode-fullwidth, entity-encoded, attr-fragment, quote-amp-only) + 9 typed-emoji variants rendered raw-substring at BOTH zones, minting REAL parsed elements with surviving handler attributes (svg-onload minted `<svg onload=…>` at the username zone; img-onerror minted `<img onerror=…>` at the emoji zone; ≥25 zone-hits; PROVE RESULT 3/3 — H17_PARENT_VULNERABLE=PROVEN). Post-fix focused suite 237 PASS / 0 FAIL (S-A full receiver-flow stored-XSS neutralization — zero raw substring, parse tree contains 0 IMG/SCRIPT/SVG/IFRAME/A, zero onerror/onload attrs anywhere, esc-exact zones, visible text decodes back to the literal payloads; S-B 19-payload username matrix — esc-exact + decoded identity + text-only children; S-C 9-payload typed-emoji matrix incl. 3-char ui-window vectors (`<b>`) minting zero elements; S-D 19 legit emoji byte-exact identity — esc() does NOT entity-encode emoji; S-E 15-language multilingual (English/Hindi/Hinglish/Punjabi/Urdu/Arabic/accented/CJK/Russian/quotes/amp-angle/emoji-name/mixed/newlines/long-300) esc-exact + UTF-8 round-trip + no-mojibake on both zones; S-F functional F1-F22 incl. empty-state constant, singular/plural grammar, upsert repeat-reactor single-row semantics, reopen+refresh re-render no-accumulation, missing-container early return, query-error empty state, null-avatar av() fallback, row order, zero new listeners/subscriptions/intervals/timeouts, zero console errors; S-G hygiene — line count identical, exactly-2 esc wraps at :20/:21, av() call count unchanged, onclick construction byte-identical, benign fixture container byte-identical disk vs parent; S-H negative control vs parent 541196a — parent re-proven VULNERABLE (5/5 payload families mint elements at both sinks), disk esc-exact contrast for the same payloads, benign multilingual visible-identical pre/post; S-I esc() contract on REAL utils.js — 5-entity reference on 34 values + nullish-safe + non-string coercion; S-J XSS-C1 class documentation — av() block byte-identical disk vs parent, malicious avatar_url still mints img (pre-existing C1 class, deferred, NOT fixed by H17, no C1 regression added); S-K JS-string/onclick context — onclick zone strictly `closeNoteViewer();goToProfile(UUID)`, user_id = auth UUID by construction, write path verified, maxlength=4 client-side-only documented). Full gates: prior H suites all green (H1 121/0, H1b 78/0, H4 114/0, H5 203/0, H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H12 176/0, H13 249/0, H14 63/0, H15 296/0, H16 445/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family: branch2-final-readiness / branch2-only-safety / deletion-fallback / dms-renderer / particle-split); app-load 10/10; event-listener boundary, interval lifecycle, dm-chat-realtime protected readiness, dms-realtime, notes-submission-reactions-protected-readiness, index-html-tag-integrity, external-resource-url-integrity, and the note-reactors-list-production-split parity harness (origin/main + esc delta) all pass; diff adds zero listeners/subscriptions/intervals.

## 12. H18 — Profile / Follow-list / Story-viewers username+full_name XSS (this task)

### 12.1 Provenance audit — all H18 rendering paths (2026-09-08, BEFORE fix application)

**WRITE PATH (both value sources, client-side-only constraint):** settings.js `saveEdit()` (:524-560) collects username/full_name/bio/website from the edit modal → `profiles` update. Username validation = `length>=3` + `^[a-zA-Z0-9_.]+$` — CLIENT-SIDE ONLY (settings.js:532-539; DB-write bypass = arbitrary string). **full_name has NO validation at all** (trim only, settings.js:526-529). Receiver-side esc() is the only defense (escape-at-sink architecture, H1-H17 consistent).

**RECEIVER FLOWS (stored XSS):** (1) PROFILE — any User B tapping attacker A anywhere (post author, notification sender, DM peer, explore/universal-search row, follow-list row, story-viewer row — ALL entry paths pass DB UUIDs, safe by construction) → `showUserProfile(UUID)` → `showProfilePreview` (preview template :156/:160 normal, :88/:92 when blocked either way — Instagram-style name-visibility even when blocked) → `openFullProfile` (full template :376/:403 normal, :276/:298/:302 blocked shell). (2) FOLLOW LIST — User B opens Followers/Following stats (own profile profile.js:107 or other profile profile-view.js:395) → `showFollowList(userId,type)` → `follows` join `profiles!follows_{uk}_fkey(username, avatar_url, id)` (follow-list.js:23; type-inversion verified) → rows render `u.username` (:34); list contains A whenever A follows / is followed by the listed user. (3) STORY VIEWERS — story OWNER only (render-sv.js:141 swipe-up + :190 'Viewed by N people' button, both gated `bucket.user_id === ME.id`); attacker A merely VIEWS B's story (story_views row, no write validation) → `story_views` join `profiles!story_views_viewer_id_fkey` (show-story-viewers.js:33) → rows render `u.username` (:44) — same targeted-vs-owner pattern as H17.

| # | Rendering path | File:line | Value(s) | Context | Verdict |
|---|---------------|-----------|---------|---------|---------|
| 1 | Preview name (blocked either way) | profile-view.js:88 | prof.full_name \|\| prof.username | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 2 | Preview @username (blocked) | profile-view.js:92 | prof.username | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 3 | Preview name (normal) | profile-view.js:156 | prof.full_name \|\| prof.username | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 4 | Preview @username (normal) | profile-view.js:160 | prof.username | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 5 | Blocked full-profile top bar | profile-view.js:276 | gatedProf?.username \|\| 'User' | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 6 | Blocked full-profile name | profile-view.js:298 | gatedProf?.full_name \|\| gatedProf?.username \|\| 'User' | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 7 | Blocked full-profile @username | profile-view.js:302 | gatedProf?.username \|\| 'user' | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 8 | Full-profile top bar | profile-view.js:376 | prof.username | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 9 | Full-profile bio-section name | profile-view.js:403 | prof.full_name (renders when ≠ username) | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task; H18 site addition — same file/class as the 8 ledger-cited sinks, recorded per dedupe rule #5)** |
| 10 | Follow-list row username | follow-list.js:34 (ledger cites :33 — 1-line drift, unambiguous by content) | u.username (follows join) | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task)** |
| 11 | Story-viewer row username | show-story-viewers.js:44 | u.username (story_views join) | HTML text | **VULNERABLE — XSS-H18 sink (fixed in-task; receiver = story OWNER, render-sv.js:141/:190 gate)** |
| 12 | Preview/full av() avatar blocks | profile-view.js:82/:150/:286/:391, follow-list.js:33, show-story-viewers.js:43 | avatar_url + username first-letter | img src + onerror JS-string + text | DEFERRED — XSS-C1 class (byte-identity disk vs parent proven, H18 S-F) |
| 13 | viewAvatarFullscreen onclick | profile-view.js:392 | prof.avatar_url + prof.username | single-quoted JS-string attr | DEFERRED — XSS-M1/H9-D1 class (H16-recorded site; byte-identity disk vs parent proven) |
| 14 | Preview cover style | profile-view.js:62 | prof.cover_url | single-quoted CSS url() inside double-quoted style attr | DEFERRED — XSS-M1-class site addition (H18-discovered) |
| 15 | Full-profile cover img | profile-view.js:267/:366 | gatedProf?.cover_url / prof.cover_url | img src (cldUrl) | DEFERRED — XSS-M1-class site additions (H18-discovered) |
| 16 | Preview bio | profile-view.js:135 safeBio | prof.bio | HTML text (`<`-only partial escape) | DEFERRED — XSS-M2 (adequate for text context; esc-consistency fix prescribed) |
| 17 | Full-profile bio | profile-view.js:408 linkify(prof.bio) | prof.bio | HTML text, NO escaping (linkify wraps URLs only) | DEFERRED — XSS-M2 site addition (H18-discovered, cross-user bio path — recorded, NOT H18: bio ≠ username/full_name) |
| 18 | Preview render-error path | profile-view.js:213 | e.message | HTML text | DEFERRED — SEC-001-family site addition (error-path class; benign-only in stub) |
| 19 | Posts-grid img src | profile-view.js:443/:501/:506 | p.media_url | img src | DEFERRED — XSS-M1 (H11-recorded) |
| 20 | Profile navigation onclicks | profile-view.js :124/:205/:417-:419/:434-:436 etc., follow-list.js:32, show-story-viewers.js:42 | userId / u.id / story.id (DB UUIDs) | JS-string attrs | safe by construction — all callers pass auth.users.id UUIDs (notifications, explore, universal-search, post-actions, follow-list, story-viewers, sv-append-overlays verified) |
| 21 | H16-fixed note pill | profile-view.js:389 | profileActiveNote.text | HTML text | SAFE — FIXED in H16 (esc preserved, re-verified byte-identical) |
| 22 | Adjacent user-list surfaces | close-friends.js:46, show-blocked-list.js:15, se-search-mention-users.js:48/:51 | u.username (+ JS-string arg) | HTML text + JS-string | DEFERRED — H9-D2 username-rendering class site additions (H18-discovered; recorded, NOT fixed — settings/privacy modals, outside the H18 ledger row's 3 files) |
| 23 | Search/profile result surfaces | explore.js:128-:131 (H10-10), universal-search.js:111-:115 (H10-11) | u.username + u.full_name | HTML text | DEFERRED — existing OPEN rows (MEDIUM, "H18-family sweep" owner) — dedupe rule: NOT absorbed into H18 |
| 24 | Own-profile surfaces | profile.js:87-:98 (M6), memories.js:59/:66 (H10-6) etc. | own username/full_name | HTML text | DEFERRED — self-XSS classes (M6, H10-6/7/8) — receiver = self |
| 25 | Share-sheet pickers / GC suggestions / mentions / call UI | post-actions.js:136/:151, load-gcsuggestions.js:19, check-mention.js:26, show-call-screen.js:47/:58 … | usernames | HTML text + JS-strings | DEFERRED — H9-D2 class (recorded) — H18-family extensions task |
| 26 | news-feed.js avatar attribution | news-feed.js:38-:39 | prof.username | HTML text | SAFE — already esc'd (verified H10) |

Shared-renderer analysis: each H18 file owns its own template (no shared username renderer between profile-view / follow-list / show-story-viewers); the only shared component is av() (XSS-C1 class, deferred). No global username migration performed (per scope rules).

### 12.2 H18 fix

esc() at exactly the 11 audited HTML-text sinks (esc semantics only, nullish-safe, no template restructure — line counts identical; 11 insertions/11 deletions across 3 files):
- profile-view.js (9): `:88` `${esc(prof.full_name || prof.username)}`, `:92` `@${esc(prof.username)}`, `:156`/`:160` (same two patterns, normal path), `:276` `${esc(gatedProf?.username || 'User')}`, `:298` `${esc(gatedProf?.full_name || gatedProf?.username || 'User')}`, `:302` `@${esc(gatedProf?.username || 'user')}`, `:376` `${esc(prof.username)}`, `:403` `${esc(prof.full_name)}`
- follow-list.js (1): `:34` `${esc(u.username)}`
- show-story-viewers.js (1): `:44` `'+esc(u.username)+'`

Harness maintenance required by the authorized change (established mechanism, H15/H17 precedent):
- `branch2-only-safety-contract-harness.js` — allowlist admission for **follow-list.js** (the ledger-prescribed "follow-list needs allowlist admission"; profile-view.js and show-story-viewers.js were already admitted)
- No content-parity harness pins the username slots of these 3 files (follow-list-contract pins signatures/markers only; stories-seam pins surface markers only; clipboard-interaction pins clipboard counts only) — all re-verified PASS
- esc() global available: utils.js (index.html:211) loads before follow-list.js (:231), profile-view.js (:233), show-story-viewers.js (post-:355 block)

### 12.3 H18 verification summary

Vulnerability proven first (pre-fix state = parent 0b06ea1 sources via `git show`, proof artifact scripts/h18_proof_result.txt): 40/40 PROVE — 4 payload families (svg-onload, img-onerror, script, dq-breakout-img) × 10 flow rows (preview username/full_name × blocked/normal, full username/full_name × blocked/normal, follow-list, story-viewers): raw payload present AND real parsed elements minted with surviving handler attributes at every sink (svg 6 vs benign 5, img 1 vs 0, script 1 vs 0, handlerEls 8 vs 7 — comparative census vs benign baseline). Post-fix focused suite **457 PASS / 0 FAIL** (S-A full two-user receiver flow, 5 payload families × 10 flows: parse-tree zero minted elements (comparative census === benign), zero handler-attr drift, raw absent, escRef present, zone === escRef; S-B 21-payload username matrix × 6 surfaces — img/script/svg/iframe/dq+sq breakouts/mixed-case/anchor-js-href/multiline/unicode-fullwidth (esc preserves fullwidth — literal text, no minting)/entity-encoded/attr-fragment/quote-amp-angle; S-C 21-payload full_name matrix × 4 profile surfaces — separate provenance path, zone === escRef on the full_name zones; S-D 15-language multilingual (English/Hindi/Hinglish/Punjabi/Urdu/Arabic/accented/CJK/Russian/quotes/amp-angle/emoji/mixed/whitespace/long-300) — byte-exact zones + UTF-8 round-trip + no mojibake; S-E functional F1-F28 — preview/full/follow/viewer opens, username/full_name display, counts, follow-state labels, follow/unfollow UI, query type-inversion (followers vs following verified on the db builder), multiple users no duplicates, empty states, refresh/re-render idempotence, repeat-open no accumulation, blocked shell, not-found, nullish fallbacks (User/user), full_name-missing → username fallback, render-error path, zero new listeners/intervals/channels; S-F deferred-class byte-identity — benign rich profile (bio/website/cover/avatar/verified/posts) renders byte-identical parent vs disk on preview AND full; :392 viewAvatarFullscreen onclick byte-identical; av() zone byte-identical; follow/viewers byte-identical; S-G esc() contract on REAL utils.js (5-entity reference, nullish-safe, Unicode-preserving); S-H hygiene — exactly 11 esc wraps (9+1+1), H16 pill esc preserved, diff bounds exactly 9/1/1 lines vs parent; NEG — parent re-proven vulnerable (raw + minted SVG), disk esc-exact contrast, benign multilingual identical). Full gates: ALL prior H suites green (H1 FIXED, H1b FIXED, H4 114/0, H5 ALL GREEN, H6 84/0, H7 91/0, H8 154/154, H9 PASS, H10 247/0 + NC 29/29, H11 277/0 + NC 26/26, H12 176/0, H13 249/0, H14 63/0, H15 296/0, H16 446/0 — L.3 evolution-proofed per H9–H12 suite-tooling precedent: historical H16 delta re-anchored to immutable commit 541196a + new stricter L.3b proving disk evolution = sanctioned H18 esc-wraps ONLY, product code never changed for tests, H17 237/0); 322 regression 317/5 byte-identical to baseline (all 5 = owner main-pin family: branch2-final-readiness / branch2-only-safety / deletion-fallback / dms-renderer / particle-split; both failure reasons re-verified); app-load 10/10; event-listener boundary, interval lifecycle, dm-chat-realtime protected readiness, dms-realtime, notes-submission-reactions-protected-readiness, index-html-tag-integrity, external-resource-url-integrity, follow-list-contract, stories-seam-preparation, clipboard-interaction all PASS; diff adds zero listeners/subscriptions/intervals.

## 13. H19 — Nova AI panel + Nova AI response rendering path XSS (this task)

### 13.1 Provenance audit — content model, trust boundary, and sink inventory (2026-09-08, BEFORE fix application)

**Content model determination (runtime source of truth, per task mandate — NOT inferred from prompt/docs):**
the Nova AI pipeline contains NO Markdown parser, NO linkify, NO sanitizer (grep-verified: exactly 2
bigmodel fetch sites — call-nova-ai.js:12 and nova-universe.js:66; both `await resp.json()` single-shot;
the only "sanitization" is call-nova-ai.js:30-44 keyword redaction + competitor-name replacement, which
never touches markup). All producers are plain text (Hinglish + emojis + \n; system prompt demands
short Hinglish replies). No caller ever passes intentional HTML through `appendNovaMsg`. The panel
welcome message is static index.html:56 markup (outside appendNovaMsg); `nova-user-name` is set via
textContent (nova-ai.js:37 — safe API). `.nova-msg` CSS (premium.css:86) has no
`white-space:pre-wrap`, so \n already visually collapses today — esc() preserves that display
byte-for-byte. => Intended model = **PLAIN TEXT**; fix strategy A (esc at sink, preserve text).
No streaming implementation exists (both API paths single-shot; no SSE/getReader/ReadableStream —
D3 check). No storage/history/reload path exists for panel messages: `novaHistory` is an in-memory
array (never persisted; storage-key surface pins only nova-ai-pos / nova-fab-* / nova-current-mood),
panel close/reopen toggles a CSS class without re-rendering, and page reload resets the panel to the
static welcome markup (E1-E5 checks). Chunk-split and reopen tests were still executed for evidence.

**Trust model answers (task section 10):** (A) AI output is NOT trusted-by-design — nothing sanitized
it and it rendered as live HTML pre-fix. (B) YES — the user prompt is reflected (:219 own message,
command echoes :353/:585/:605). (C) YES — other users' DB usernames reach the panel through command
responses (:336/:341/:351/:647). (D) YES — DB content reaches the panel (same paths + posts.caption
via the translate modal :104). (E) YES — external model output (GLM) reaches both the panel (:251)
and the translate modal (:108). (F) Pre-fix the AI output COULD contain arbitrary HTML and it executed.
(G) HTML intentionally supported: NO. (H) Markdown intentionally supported: NO. (I) Plain text only: YES.
(J) Sanitized before rendering: NO. (K) No sanitizer at all; the AI call is client-side.

| # | Rendering path | File:line | Data source | Context | Pre-fix state |
|---|----------------|-----------|-------------|---------|---------------|
| 1 | Panel AI response (typed) | nova-ai.js:162 via :251 | GLM API content (prompt-shapable) | HTML text (innerHTML) | **VULNERABLE — H19 core sink** |
| 2 | Panel AI response (voice) | nova-ai.js:162 via voice-assistant.js:155 | GLM API content / cmdResponse | HTML text | **VULNERABLE — same sink** |
| 3 | Panel AI fallback | nova-ai.js:162 via :251 (callNovaAI throw → getLocalAIResponse) | canned constants + own-username greeting (local-ai-response.js:51) | HTML text | VULNERABLE sink; benign producers (own username = self-XSS class, now esc-covered) |
| 4 | Panel user message | nova-ai.js:162 via :219 | own typed/voice text (`<`-pre-escaped only) | HTML text | partial (old XSS-C2) — now full esc |
| 5 | Panel sensitive-query canned | nova-ai.js:162 via :226 | constant | HTML text | SAFE producer, VULNERABLE sink |
| 6 | Panel command: contact list | nova-ai.js:162 via :234 ← :336 | follows join profiles.username | HTML text | **VULNERABLE — cross-user stored XSS** |
| 7 | Panel command: open-chat match | :234 ← :341 | follows join profiles.username | HTML text | **VULNERABLE — cross-user stored** |
| 8 | Panel command: similar list | :234 ← :351 | follows join profiles.username | HTML text | **VULNERABLE — cross-user stored** |
| 9 | Panel command: friend recs | :234 ← :647 | profiles.username (fof query) | HTML text | **VULNERABLE — cross-user stored** |
| 10 | Panel command: caption/reply echo | :234 ← :585/:605 | own input topic/context | HTML text | self-input, now esc-covered |
| 11 | Panel command: profile-analyzer error | :234 ← :727 | e.message | HTML text | SEC-001-class reflection, now esc-covered by sink |
| 12 | Voice constants | voice-assistant.js:74/:242 via sink | constants | HTML text | SAFE producer |
| 13 | Translate modal ORIGINAL | nova-universe.js:104 | posts.caption (DB, cross-user) | HTML text (mbody.innerHTML) | **VULNERABLE — posts.caption class site (H10-2 family)** |
| 14 | Translate modal TRANSLATED | nova-universe.js:108 | GLM translation output (prompt embeds posts.caption → prompt injection) | HTML text | **VULNERABLE — H19 AI-response site** |
| 15 | Translate modal lang label | nova-universe.js:107 | developer constant langs (post-actions.js:46-59) | HTML text | SAFE |
| 16 | Typing indicator | nova-ai.js:174 | constant spans | HTML text | SAFE |
| 17 | Panel header name | nova-ai.js:37 | PROF.username via textContent | textContent | SAFE |
| 18 | Universe hub / dynamic island / moodChip | nova-universe.js:10/:63, :137; nova-ultra-patches.js:46 | constants / numeric count / currentMood (fixed-enum OR self-localStorage) | innerHTML | SAFE producers; currentMood localStorage path = XSS-C9-class site addition (deferred) |
| 19 | AI caption generator output | ai-generators.js:22/:38 | GLM response → capinp.value | textarea .value (NOT an HTML sink) | SAFE by sink type; caption later rendered by posts family (formatCaption esc) |
| 20 | AI journal | ai-journal.js:12/:75 | static mock constants | innerHTML | SAFE (no AI API output involved) |
| 21 | translatePost error toast | nova-universe.js:93 | e.message → toast() | textContent (no iconName) | SAFE by sink type (verified G13) |
| 22 | callNovaAI redaction | call-nova-ai.js:30-44 | API content | string filter | NOT a sanitizer (documented; defense-in-depth only) |

Shared-renderer analysis: `appendNovaMsg` is THE single shared renderer for the entire panel —
both the typed pipeline (nova-ai.js sendNovaMsg) and the voice pipeline (voice-assistant.js
processVoiceConversationMsg), user + AI + command content models, 8 production call sites. No other
file renders panel messages. The translate modal is the one additional Nova-AI-response surface
(nova-universe.js, modal variant). esc() global available: utils.js (index.html:211) loads before
nova-ai.js (:217), voice-assistant.js (:310), nova-universe.js (:309).

### 13.2 H19 fix

Minimal sink-level fix (shared-renderer principle — the ledger's "esc() at appendNovaMsg call
sites" prescription strengthened to the single choke point; "or textContent" alternative rejected
to keep innerHTML-assignment semantics and the established esc() architecture):

- nova-ai.js:162: `div.innerHTML = text;` → `div.innerHTML = esc(text);`
- nova-ai.js:219: `appendNovaMsg(text.replace(/</g,'&lt;'), false);` → `appendNovaMsg(text, false);`
  (pre-escape removed — esc() at the sink is the single escaping stage; removing avoids
  double-escaping and upgrades the old XSS-C2 `<`-only partial escape to full esc)
- voice-assistant.js:139: same pre-escape removal (voice pipeline user message)
- nova-universe.js:104: `${original}` → `${esc(original)}` (translate modal ORIGINAL slot)
- nova-universe.js:108: `${translated}` → `${esc(translated)}` (translate modal TRANSLATED slot)
- docs/branch2-only-safety-contract-harness.js: allowlist admission for src/features/nova-ai.js +
  src/features/voice-assistant.js (ledger-prescribed "allowlist admission"; nova-universe.js
  already admitted). Harness still fails at the pre-existing stale origin/main pin
  (ef418007 ≠ owner df54898) BEFORE the allowlist check — failure set and reason remain
  byte-identical to the documented baseline.

5 production line-edits across 3 files + 1 harness allowlist line; 5 insertions / 5 deletions in
production files. No other file touched. Deferred classes untouched: showNovaUniverseHub,
showDynamicIsland, moodChip (C9-class), ai-journal, local-ai-response.js, ai-context.js,
call-nova-ai.js, show-nova-universe-overview.js, nova-ultra-patches.js, ai-generators.js
(byte-identity proven in J10/J12).

### 13.3 H19 verification summary

Vulnerability proven first (pre-fix state = parent a1e8027 sources via `git show`, proof artifact
scripts/h19_proof_result.txt): PROVE 227 PASS / 0 FAIL — 20 XSS payload variants (img-onerror,
svg-onload, details-ontoggle, div-onclick, anchor-javascript-href, dq/sq/backtick breakouts,
iframe-javascript, math-mtext-script, script, mixed-case, multiline/whitespace, entity-encoded,
data-URL anchor, entity-parens handler, double-angle, document.domain) × 5 receiver flows
(panel API response, voice AI response, command DB-username list, user echo, translate modal both
slots): payloads with raw tag syntax minted REAL parsed elements with surviving handler attributes
(svg/img/script/iframe/details/math + on* attrs + javascript:/data: URLs); pure-entity payloads
passed through as inert text in the parent (documented browser semantics). Post-fix focused suite
**227 PASS / 0 FAIL** (S-A receiver flows ×5; S-B username matrix ×3 more flows; S-C 18-markdown
matrix — renderer supports NO markdown, everything renders literal + inert, HTML-in-markdown
neutralized; S-D streaming evidence — no streaming code exists (D3 grep-proof), per-message chunk
halves individually inert, accumulated re-render simulation proves intermediate-stage atomicity;
S-E storage/history — no persistence, reopen = class toggle with no re-render, history trim/system
unshift intact; S-F 8-value multilingual byte-exact round-trip (English/Hindi/Hinglish/Punjabi/Urdu/
Arabic/emoji/mixed+specials) + no mojibake across panel/voice/echo/translate surfaces; S-G functional
G1-G25 — panel toggle/focus/drag-setup, send+clear+typing lifecycle, sensitive-query block, open-chat
command + startDM scheduling, non-command fallthrough, API-error fallback, no-key fallback, own-username
greeting, patched command chain (GC/channel), suggestion chips, multiline \n preservation, 5000-char
long response, empty-API default reply, appendNovaMsg return contract, autoGrow, competitor
replacement, API sensitive-redaction, voice loop + speech, voice stop, translate success/fallback/
no-caption paths, modal title textContent; S-H negative control — parent re-proven vulnerable 4/4,
disk esc-exact 4/4; S-I esc() contract on REAL utils.js; S-J hygiene — exactly 1 esc() in nova-ai.js,
0 in voice-assistant.js, 2 in nova-universe.js, disk-vs-parent diff == exactly the 5 sanctioned edits,
5 adjacent modules byte-identical, zero leaked listeners/intervals, dynamic-island constant path
byte-exact). Full gates: ALL prior H suites green (H1 FIXED, H1b FIXED, H4 114/0, H5 ALL GREEN,
H6 84/0, H7 91/0, H8 154/154, H9 159/0, H10 247/0 + NC 29/29, H11 PASS + NC 26/26, H12 176/0,
H13 249/0, H14 63/0, H15 296/0, H16 446/0, H17 237/0, H18 457/0); 322 regression 317/5
byte-identical to baseline (all 5 = owner main-pin family; branch2-only-safety reason re-verified =
stale origin/main pin, fails BEFORE the H19 allowlist check; branch2-final-readiness pre-commit
reason = "worktree must be clean after publication", the documented pre-publication baseline
behavior); app-load 10/10; event-listener-boundary, interval-lifecycle, dm-chat-realtime-protected-
readiness, dms-realtime, realtime-subscription-lifecycle, notes-submission-reactions-protected-
readiness, index-html-tag-integrity, external-resource-url-integrity, local-ai-response-contract,
ai-context-contract, show-nova-universe-overview-contract, nova-debug-contract,
window-assignment-surface, storage-key-surface, explicit-error-boundary all exit 0; diff adds zero
listeners/subscriptions/intervals/window assignments/storage keys.

## 14. Task report hooks (per owner instruction)

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

**H13 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H13 (render-sv.js:30/:195) — 2 sinks, 1 source file, 2 insertions/2 deletions.
- Newly discovered: SEC-002 (story overlay poll question/options rendered raw to all story viewers — sv-append-overlays.js:44/:51, HIGH, OPEN, deferred to a future task per ISSUE_RULES #8); site addition to XSS-C1 (render-sv.js:30 av() call — story viewer header avatar).
- Remaining open: 5 HIGH (H15-H19), 6 MEDIUM (M1-M6), SEC-002 (new, HIGH), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H15 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H15 (note-viewer-owners.js:28/:32) — 2 sinks, 1 source file, 2 insertions/2 deletions; branch2-only-safety-contract-harness.js allowlist admission for note-viewer-owners.js (audit-prescribed; H11-established mechanism).
- Newly discovered: none (no new issues, no site additions — av() :26 already in XSS-C1; music metadata :35-38 already XSS-M4; reactors list already XSS-H17; notes-bar already XSS-H16; ledger line refs :29/:33 clarified to actual :28/:32 in the FIXED row, 1-line counting drift, no content change).
- Remaining open: 4 HIGH (H16-H19), SEC-002 (HIGH), 6 MEDIUM (M1-M6), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H16 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H16 (notes-bar.js:76/:86/:90 + profile-view.js:389) — 4 sink lines across 2 files, 4 insertions/4 deletions; no allowlist admission required (no new Branch2 files).
- Newly discovered: NEW XSS-C9 (notes.js:57-58 personal localStorage notes self-XSS, LOW, OPEN accepted-low); site additions — XSS-M1 (profile-view.js:392 viewAvatarFullscreen onclick avatar_url), XSS-M4 (search-music-for-note.js:13-25 iTunes API rows), XSS-M6 (profile.js:75 own-profile note pill self-XSS), XSS-C1 (notes surfaces :75/:85/:26/:75-feed), XSS-C3 line-ref clarified :84 → actual :88 (4-line drift, byte-identity re-verified).
- TRACK A conclusion: NO href sink exists in the Notes Bar — the "href/URL" ledger framing resolves to (a) UUID onclick JS-strings (safe by construction), (b) deferred URL classes (C1 av / M4 music / M1 viewAvatarFullscreen), and (c) the pre-fix quote-breakout vector that minted executable `<a href="javascript:…">` elements from the unescaped HTML-text zones — fixed by the same esc() sinks.
- Remaining open: 3 HIGH (H17-H19), SEC-002 (HIGH, untouched — different root cause than H16: stories.overlay_data vs quick_notes.text/quick_notes render surfaces), 6 MEDIUM (M1-M6), XSS-C9, JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H17 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H17 (note-reactors-list-owner.js:20/:21) — 2 sinks, 1 source file, 2 insertions/2 deletions; branch2-only-safety-contract-harness.js allowlist admission for note-reactors-list-owner.js (audit-prescribed; H15-established mechanism); note-reactors-list-production-split-contract-harness.js parity re-pinned to origin/main + exactly the H17 esc delta (any further drift still fails).
- Newly discovered: none (no new issues, no site additions — av() :19 already in XSS-C1; own reaction badge already XSS-C3; reactor username provenance already XSS-H18/D2 class; write-path maxlength=4 client-side-only constraint documented in section 11; SEC-002 root cause re-verified different (stories.overlay_data vs quick_note_reactions/profiles — stays OPEN untouched per ISSUE_RULES dedupe)).
- Remaining open: 2 HIGH (H18, H19), SEC-002 (HIGH, untouched — different root cause than H17: stories.overlay_data story poll content vs quick_note_reactions/profiles reactors data), 6 MEDIUM (M1-M6), XSS-C9, JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H18 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H18 (profile-view.js:88/:92/:156/:160/:276/:298/:302/:376/:403 + follow-list.js:34 + show-story-viewers.js:44) — 11 HTML-text sinks across 3 files, 11 insertions/11 deletions; branch2-only-safety-contract-harness.js allowlist admission for follow-list.js (the ledger-prescribed admission; profile-view.js and show-story-viewers.js already admitted).
- Newly discovered (site additions to EXISTING class rows per dedupe rule #5 — no new issue IDs, no new rows): XSS-M2 gains profile-view.js:408 (full-profile bio via linkify(prof.bio) with NO escaping — cross-user bio path); XSS-M1 gains profile-view.js:62 (cover_url CSS url() inside style attr) + :267/:366 (cover img src); XSS-C1 gains profile-view.js:82/:150/:286/:391 + follow-list.js:33 + show-story-viewers.js:43 (profile/follow/viewer av() sites); SEC-001 gains profile-view.js:213 (preview render-error e.message); H9-D2 username-rendering class gains close-friends.js:46, show-blocked-list.js:15, se-search-mention-users.js:48/:51.
- Deduplication decisions: profile-view.js:403 (bio-section full_name) absorbed into XSS-H18 (same file + same provenance + same fix pattern — in-scope site addition); follow-list ledger ref :33 clarified to actual sink :34 (1-line drift, unambiguous by content); explore.js:128-:131 (H10-10) and universal-search.js:111-:115 (H10-11) NOT absorbed (existing OPEN MEDIUM rows with "H18-family sweep" owner); close-friends/blocked-list/se-search-mention-users NOT fixed (H9-D2 class — H18-family extensions task); own-profile surfaces NOT fixed (XSS-M6 self-XSS class); SEC-002/H19 untouched.
- Suite-tooling (scripts/ OUTSIDE repo, H9–H12 precedent, product code NEVER changed for tests): H16 verify-suite L.3 evolution-proofed — historical H16 delta re-anchored to immutable commit 541196a (still exactly 1 line) + new stricter L.3b proving disk evolution from H16-commit state = sanctioned H18 esc-wraps only (9 lines, every changed line is an esc() injection into one ${…} slot).
- Remaining open: 1 HIGH (H19), SEC-002 (HIGH, untouched), 6 MEDIUM (M1-M6), XSS-C9, JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13, now with 3 more sites), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home + profile-preview error paths), cosmetics (H9-D5 BUG, H10-15 UI_UX).

**H19 report block:**
- Historical imported: none new (issue system live since H11; all history preserved).
- Fixed in this task: XSS-H19 — nova-ai.js:162 (esc() at the shared appendNovaMsg sink — covers all 8 call sites: typed + voice pipelines, user/AI/command/canned content) + :219 and voice-assistant.js:139 (`<`-pre-escape removal, single escaping stage) + nova-universe.js:104/:108 (translate modal ORIGINAL + TRANSLATED esc) — 5 production line-edits across 3 files, 5 insertions/5 deletions; branch2-only-safety-contract-harness allowlist admission for nova-ai.js + voice-assistant.js (ledger-prescribed; nova-universe.js already admitted). XSS-C2 (own-message `<`-only partial escape) FIXED as a side effect of the sink fix + pre-escape removal (its row updated — folded as promised).
- Newly discovered (site additions / class notes, per dedupe rule #5 — no new issue IDs for the translate slots, they are H19's own audited rendering path): nova-universe.js:104 recorded as a posts.caption-class site (same value class as H10-2/formatCaption; FIXED in H19); XSS-C9 gains nova-ultra-patches.js:46 moodChip + ai-moderation.js:39 (currentMood self-localStorage self-XSS class, deferred); call-nova-ai.js:30-44 documented as keyword redaction, not a sanitizer; ai-generators.js caption output verified as textarea .value (non-HTML sink); local-ai-response.js:51 own-username greeting now esc-covered by the sink; nova-ai.js:727 e.message reflection now esc-covered by the sink (SEC-001 family note); panel command DB-username sites (:336/:341/:351/:647) now esc-covered by the sink (H9-D2 username-rendering class note — no separate rows existed for the panel-internal paths).
- Deduplication decisions: XSS-C2 absorbed into H19 as prescribed by its row ("folded into H19"); translate-modal ORIGINAL slot absorbed into H19 (same commit + same rendering path being secured; data class attribution recorded); NO other issues merged; SEC-002 untouched (different root cause: stories.overlay_data poll content vs Nova AI response/posts.caption); no username-rendering-class sites outside the panel were touched; no Markdown renderer was added or removed (none exists); no CSP work (out of scope).
- Remaining open: 0 XSS H-series HIGH; SEC-002 (HIGH, untouched — story overlay poll content, separate task per owner); 6 MEDIUM (M1-M6), XSS-C9 (+2 sites), JS-string class (H9-D1/XSS-10.5), username-rendering class (H9-D2 + H10-6…H10-13), av() review, modal-title caller audit, DG-3/4/5 human decisions (BUG file), HA-M5 SW cache versioning (PLATFORM file), SEC-001 (reels + home + profile-preview error paths; the nova-ai panel error reflection is now esc-covered), cosmetics (H9-D5 BUG, H10-15 UI_UX). With H19 closed, the entire H1-H19 HIGH XSS audit backlog is FIXED; remaining HIGH = SEC-002 only.
