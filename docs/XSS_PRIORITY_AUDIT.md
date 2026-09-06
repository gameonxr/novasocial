# XSS / HTML-Injection Priority Audit — NOVASOCIAL Branch2 (Phase 2, Read-Only)

**Phase:** 2 (investigation only — no application code modified, no fixes applied, no esc() calls added)
**Date:** 2026-09-06
**Investigator:** Super Z (GLM session), Task ID `xss-priority-audit`
**Repo state at audit start:** Branch2 `HEAD = 3e29452 = origin/Branch2`, `origin/main = ef418007` (immutable), worktree clean. Prior state: Guard #1 (6bf3db0) and Guard #2 (3e29452) repaired; Guard #3 untouched, updateMyInterests regression untouched, 322/322 harnesses, 10/10 app-load.

---

## 1. Executive Summary

The earlier CODEBASE_HEALTH_AUDIT statement that the codebase had **zero escaping helpers** was wrong (already acknowledged in this phase's brief). The repo ships a shared, correct HTML-escaping helper — **`esc()`** (`src/core/utils.js:4-12`) — plus two secondary mitigations (`sanitizeUrl()` for profile website links and a `encodeURIComponent` data-attribute pattern in the chat renderer). The escaping layer is used extensively: **123 `esc()` call sites across 31 feature files**, concentrated in the admin/report surfaces, post captions (`formatCaption`), search screens, notes feed, typing indicator, and the optimistic chat bubble.

However, the audit also concluded correctly that the surface is **systemic**: the user-generated-content (UGC) render paths for the app's highest-traffic features — **chat messages, comments, notifications, DM list, chat headers/pinned messages, notes, profiles, story rails, reels, and in-chat search** — interpolate other users' strings directly into `innerHTML` **without** `esc()`. This audit confirmed **19 HIGH-risk findings covering 29 unescaped sink sites across 18 files**, all following one root pattern:

```
db row (profiles.username / message.text / comment.text / …)
  → template literal or string concatenation
  → .innerHTML  (no esc() anywhere in the flow)
```

**Exploitability is realistic, not theoretical.** Username validation exists only in the *profile-edit* screen (`settings.js:536`, regex `^[a-zA-Z0-9_.]+$`); the **signup path (`auth.js:50`) only lowercases and replaces whitespace with `_`** — no character-set validation. `full_name` and `bio` have no validation anywhere in the client. A user can therefore register with username or full_name containing `<img src=x onerror=…>` and have it stored, then rendered raw in every viewer's DOM across the social graph — stored XSS.

Two verified demos of impact (static VM checks, read-only):

1. `esc('<img src=x onerror=alert(1)>')` → `&lt;img src=x onerror=alert(1)&gt;` — the existing helper fully neutralizes markup.
2. `esc('भाई यह पोस्ट बहुत अच्छी है')` → unchanged; `esc('ਇਹ ਬਹੁਤ ਵਧੀਆ ਹੈ')`, `esc('یہ بہت اچھا ہے')`, Hinglish — all unchanged. **esc() escapes HTML syntax only; it does not touch, filter, translate, or censor any language's text.** (Empirically verified against the real function extracted from `src/core/utils.js` — see section 3.6.)

**Recommended posture:** the fix program is a mechanical, low-risk, esc()-at-sink wrapping series — one bounded commit per file — ordered by exploitability and traffic (section 12/13). The hardest part is not the escaping; it is preserving the linkify/@-mention pipeline in chat (escape **before** linkify) and the JS-string-in-attribute contexts, where `esc()` alone is **not sufficient** (section 10.5).

**No fixes were performed in this phase.** Application source is byte-identical to the audit-start state; the only new file is this document.

---

## 2. Scope & Methodology

**In scope:** every HTML-generation path reachable from user-controlled or externally-controlled data — `innerHTML` (395 assignments), `innerHTML +=` (2), `insertAdjacentHTML` (8), `outerHTML` (1), template-literal HTML strings, `setAttribute`/attribute interpolations (`href`, `src`, `style`, event-handler attributes), and dynamically generated chat/comment/post/story/search/profile/notification HTML.

**Method (all read-only):**
1. `git` state recorded (HEAD / origin/Branch2 / origin/main / clean worktree).
2. `esc()` implementation extracted from `src/core/utils.js` and **executed in a Node `vm`** against neutralization and multilingual-preservation test vectors (results in section 3.6).
3. Global sink census via ripgrep: counts by sink type; per-file `esc()` presence census (31 files / 123 sites).
4. Deep data-flow tracing of the 10 priority UGC surfaces (chat, comments, posts/reels, stories, profiles, groups, pinned messages, typing, search, notifications, notes, AI) from Supabase row → render function → sink, recording exact file:line, source row/column, escaping status.
5. Write-path validation audit: signup (`auth.js:50`), profile edit (`settings.js:526-538`), message send (`send-msg.js:37`), note reaction (`notes-reaction-owner.js:22`), comment send (`comments.js:85`) — to determine which inputs are constrained at write time.
6. Harness-pin mapping for every fix-target file (regression risk, section 14).
7. Existing tests executed unmodified: 322 harnesses, 10-point app-load, security/escape harnesses (section "Tests").

**Out of scope / not modified:** application code, HTML, CSP, Supabase/RLS, auth, Cloudinary, Push, Service Worker, load order, Guard #3, updateMyInterests, all unrelated bugs.

**Source typology applied to every sink** (per the task's nine categories): static developer text / server-data / own-user data / other-user data / AI-generated / URL-param / already-escaped / numeric-boolean / trusted constant.

---

## 3. Existing esc() Analysis

### 3.1 Implementation (src/core/utils.js:4-12)

Escapes exactly five characters — `&` `→ &amp;` (first, avoiding double-encode), `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`. Nullish-safe (`null`/`undefined` → `''`); stringifies non-strings (`42` → `'42'`, `false` → `'false'`).

### 3.2 Context-safety matrix

| Context | Verdict | Reason |
|---|---|---|
| HTML text nodes | **SAFE** | All tag/attribute-syntax chars neutralized |
| Double-quoted HTML attributes | **SAFE** | `"` and the other four escaped — no attribute breakout |
| Single-quoted HTML attributes | **SAFE** | `'` → `&#39;` |
| URL values (`href="…"`) | **NOT SAFE alone** | Escaping prevents attribute breakout but does **not** validate scheme — a literal `javascript:alert(1)` URL survives esc() and executes on click. Scheme allow-listing is required for URL sinks (the codebase already has `sanitizeUrl()`, used only for profile websites). |
| JavaScript string inside an event-handler attribute (`onclick="fn('${esc(x)}')"`) | **NOT SAFE — breakout confirmed** | The HTML parser **decodes `&#39;` back to `'` before JS evaluation**, so an apostrophe in `x` re-closes the JS string: `fn('x');attackerCode();//' )` executes. Verified consequence in section 3.5. |
| CSS contexts (`style="…${esc(x)}…"`) | **PARTIAL** | Attribute breakout prevented; CSS-native injection (`expression()`, `url()`) is not neutralized, but impact inside a quoted attribute is low. |

### 3.3 Existing secondary helpers
- `sanitizeUrl()` (utils.js:342-358): allow-lists http/https, strips `file:///` `content://` — used only for profile website (`profile.js:99`, `profile-view.js:136,348`).
- `encodeURIComponent` data-attributes (`load-msgs.js:136-139`): safe transport of message text/name/media fields into `data-*` attributes for the message-menu — good pattern to reuse.
- `linkify()` (utils.js:360+): wraps URL patterns in anchors — **does not escape** and must only be applied to already-escaped text.
- `call-nova-ai.js:30-44`: not an HTML sanitizer — keyword redaction of AI output only.

### 3.4 Where esc() is already used (protected surface)

31 feature files, 123 call sites. Highest density: admin/report surfaces (`show-report-detail` 18, `load-reports-list` 15, `show-admin-user-detail` 7, verify/appeals/audit/approvals/content/team-lists 3-5 each), `story-editor-owners` (6 — story text, poll options, question stickers), `posts.js` `formatCaption` (3 — post captions in feed), `news-feed` (2), `load-notes-feed` (3), `search-dm`/`search-gc`/`search-add-members`/`search-admin-users`/`search-user-for-promotion` (1-4), `start-typing-watcher` (1 — typing indicator), `send-msg.js:33` (optimistic bubble), `explore.js:140` (search echo), `show-ban-screen`, `show-report-modal`, `view-avatar-fullscreen`, `avatar-action-sheet`, `pin-msg.js`, `render-admin-panel-ui.js`, `load-user-report-stats`.

### 3.5 Helper wrappers around esc()

None exist. Two ad-hoc partial patterns coexist:
- `esc(x).replace(/'/g,"\\'")` (admin-tab-approvals.js:39-40, show-admin-user-detail.js:39-41, dms-renderer-owner.js `safeName`): **the replace is a no-op** because `esc()` already converted every `'` to `&#39;` — no literal apostrophe remains. The protection therefore reduces to plain `esc()`, which per 3.2 is insufficient **in JS-string-attribute contexts** (entity decode-back). In plain `'…'`-delimited JS strings this yields syntax breakage (button DoS) and, for crafted input, code execution. These sites carry the same class of bug as the unescaped ones — see M5.
- `encodeURIComponent` then decode-at-use (`pin-msg-from-enc.js:6` decodes then renders **raw** at :10 — the transport is safe, the sink is not; see H8b).

### 3.6 Empirical verification (read-only, Node vm, real esc() source)

| Input | esc() output |
|---|---|
| `भाई यह पोस्ट बहुत अच्छी है` | unchanged |
| `Bhai ye post bahut acchi hai` | unchanged |
| `ਇਹ ਬਹੁਤ ਵਧੀਆ ਹੈ` (Punjabi) | unchanged |
| `یہ بہت اچھا ہے` (Urdu) | unchanged |
| `<img src=x onerror=alert(1)>` | `&lt;img src=x onerror=alert(1)&gt;` |
| `a&b` / `x"y` / `it's` | `a&amp;b` / `x&quot;y` / `it&#39;s` |

**Conclusion:** esc() is correct and complete for text and quoted-attribute contexts; multilingual content is preserved byte-for-byte (no language filtering — future fixes must keep this property); it must NOT be the last line of defense for URL schemes or JS-string-attribute contexts. **No new `escapeHtml()` is recommended** — esc() is sufficient for the planned text/attribute sinks; URL and JS-context sites need *different* mitigations (sections 10.4-10.5), and those are future tasks.

---

## 4. XSS Risk Summary

| Category | Count | Meaning |
|---|---|---|
| **A — HIGH** | **19 findings / 29 sink sites / 18 files** | Other users' (or external) data reaches innerHTML/attribute sinks with **zero escaping** — confirmed realistic stored-XSS paths |
| **B — MEDIUM** | **6 findings** | Exploitable depending on write-path constraints, context, or trust boundary (AI output, DB-write bypass, semi-trusted metadata, JS-attribute contexts) |
| **C — LOW** | **7 findings** | Self-XSS, 1-char constraints, partial escapes adequate for pure text context |
| **D — SAFE / protected** | **123 esc() sites (31 files) + 4 structural protections** | Escaped at sink, or structurally safe sinks (modal title via `textContent`, data-attrs via encodeURIComponent, website via sanitizeUrl, static templates) |
| **False positives / safe innerHTML** | ~265 of 395 innerHTML sites reviewed as static chrome | Developer-controlled markup, numeric/boolean/UUID interpolations, icon SVGs, app constants — no attacker-reachable data |

Root pattern shared by all 19 HIGH findings: **Supabase row → raw interpolation → innerHTML**. The enabling condition: **signup performs no character-set validation on username/full_name** (auth.js:50), and no validation exists for message text, comment text, note text, group names, or pinned-message text. The app's data layer is fully attacker-populated by design (social UGC); escaping must therefore be at every sink.

---

## 5. HIGH-RISK Findings (A) — confirmed unescaped UGC sinks

Legend: `Source` = DB row/column; `esc()` = whether applied (all: **no**); `Attacker-controlled HTML?` = yes in all cases below (write paths unconstrained).

### H1 — Chat message body renders raw HTML
- **File:** `src/features/load-msgs.js` — sinks :104 (system-styled path), :120→:132 (plain-text path, incl. linkify/@-mention pipeline)
- **Function:** `loadMsgs` message mapper
- **Sink type:** `innerHTML` (list assembled into `finalHtml`, assigned at :160)
- **Source:** `messages.text` written by any chat participant (`send-msg.js:37` stores raw `txt`)
- **Data flow:** Supabase `messages` row → `m.text` → string concat → `finalHtml` → `list.innerHTML`
- **Notes:** the linkify step (:121) regex-matches http(s) URLs and wraps them in anchors *inside otherwise-raw text* — `<script>`-style markup passes through untouched. The `isSystem()` check (:86) only selects a different raw sink. `data-*` attributes on the same bubble ARE `encodeURIComponent`-protected (:136-139) — text/attrs protected, **body is not**.
- **Future fix:** `esc(m.text)` before linkify/mention processing; process @mentions against the escaped string. (Exact order matters — escaping after linkify would double-encode.)
- **Regression risk:** MEDIUM — 3 harnesses reference the file (play-next-audio pins the audio-ended handler string; dms-seam loads it; safety-contract allowlist already contains it). esc-before-linkify changes the DOM contract of links (@-mention spans must still match on escaped text).
- **Bounded commit:** YES (single file; harness sync only if a marker string is touched).

### H2 — Chat reply-context renders replied username + text raw
- **File:** `load-msgs.js:143-144`
- **Source:** `m.replied.profiles.username`, `m.replied.text`
- **Data flow:** joined reply row → `'…<b>' + (m.replied.profiles?.username||'User') + '</b><br>' + replyText` → innerHTML
- **Future fix:** wrap both components with `esc()`.
- **Regression risk:** LOW; same commit as H1.

### H3 — Group-chat sender username renders raw
- **File:** `load-msgs.js:150`
- **Source:** `m.profiles.username` (group messages only)
- **Future fix:** `esc(...)` around the username concat. LOW regression risk.

### H4 — Comments screen renders username + comment text raw
- **File:** `src/features/comments.js:53-54` (template inside `openComments`)
- **Source:** `comments.profiles.username`, `comments.text` (inserted raw by base `sendCmt`, comments.js:93 — note Guard #2 now blocks 6 banned substrings only; markup passes)
- **Data flow:** comments join → `c.profiles?.username` / `c.text` → `body.innerHTML` template (:41)
- **Future fix:** `esc(c.profiles?.username)`, `esc(c.text)` at :53-54.
- **Regression risk:** LOW-MEDIUM — `mutation-error-boundary-contract-harness.js` pins `sendCmt` internals (insert/rate-limit/return markers) — **not** the render template; comments.js is not in the safety allowlist (allowlist admission in same commit required, established mechanism).

### H5 — Notifications render sender username + message payload raw
- **File:** `src/features/notifications.js:161` (grouped notif name), `:184` (individual: `<b>${n.sender?.username}</b> ${txt}`)
- **Source:** `notifications.sender.username` and `notifications.message` — for comment-type, the payload is the commenter's text slice (written by `sendNotif(owner,'comment',{message: txt.slice(0,60)})`, comments.js:105 — raw)
- **Data flow:** notifications fetch (join profiles) → template → innerHTML (screen render ~:190)
- **Future fix:** `esc(name)` at :161; `esc(n.sender?.username)` + `esc(txt)` at :184.
- **Regression risk:** LOW — 2 harnesses reference the file structurally; allowlist contains it.

### H6 — DM list renders conversation name + last-message preview raw
- **File:** `src/features/dms-renderer-owner.js:49` — `name` (group_name or other user's username) and `c.last_message`
- **Source:** `conversations.group_name` (group creator controlled), `profiles.username`, `conversations.last_message` (any participant's last text)
- **Data flow:** convos query → `name`/`safeName` (only `'`-escaped **for the onclick**, no HTML escaping) → template → `scr.innerHTML` (:56)
- **Future fix:** esc the display name (keep `safeName` logic for the JS-string attr, see 10.5); `esc(c.last_message||'Tap to open')`.
- **Regression risk:** MEDIUM — 11 harnesses reference the file (window.renderDMs owner pins); allowlist contains it. `refresh-dms-in-place.js` reuses the same row template — must be fixed in the same commit (H6b: refresh-dms-in-place.js:186-188 prepend the same HTML).

### H7 — Chat header renders group name / peer username raw
- **File:** `src/features/open-chat.js:102` (`'+gcName+'`)
- **Source:** `conversations.group_name` or `profiles.username` (:27/:32)
- **Future fix:** `esc(gcName)` (display only — the `callIcons` onclick uses `safeName`-style `'`-escaping for the JS string; see 10.5).
- **Regression risk:** MEDIUM — 9 harnesses reference the file; allowlist contains it.

### H8 — Pinned message bar renders message text raw (two sinks)
- **Files:** `open-chat.js:90` (`convoInfo.pinned_message_text`), `pin-msg-from-enc.js:10` (decodeURIComponent'd message text)
- **Source:** `conversations.pinned_message_text` — set from `messages.text` by `pinMsgFromEnc` (:8) — any chat participant can pin their own crafted message
- **Future fix:** `esc()` after decode at :10 and around the concat at open-chat:90.
- **Regression risk:** LOW — 1 harness each; both files in allowlist.

### H9 — Group Info modal renders group name raw
- **File:** `src/features/show-group-info.js:40`
- **Source:** `window._chatGcName` ← `conversations.group_name`
- **Note:** the modal *title* (:21, `${gcName} · Info`) is SAFE — `modal()` writes titles via `textContent` (modal.js:14). The `#gc-rename` input (:38) escapes `"` only — adequate for a double-quoted value attribute in practice (C4).
- **Future fix:** `esc(gcName)` at :40.
- **Regression risk:** LOW; allowlisted.

### H10 — Post cards render author username and location raw
- **File:** `src/features/posts.js:127` (`${p.profiles?.username||''}`), `:130` (`${p.location}`)
- **Source:** `profiles.username`, `posts.location` (caption IS escaped via `formatCaption` :12-22 — post text protected, author/location not)
- **Reach:** every feed surface that reuses `postCard` — home.js:411 (`insertAdjacentHTML`), post-detail.js:50, apply-mood-to-feed.js:89
- **Future fix:** `esc(p.profiles?.username)`, `esc(p.location)`.
- **Regression risk:** MEDIUM — `formatCaption`'s "more" expander injects `esc(esc(username))` (double-escape display bug, pre-existing) — the fix commit should keep caption logic untouched to stay bounded; 4 harnesses reference posts.js; allowlisted.

### H11 — Reels renderer renders username + caption raw
- **File:** `src/features/reels-renderer-owner.js:119` (username), `:122` (caption)
- **Source:** `profiles.username`, `posts.caption` (the feed's `formatCaption` escaping is NOT used on the reels surface)
- **Future fix:** esc both.
- **Regression risk:** MEDIUM-HIGH — 15 harnesses reference the file (reels protected-readiness pins); NOT in the safety allowlist (admission required).

### H12 — Home story rail renders story usernames raw
- **File:** `src/features/home.js:136` (`${s.profiles?.username||''}`); adjacent first-letter span :133 (C7)
- **Source:** `profiles.username` via stories join
- **Future fix:** esc at :136.
- **Regression risk:** LOW-MEDIUM; allowlisted; 3 harnesses.

### H13 — Story viewer header + reply bar render username raw
- **File:** `src/features/render-sv.js:30` (header name), `:195` (reply input `placeholder="Reply to '+(bucket.username||'')+'..."` — **attribute context**)
- **Source:** `profiles.username`
- **Future fix:** esc at :30 (text) and :195 (attribute — esc is sufficient here because the placeholder is inside a double-quoted attribute).
- **Regression risk:** MEDIUM; 4 harnesses; allowlisted.

### H14 — In-chat message search results render message text raw
- **File:** `src/features/do-search-messages.js:23`
- **Source:** `messages.text` (searched over the conversation)
- **Future fix:** `esc(x.text || '[Media]')`.
- **Regression risk:** LOW; 1 harness; allowlisted. (The explore grid's query echo at explore.js:140 is already esc'd — the audit-fix wrap 9.)

### H15 — Note viewer renders note author username + note text raw
- **File:** `src/features/note-viewer-owners.js:29` (username), `:33` (`${note.text}` — full untruncated)
- **Source:** `profiles.username`, `quick_notes.text` (submitted via notes-submission owner, no escaping on write)
- **Future fix:** esc both.
- **Regression risk:** MEDIUM-HIGH — 12 harnesses reference the file (notes protected-readiness pins); NOT in the allowlist (admission required).

### H16 — Notes bar renders other users' note text (truncated) + usernames raw
- **File:** `src/features/notes-bar.js:82` (`(n.text||'').slice(0,18)`), `:86` (`${n.profiles?.username||''}`)
- **Source:** `quick_notes.text` (others), `profiles.username`
- **Constraint note:** the 18-char slice makes complete-tag injection practically infeasible at THIS sink (an unterminated tag is discarded by the parser), but the full text renders unescaped in the viewer (H15) — fix both together. The username at :86 is unbounded.
- **Future fix:** esc both; LOW-MEDIUM risk; 1 harness; NOT in allowlist.

### H17 — Note reactors list renders reactor username + typed "emoji" raw
- **File:** `src/features/note-reactors-list-owner.js:20-21`
- **Source:** `profiles.username` AND `quick_note_reactions.emoji` — the native-emoji input (`submit-native-emoji-reaction.js:7`) accepts **arbitrary typed text** as the "emoji", upserted via `reactToNote` (notes-reaction-owner.js:22)
- **Data flow:** attacker reacts to a note with "emoji" = `<img src=x onerror=…>` → note OWNER opens the viewer → `loadNoteReactorsList` renders it raw → **stored XSS executing against the note owner** (a targeted attack against any user whose notes you can see).
- **Future fix:** esc username and emoji at :20-21.
- **Regression risk:** MEDIUM-HIGH — 13 harnesses reference the file; NOT in the allowlist.

### H18 — Profile view renders full_name / username raw (plus follow list, story viewers)
- **Files:** `src/features/profile-view.js:88,92` (blocked-view shell), `:156,160` (full shell); **follow-list.js:33**; **show-story-viewers.js:44**
- **Source:** `profiles.full_name` (no validation anywhere), `profiles.username` (signup-unvalidated)
- **Reach:** every profile visit, follower/following lists, story viewer lists — the widest username exposure in the app.
- **Future fix:** esc in all three files (3 related commits).
- **Regression risk:** profile-view LOW-MEDIUM (2 harnesses, allowlisted); follow-list/show-story-viewers LOW (1-2 harnesses; follow-list NOT allowlisted, show-story-viewers allowlisted).

### H19 — AI panel renders AI responses as raw HTML
- **File:** `src/features/nova-ai.js:162` (`appendNovaMsg`: `div.innerHTML = text`), called with raw API output at :251
- **Source:** external Nova AI chat API (response text shaped by the user's own prompt; `call-nova-ai.js:38-44` redacts keywords, not markup)
- **Classification:** **A- (HIGH/edge)** — the payload is AI-generated, not directly attacker-typed, but prompt-shaping makes markup injection realistic; the user's own message is `<`-escaped (:219) while the **AI reply is not escaped at all**.
- **Future fix:** `esc(aiResponse)` at appendNovaMsg call sites (or textContent for plain rendering).
- **Regression risk:** LOW; 2 harnesses; NOT allowlisted.

**Exploit summary for all A findings:** realistic path = register account with crafted `username`/`full_name` (or send a chat message / comment / note / reaction) → victim opens the corresponding screen → payload executes in the victim's session (Supabase JWT cookie-context JS — same-origin account actions possible). No CSP mitigations exist in the repo (out of scope to add).

---

## 6. MEDIUM-RISK Findings (B)

### M1 — Chat media URLs interpolated into `src` attributes and `onclick` JS strings
`load-msgs.js:112,114,116,118` — `'…src="' + m.media_url + '"…onclick="viewChatImage(\'' + m.media_url + '\')"'`. Normal flow stores Cloudinary-generated URLs, but the write path does not constrain `media_url` content (client-inserted rows; direct DB writes by a malicious client — RLS constraints unknown, see section 16). A crafted `media_url` containing `"` or `'` breaks out of the attribute/JS string. **Future fix:** attribute-safe esc for src (esc) + `encodeURIComponent` for the onclick argument. Regression: MEDIUM (audio-ended harness pins).

### M2 — Profile-view bio uses `<`-only partial escape
`profile-view.js:135` — `safeBio = (prof.bio||'').replace(/</g,'&lt;')…` — adequate against tag injection in pure text context, but non-robust (`&`, `>` unescaped; entity double-decode edges). **Future fix:** replace with `esc()` — display-identical for normal text. LOW-MEDIUM regression (2 harnesses).

### M3 — Reaction badge renders stored emoji raw
`-update-message-reaction-in-place.js:14` — `emojis.join(' ')` → `insertAdjacentHTML`. UI write paths constrain to fixed emoji sets (`show-msg-menu.js:15-19`, `heart-react.js`), but a direct DB write of `message_reactions.emoji` (malicious client) renders raw in the other party's chat. **Future fix:** esc each emoji. LOW-MEDIUM regression (1 harness).

### M4 — Note music metadata renders raw (+ JSON in onclick)
`note-viewer-owners.js:38-39` — `note.music_title`/`music_artist` (music picker sourced — semi-trusted metadata), and `onclick='toggleNoteMusicManual(${JSON.stringify(url)},…)'` — `JSON.stringify` output inside a single-quoted attribute breaks on a `'` in the URL. **Future fix:** esc title/artist; move the JSON argument to a `data-*` attribute. MEDIUM regression (12 harnesses).

### M5 — Admin action buttons pass esc()'d usernames through JS-string-in-attribute contexts
`admin-tab-approvals.js:39-40`, `show-admin-user-detail.js:39-41` — pattern `onclick="fn('${esc(u).replace(/'/g,"\\'")}')"` — per section 3.2/3.5, the `replace` is a no-op after esc, and `&#39;` decodes back to `'` at HTML-parse time, re-closing the JS string. With signup-unvalidated usernames this is a breakout vector **despite esc()**; with constrained usernames it is button-breakage. **Future fix (future task):** pass row ids only (they already do) and look the username up inside the handler, or use the encodeURIComponent data-attr pattern. MEDIUM regression (admin surfaces are heavily pinned — deliberate marker sync required).

### M6 — Own-profile render (profile.js) uses raw full_name/username and linkify(bio)
`profile.js:88,96,98` — own data → self-XSS primarily (the *other-user* view is H18/M2). `linkify(PROF.bio)` wraps URLs in raw anchors without escaping the bio. **Future fix:** `esc` then linkify (mirror of H1's order). LOW regression.

---

## 7. LOW-RISK / Informational Findings (C)

- **C1** `av()` first-letter (utils.js:326-332): single character interpolated into text and the `onerror` JS string — a leading `\` in a name escapes the closing quote (syntax breakage, not execution). Practically unexploitable.
- **C2** `nova-ai.js:219`: user's own message escaped `<` only — partial, self-input.
- **C3** `notes-bar.js:84`: own reaction emoji badge (myReactionsMap is `.eq('user_id', ME.id)`) — self-XSS only.
- **C4** `show-group-info.js:38`: group name in `value="…"` with `"`-escaped — double-quoted attribute boundary intact; adequate.
- **C5** `load-msgs.js:86` `isSystem()` prefix check is trivially spoofable by users (a message starting with ✅ renders in "system" styling — the raw-render problem is H1 regardless).
- **C6** `load-msgs.js:153` — **pre-existing display bug (not XSS):** `reactionMap.id]` should be `reactionMap[m.id]`; the optional chain makes it always-undefined, so initial-load reaction badges never render (only the in-place updater path works). Flag for a future hygiene fix; do not combine with XSS commits.
- **C7** `home.js:133` first-letter span — same class as C1.
- **C8** `settings.js:627-628` share-link injection — `link` is app-origin constant; safe.

---

## 8. Already-Protected Sites (D)

- **123 esc() call sites across 31 files** (section 3.4) — admin/report screens, post captions (`formatCaption`), story editor text/polls/questions, notes feed, typing indicator, search screens (DM/GC/add-members/admin/promotion), explore echo, optimistic chat bubble, ban screen, report modal, avatar fullscreen/sheet, admin panel UI.
- **Structural protections:** `modal()` title via `textContent` (modal.js:14 — group-info/chat-search/etc. modal titles are safe); `encodeURIComponent` data-attrs in load-msgs (:136-139); `sanitizeUrl()` for profile websites; pinned messages transported encoded (transport safe — sink H8b is the gap).
- **Fixed-enum interpolations:** reaction emoji pickers, visibility toggles, filter pills, notification icons — all developer constants.
- **Escaped search echoes:** explore.js:140 (audit wrap 9), search-gc/search-dm/search-add-members (audit wraps 6-8 family).

---

## 9. False Positives / Safe innerHTML Sites

Reviewed and classified as NOT XSS (no attacker-reachable data): the modal chrome templates (show-gc.js, sticker-tab.js, group-call menus, settings sections), loading spinners, static empty-states ("Koi message nahi", "Pehla comment karo"), notification icon SVG map, `ico()` markup, GRAD constants, unread badges (numeric with 99+ cap), `ago()` timestamps (Date-derived), member counts, UUID interpolations (`${c.user_id}`, `${a.id}` — UUID-typed columns), boolean-driven class/style ternaries, nav/debug panels, and the typing indicator (esc'd). Roughly **265 of the 395 innerHTML assignments** fall in this bucket — the systemic-surface claim is about the ~60 dynamic UGC sites, not raw sink counts.

---

## 10. Context-Specific Risks

### 10.1 HTML text (element content)
All H1-H19 except attribute cases. **Mitigation:** `esc()` at sink — sufficient (3.2).

### 10.2 HTML attributes
`placeholder` (render-sv.js:195), `value` (show-group-info.js:38), `data-*` (already encodeURI-safe). **Mitigation:** `esc()` — sufficient for quoted attributes.

### 10.3 URLs
- `linkify()` output hrefs: only http(s)/www patterns are matched — `javascript:` strings are NOT linkified (safe by construction, since the regex requires a scheme/domain match).
- `sanitizeUrl()`: profile websites only — allow-lists http/https.
- **Gap (M1):** chat `media_url`/location-URL interpolations — attribute+JS breakout vectors; and no general scheme guard exists for future URL sinks.

### 10.4 CSS/style
All style interpolations reviewed are numeric/sizes/colors from app constants (`ico`, av sizes, theme GRAD) — no user-controlled CSS found at this time. esc() would be insufficient for hostile CSS but no sink requires it.

### 10.5 JavaScript / event-handler attributes — the subtle class
Any `onclick="fn('…${x}…')"` where x is user data: **esc() alone does NOT protect** (entity decode-back re-closes the JS string, 3.2), and the codebase's `.replace(/'/g,"\\'")` after esc is a no-op (3.5). Affected patterns: dms-renderer `safeName` (display is H6; the onclick is this class), open-chat callIcons (gcName), admin buttons (M5), `viewChatImage('${m.media_url}')` (M1), render-sv reply bar (title only). **Correct future mitigation:** the established `encodeURIComponent` data-attr pattern (load-msgs:136) — pass encoded values in `data-*`, decode inside the handler. This is a design note for the fix series, not a current action.

---

## 11. User-Generated Content Risk Map

| Surface | Text | Names | Escaped today? | Finding |
|---|---|---|---|---|
| Chat messages (1:1 + group) | messages.text | profiles.username | Text: **NO** · attrs: YES (encoded) | H1-H3 |
| Chat reply preview | replied.text | replied username | **NO** | H2 |
| Pinned messages | pinned_message_text | — | **NO** | H8 |
| DM list | last_message | group_name / username | **NO** | H6 |
| Comments | comments.text | username | **NO** | H4 |
| Notifications | n.message (comment slice) | sender username | **NO** | H5 |
| Posts (feed) | caption (**YES** formatCaption) | username, location: **NO** | partial | H10 |
| Reels | caption: **NO** | username: **NO** | **NO** | H11 |
| Stories (rail/viewer) | — (overlays esc'd) | username: **NO** | partial | H12/H13 |
| Story viewers list | — | username: **NO** | **NO** | H18 |
| Notes (bar/viewer/reactors) | note.text: **NO** | username, emoji: **NO** | **NO** | H15-H17 |
| Profiles (view + lists) | bio: partial (`<` only) | full_name, username: **NO** | partial | H18/M2 |
| In-chat search results | messages.text | — | **NO** | H14 |
| Group identity (header/info) | — | group_name: **NO** | **NO** | H7/H9 |
| Typing indicator | — | username | **YES** (esc) | protected |
| Explore/search echoes | query | — | **YES** | protected |
| Admin surfaces | report/comment content | usernames (text: esc; JS-attr: M5) | mostly | M5 |
| AI panel | AI response | — | **NO** | H19 |

**Write-path constraints:** username — edit-constrained (settings.js:536), **signup-unconstrained** (auth.js:50); full_name — unconstrained; bio — unconstrained; message/comment/note/reaction text — unconstrained (Guard #2 blocks 6 banned substrings only); group_name — unconstrained; media_url — app-generated in normal flow, DB-write unconstrained.

**Language behavior (mandated check):** no site performs any language detection, translation, or filtering; esc() is character-syntax-only and preserves Devanagari, Gurmukhi, Urdu-Arabic, and Roman-mixed text byte-for-byte (3.6). All future esc() fixes inherit this property. No new banned words, no censoring, no language blocking are proposed.

---

## 12. Recommended Fix Order (exploitability × traffic × reach)

1. **H1-H3** chat message body / reply / group username — highest-traffic UGC, zero friction to exploit, executes against every chat participant.
2. **H4** comments — public surface, one template, two interpolations.
3. **H5** notifications — pushes other users' text into every user's notification screen.
4. **H6(+H6b)** DM list — first screen every user sees; last_message is any participant's text.
5. **H8** pinned messages — targeted, trivially weaponized (pin own crafted message).
6. **H7/H9** chat header + group info names.
7. **H15-H17** notes trio — the reactor-list path (H17) is a direct owner-targeting stored-XSS.
8. **H18** profile view + follow list + story viewers — widest username reach.
9. **H10/H11** post cards + reels — high traffic; captions already safe in feed (posts.js), missing on reels.
10. **H12/H13** story rail + story viewer names.
11. **H14** in-chat search results.
12. **H19** AI panel response escaping.
13. **M-tier follow-ups** (separate cycle): M1 media_url attrs, M2 safeBio → esc, M3 reaction badge, M5 admin JS-attr redesign (data-attr pattern), M4 note music metadata.
14. **C6** reactionMap display bug — unrelated hygiene, separate commit only.

---

## 13. Proposed Bounded Commit Plan (NOT performed in this phase)

Each commit: one file (or one tightly-coupled pair), esc() at exact sinks, VM verification with the multilingual test vectors from 3.6, safety-allowlist admission if the file is not already allowlisted, harness marker sync only where a pinned string changes, HANDOFF/MIGRATION_MAP ledger entry. Commit message style follows the audit-fix series.

| # | Commit | Files | Findings |
|---|---|---|---|
| 1 | `fix(xss): escape chat message bodies, reply previews, and group sender names` | load-msgs.js | H1, H2, H3 (esc-before-linkify order) |
| 2 | `fix(xss): escape comment usernames and comment text` | comments.js | H4 (+allowlist admission) |
| 3 | `fix(xss): escape notification sender names and message payloads` | notifications.js | H5 |
| 4 | `fix(xss): escape DM list conversation names and message previews` | dms-renderer-owner.js + refresh-dms-in-place.js | H6, H6b |
| 5 | `fix(xss): escape pinned message bars` | open-chat.js, pin-msg-from-enc.js | H8 |
| 6 | `fix(xss): escape chat header and group info names` | open-chat.js (display line), show-group-info.js | H7, H9 |
| 7 | `fix(xss): escape note viewer texts and names` | note-viewer-owners.js | H15 (+admission) |
| 8 | `fix(xss): escape notes bar previews and usernames` | notes-bar.js | H16 (+admission) |
| 9 | `fix(xss): escape note reactor names and reaction text` | note-reactors-list-owner.js | H17 (+admission) |
| 10 | `fix(xss): escape profile view, follow list, story viewer names` | profile-view.js (+M2 safeBio), follow-list.js, show-story-viewers.js | H18, M2 |
| 11 | `fix(xss): escape post card author names and locations` | posts.js | H10 |
| 12 | `fix(xss): escape reels usernames and captions` | reels-renderer-owner.js | H11 (+admission) |
| 13 | `fix(xss): escape story rail and story viewer names` | home.js, render-sv.js | H12, H13 |
| 14 | `fix(xss): escape in-chat search results` | do-search-messages.js | H14 |
| 15 | `fix(xss): escape Nova AI panel responses` | nova-ai.js | H19 (+admission) |

M-tier commits (M1, M3, M4, M5 — the JS-attribute redesign using the data-attr pattern) follow in a second cycle after the text sinks are closed, each with its own harness review. Every commit above is isolatable: no architecture change, no load-order change, no shared-helper change (esc() already exists and is pinned by escape-helper-contract-harness.js — that harness asserts esc() behavior, which the fixes do not touch).

---

## 14. Regression Risk Per Fix

| Fix | Harness pins on file | Allowlisted | Special risks |
|---|---|---|---|
| H1-H3 (load-msgs) | 3 (play-next-audio handler string; dms-seam; safety) | YES | linkify/@-mention DOM contract; data-attr contract must stay untouched |
| H4 (comments) | 3 (mutation-error-boundary sendCmt pins) | NO | admission commit; pins are insert/rate-limit markers — unaffected by render change |
| H5 (notifications) | 2 | YES | none beyond render |
| H6 (dms-renderer) | 11 | YES | window.renderDMs owner marker; refresh-dms-in-place must be in the same commit |
| H7 (open-chat) | 9 | YES | callIcons JS-string (10.5) — display-only fix first |
| H8 (pin bars) | 1+1 | YES | decode-then-esc ordering |
| H9 (group info) | 1 | YES | rename input escaping stays |
| H10 (posts) | 4 | YES | formatCaption double-esc display quirk — do NOT touch in this commit |
| H11 (reels) | 15 | NO | admission; reels protected-readiness dossier assertions |
| H12 (home) | 3 | YES | postCard reuse via insertAdjacentHTML |
| H13 (render-sv) | 4 | YES | placeholder attr esc |
| H14 (search) | 1 | YES | none |
| H15/H17 (notes) | 12/13 | NO | admission; notes protected-readiness dossiers |
| H16 (notes-bar) | 1 | NO | admission |
| H18 (profile/follow/viewers) | 2/1/2 | partial | follow-list admission |
| H19 (nova-ai) | 2 | NO | admission; AI rendering contract |

All fixes are single-file-bounded except #4 and #6 (coupled pairs, both already-established patterns). None touches pinned esc() behavior (escape-helper harness), script order, or any protected-readiness dossier invariant.

---

## 15. Manual Browser Verification Required (post-fix series)

1. Chat: send `<img src=x onerror=window.__xss=1>` and `` `'><script>`` style probes in 1:1 and group chats — verify literal rendering, no execution, links still clickable, @mentions still styled, reply previews correct.
2. Multilingual round-trip: send "भाई यह पोस्ट बहुत अच्छी है", "Bhai ye post bahut acchi hai", "ਇਹ ਬਹੁਤ ਵਧੀਆ ਹੈ", "یہ بہت اچھا ہے" — verify byte-identical display, no mojibake, no blocked/censored text.
3. Comments/notifications/DM-list/pin-bar/profile/story/note screens with crafted usernames (secondary account).
4. Emojis & stickers still render (esc must not double-encode ampersands in emoji sequences).
5. Reels caption display (long-caption clamp behavior) and post "more" expander.
6. The in-place DOM updaters (refresh-dms-in-place, update-message-reaction-in-place) after background refreshes.
7. AI panel: normal AI replies render as text (no missing formatting regression).

The 10/10 app-load and 322/322 harness suites cover syntax/integrity but **cannot** verify visual rendering — each fix commit needs the above smoke list.

---

## 16. Remaining Unknowns

1. **Server-side/RLS write constraints** (unreadable from the client repo): whether `message_reactions.emoji`, `messages.media_url`, and profile fields are constrained by database triggers/RLS beyond the client paths — determines whether M1/M3 are realistic or defense-in-depth only. **UNCERTAIN — HUMAN REVIEW REQUIRED** (Supabase dashboard/SQL access needed).
2. **Signup server-side username normalization** — auth.js performs none client-side; whether an auth-hook constrains the charset server-side is unknown (the profiles row is presumably written by a trigger from `auth.users.metadata`). Until confirmed, H-series username findings must be treated as exploitable.
3. **AI response trust boundary** — whether the Nova AI backend can emit markup intentionally (prompt injection) — treated as untrusted (H19) regardless.
4. **`localStorage`/session values in HTML** — reviewed (nova-ai-pos, tab caches): used as positions/cached DOM, not interpolated as raw HTML from other users; no cross-user vector found. Low confidence on future code drift — re-audit on any cache-render change.
5. **`refresh-dms-in-place.js` row template parity** — assumed to mirror dms-renderer-owner.js:46-49 (verified by reading both; re-check at fix time).
6. **URL/query params** (`?gc=`, deep links) — flow into ids for DB lookups, not into HTML directly; no current echo vector found beyond explore.js:140 (already escaped).
7. **CSP absence** — no Content-Security-Policy exists (manifest/SW reviewed read-only). Adding one would be defense-in-depth for all findings above, but is explicitly out of scope for this phase and any fix commit (separate decision).

---

## Tests (read-only, run after audit — code untouched)

| Suite | Result |
|---|---|
| Full regression (`run_regression.sh`, 322 harnesses) | **322/322 PASS / 0 FAIL** |
| App-load (`test_app_load.js`) | **10/10 PASS** |
| `escape-helper-contract-harness.js` | **PASS** (esc() definition + entity behavior locked) |
| `security-center-contract-harness.js` | **PASS** |
| `ai-moderation-contract-harness.js` (Guard #2 state) | **PASS / LOCKED** |
| `branch2-only-safety-contract-harness.js` / `branch2-final-readiness-contract-harness.js` | **PASS** (clean worktree, aligned refs) |

## Git State (post-audit)

- Application source **unchanged** — `git status` before this document: clean; after: only `docs/XSS_PRIORITY_AUDIT.md` untracked → committed alone.
- Branch: `Branch2` · pre-audit HEAD `3e29452` (= origin/Branch2) · `origin/main = ef418007` **untouched** throughout.
- Commit for this phase: docs-only, message `docs(security): add read-only XSS priority audit`, pushed to origin/Branch2 only.
- Guard #1, Guard #2 state preserved; Guard #3, Service Worker, updateMyInterests, CSP, load order — all untouched.
