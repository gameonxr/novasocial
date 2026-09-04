# NovaSocial Codebase Health & Integrity Audit — Branch2

**Audit date:** 2026-09-05
**Audited checkpoint:** `Branch2` @ `6a4d591ef6dda89926dd55a458ead182bbfd6dc6` (= `origin/Branch2`, worktree clean, `origin/main` immutable at `ef418007c9b9a797488b4825be5f0c807da22369`)
**Audit mode:** READ-ONLY. No production code was modified, deleted, renamed, or reordered. No live application, database, storage, Push, service-worker, network, or account actions were performed.
**Method:** Custom read-only static analyzers (file hashing, owner scanning, listener/subscription inventory, reference resolution, CSS analysis, security pattern scan) plus a detached Node `vm` sequential load simulation of all 464 local classic scripts in exact `index.html` order with absorbing DOM/Supabase stubs, plus the existing read-only validation suite (322/322 harnesses PASS, 10/10 app-load checks PASS).
**Scope:** entire repository — `index.html`, `src/` (`core/`, `components/`, `features/`, `styles/`), `docs/`, `manifest.json`, `sw.js`, configuration files, and all 322 test harnesses.

---

## 1. Executive Summary

The modularization mission is verifiably complete and the repository is structurally healthy. All 463 source JavaScript modules load without a single syntax or load-order error in the sequential VM simulation; every local script, stylesheet, precache entry, and manifest icon resolves to an existing file; there are zero accidental duplicate function owners, zero duplicate realtime channels, and zero committed secrets. The full published regression suite passes 322/322 and the app-load test passes 10/10 at the audited checkpoint.

The audit nevertheless surfaced a real class of latent defects that static harnesses cannot catch: **seven stale DOM-ID references** where JavaScript consumes `id` values that no template ever creates. Four of these silently break user-visible features (smart-reply buttons do nothing, the video-length picker never renders, the notification unread badge never appears, and the optimistic following-count update never fires), because the consuming code is null-guarded and fails silently. The real elements exist under different IDs (`minp`, `ci-<postId>`, `followers-count`, `home-notif-dot`), so these are wiring mistakes, not missing features. Separately, the security scan found one `eval()` usage, and a systemic pattern of 398 `innerHTML` assignments — 72 with direct interpolation including user-controlled text — with **no `escapeHtml` helper defined anywhere in the codebase**. No committed secrets were found; the Supabase key is the public `anon` role key and the AI key is injected at runtime, never committed.

Risk totals: **0 Critical, 3 High, 7 Medium, 5 Low**, plus informational notes. Every finding below includes severity, exact file and line, why it matters, a recommended fix, and whether the fix is safe to automate.

---

## 2. Duplicate Files

**Exact-content duplicates: 1 group (18 files, all 1 byte).**

| Severity | File(s) | Problem | Why it matters | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|
| LOW | `chore: add feature architecture` (repo root), plus 17 `.gitkeep` files (`src/components/.gitkeep`, `src/core/.gitkeep`, `src/styles/.gitkeep`, and 14 under `src/features/<domain>/.gitkeep`) | The root file is a 1-byte junk artifact accidentally created by commit `90a57d8` ("Create chore: add feature architecture", 2026-08-10) — a shell-quoting accident, tracked in git. The `.gitkeep` files mark 14 empty feature subdirectories (`src/features/ai/`, `auth/`, `calls/`, `chat/`, `explore/`, `home/`, `notifications/`, `posts/`, `profile/`, `reels/`, `search/`, `settings/`, `stories/`, `themes/`) that were scaffolded for a directory reorganization that was never executed — all 452 real feature files still live flat in `src/features/`. | Junk file confuses tooling and clones; empty scaffolding communicates an org structure that does not exist. The scaffolding is directly relevant if a future directory reorganization (for example `src/features/calls/`) is authorized. | Remove the junk root file (SAFE TO REMOVE). Keep the `.gitkeep` scaffolding until the reorganization decision is made (NEEDS REVIEW — they are the natural landing spots for any approved move). | Junk file: yes (single `git rm`). Scaffolding: no — decision required. |

**Near-duplicates (same content modulo whitespace): 0.** Backup/obsolete-name patterns (`*.bak`, `*.old`, `*.orig`, `*copy*`, `*backup*`): **0 found.**

---

## 3. Duplicate Functions

**Duplicate `window.<fn>` owners (function-valued, defined in 2+ files): 2 — both intentional patch chains.**

| Severity | Function | File 1 | File 2 | Intentional? | Detail |
|---|---|---|---|---|---|
| INFO | `showApp` | `src/features/show-app.js:5` (definition) | `src/features/nova-init.js:340` (wrapper seam) | Intentional | `nova-init.js` captures `_origShowApp` and wraps it to init Nova features after the app shows. Load order verified: `show-app.js` (#355) loads before `nova-init.js` (#447). |
| INFO | `initNovaFeatures` | `src/features/ai-moderation.js:45` (v2 patch) | `src/features/nova-ultra-patches.js:357` (ultra patch) | Intentional | Documented patch chain: base → `ai-moderation.js` (#111) → `nova-ultra-patches.js` (#444). Order verified in the VM simulation. |

**Documented multi-hop chain (verified, not a duplicate):** `toggleLike` — base `async function toggleLike(pid)` at `src/features/posts.js:47`, wrapped by `src/features/nova-ultra-patches.js:14` (#444), wrapped again by `src/features/like-effects.js:9` (#465, last script). `like-effects.js`'s own header states it intentionally loads after the inline application script to wrap the already-defined owner and use the `spawnLikeParticles` helper.

**Shared global state written from multiple files: 33 names — by-design architecture, not duplication.** Examples: `_pendingIceCandidates` (5 files in the Calls family), `_chatMembers` (3 files), `typingSub` (3 files), `_ringtoneCtx` (2 files), `_networkMonitorInterval` (2 files). All are state flags/subscription handles shared across the one-owner-per-file classic-script architecture; values are reassigned, never dual-implemented. Full list in the audit output.

**Top-level `function` declaration collisions across files: 0.** **Top-level `const`/`let`/`var` cross-file collisions: 0** (a collision would throw at load; the VM simulation of all 464 scripts in order confirms none exists).

---

## 4. Duplicate Event Listeners

**Total `addEventListener` calls scanned: 109; global-level (document/window/body): 40.**

| Severity | Target :: Event | Registrations | Files | Verdict |
|---|---|---|---|---|
| INFO | `document :: mouseup` | 9 | 7 files (`-setup-crop-drag-handlers.js:100`, `nova-ai.js:136`, `nova-init.js:49,216,298`, `setup-fab-drag.js:89`, `setup-home-hold-restore.js:21`, `story-editor-owners.js:133`, `story-text-helpers.js:71`) | Intentional — each file implements its own drag/panel-close feature on distinct UI state. No shared handler work is duplicated. |
| INFO | `document :: mousemove` | 6 | 6 files (crop-drag, nova-ai, nova-init, fab-drag, story-editor, story-text) | Intentional — same per-feature drag pattern. |
| INFO | `document :: touchstart/touchmove/touchend` | 3/4/4 | `nova-init.js`, `setup-home-hold-restore.js`, `story-text-helpers.js` | Intentional — FAB gestures, home hold-restore, story text drag. |
| INFO | `document :: mousedown` | 3 | `nova-init.js:41,290`, `setup-home-hold-restore.js:15` | Intentional. |
| INFO | `document :: click` | 3 | `like-effects.js:24`, `index.html:747`, `index.html:757` | Intentional — theme-picker outside-close plus the two FAB outside-tap closers documented as boundary listeners. |
| INFO | `window :: load` | 2 | `index.html:539,543` | Intentional — service-worker registration + the main bootstrap authentication/session/deep-link handler (both part of the protected inline boundary). |
| INFO | `window :: error`, `unhandledrejection`, `popstate`, `online`, `offline`; `document :: visibilitychange` | 1 each | `diagnostics.js:6,16`, `navigation.js:121`, `offline.js:107,111`, `index.html:1620` | Single, correct registrations. |

**Same-file duplicate (target::event) registrations: 1 — false positive.** `src/features/sv-append-overlays.js:75,86,93` registers `touchstart` on three *different* elements (poll option rows, the poll card `div`, and the mention overlay `div`), each newly created per overlay. Not a duplicate.

**Guard usage:** only 3 of 109 registrations use `dataset`-bound/once guards — acceptable because the registrations are one-time setup calls, not per-render re-attachments. The 654 inline `onclick=`/`oninput=` handlers inside JS template strings are the app's documented legacy architecture, not listener duplication.

**Duplicate-listener findings requiring action: 0.**

---

## 5. Duplicate Realtime Subscriptions

**Channel inventory (Supabase Realtime): 10 channels, all unique names, each with exactly one creation site and one `postgres_changes` listener.**

| Severity | Channel | Created | Cleanup owner | Verdict |
|---|---|---|---|---|
| INFO | `incoming-calls-<id>` | `init-calling-system.js:9` | same file (`:7`) + `end-call.js` | OK |
| INFO | `call-status-<id>` | `listen-for-call-status.js:7` | same file (`:6`) | OK |
| INFO | `group-participants-<id>` | `listen-for-group-participants.js:7` | same file (`:6`) | OK |
| INFO | `group-signals-<id>` | `listen-for-group-signals.js:7` | same file (`:6`) | OK |
| INFO | `call-signals-<id>` | `listen-for-signals.js:7` | same file (`:6`) | OK |
| INFO | `notifs-<id>` | `notifications.js:326` | same file (`:325`) | OK |
| INFO | `chat-<id>` | `open-chat.js:188` | same file (`:187`) + `go.js:11,15` on navigation | OK |
| INFO | `notes-realtime` | `setup-notes-realtime.js:4` | same file (`:3`) | OK |
| INFO | `self-profile-<id>` | `setup-self-profile-realtime-sync.js:5` | same file (`:4`) + `profile.js:332,333` | OK |
| INFO | `typing-<id>` | `start-typing-watcher.js:25` | same file (`:24`) + `go.js` | OK |

**Auth listeners:** exactly 1 (`onAuthStateChange`, `index.html:604` — the protected bootstrap boundary). **Broadcast/presence listeners: 0.** **Total subscription-removal calls: 22** across the owning files plus navigation cleanup (`go.js`, `end-call.js`, `leave-group-call.js`, `profile.js`).

**Never-unsubscribed subscriptions: 0 found statically.** `setup-posts-realtime.js` contains `removeChannel` without creation by design — it is a documented no-op that defensively cleans up channels from older app versions ("global posts realtime subscription intentionally removed (Part 6 Fix 1)"). The `realtime-subscription-lifecycle-contract-harness.js` (PASS) additionally enforces the lifecycle contract. No duplicate-subscription findings requiring action.

---

## 6. Broken References

**Script `src`, CSS `href`, CSS `url()`, service-worker precache, and manifest icon references pointing at missing files: 0.** Every one of the 464 external script tags, 18 stylesheets, all `url()` targets inside CSS, all 5 `sw.js` precache entries (`/`, `/index.html`, `/icon-192.png`, `/icon-180.png`, `/manifest.json`), and all manifest icons resolve to existing files. This is corroborated by the app-load test (463/463 local scripts HTTP 200, 18/18 CSS HTTP 200) and the disk-integrity check (no orphans/missing).

| Severity | File : Line | Reference | Problem | Why it matters | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|---|
| LOW | `docs/contract-artifact-pairing-contract.md:22` | `docs/contract-artifact-pairing-harness.js` | Naming drift: the document references the harness without the `-contract` infix; the actual file is `docs/contract-artifact-pairing-contract-harness.js`. | Future readers may look for a nonexistent file; the pairing harness itself passes and validates the real name. | Correct the referenced filename in the markdown. | Yes (doc-only, one line). |

**False positive, documented for the record:** `docs/reels-renderer-navigation-independent-proof-contract-harness.js:377,384,403` references `src/features/reels-renderer-experimental.js`, which does not exist — intentionally. The harness builds a *synthetic candidate HTML string* to simulate and hash the extraction candidate; it never reads that path from disk. Verified in context.

---

## 7. JavaScript Errors

**Syntax errors: 0** across all 464 local JavaScript files (every file compiles via `node --check` in the app-load test and via `new vm.Script` compilation in the sequential load simulation).

**Load-time runtime errors: 0.** The detached VM simulation executed all 464 local scripts in exact `index.html` order (Supabase CDN stubbed) with zero exceptions. This also proves there are no cross-script `const`/`let` redeclaration SyntaxErrors and no load-order ReferenceErrors. Post-load inventory: 783 window function owners and 23 window state bindings defined — matching the static owner census.

**Undefined function references (call-position identifiers with no definition anywhere): 0 outside the stale-ID class below.** The 18 static inline HTML handlers in `index.html` all resolve to defined window owners; the one scan hit, handler `if`, is `index.html:70`'s `onkeydown="if(event.key==='Enter'...)"` — a conditional expression, not a function reference.

| Severity | File : Line | Problem | Why it matters | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|
| MEDIUM | `src/features/profile-view.js:548` | `btn.onclick = () => eval(a.action);` — `eval()` of action strings built from a static internal array (`shareUserProfile('${userId}')` etc.), interpolating `userId`. | `eval` executes whatever the string becomes; if the actions array ever includes dynamic/user-influenced content, this becomes arbitrary code execution. Today the only interpolated value is a Supabase UUID, so practical risk is low, but the pattern is fragile and blocks CSP hardening. | Replace with a dispatch table: map each action to a direct function call (`actions` entries carry `{fn: shareUserProfile, args: [userId]}`). Behavior-preserving, one function. | Not auto — small manual refactor with regression run. |

---

## 8. Script Load-Order Risks

**Full sequential VM simulation: 0 load errors across 464 scripts** (see section 7). Static order assertions on the parsed 465-tag script list:

| Dependency pair | Order | Verdict |
|---|---|---|
| Supabase CDN (#1) → `src/core/supabase.js` (#2) → `src/features/auth.js` (#18) → first DB consumer | ✓ | OK |
| `url-base64-to-uint8-array.js` (#63) → `push-subscription-owner.js` (#434) → `push-force-resubscribe-owner.js` (#435) → `push-silent-resubscribe-owner.js` (#436) | ✓ | OK |
| `core/state.js` (#3) → `core/navigation.js` (#8); `core/utils.js` (#9) before first feature module | ✓ | OK |
| `auth.js` (#17) → `show-app.js` (#355) → `nova-init.js` wrapper (#447) | ✓ | OK |
| `ai-moderation.js` (#111) → `nova-ultra-patches.js` (#444) (`initNovaFeatures` chain) | ✓ | OK |
| All six Nova-Ultra patch targets (`nova-ai.js` #14, `local-ai-response.js` #59, `ai-generators.js` #98, `smart-feed.js` #99, `nova-universe.js` #107, `ai-context.js` #134) → `nova-ultra-patches.js` (#444) | ✓ | OK |
| `destroy-reels-persistent-container.js` (#442) → `nova-ultra-patches.js` (#444) | ✓ | OK |
| `dms-renderer-owner.js` (#432) vs `open-chat.js` (#370) | renderer loads later | **Load-time safe** — `openChat()` calls `renderDMs()` only at runtime, long after both modules are loaded; no top-level reference exists. Not a defect. |
| `posts.js` base `toggleLike` (#19) → `nova-ultra-patches.js` (#444) → `like-effects.js` (#465) | ✓ | Documented wrapper chain; `like-effects.js` header explicitly states it loads after the inline script by design. |
| 19 scripts after the inline application script (#445) | by design | Late-bound owner/wrapper modules (`jump-to-message-owner.js`, `nova-init.js`, `spawn-like-particles.js`, `like-effects.js`, the `-owner.js` family). All top-level code is definitions and guarded listeners; none dereferences the inline global lexical state at load time (VM run proves it). |

**Load-order violations found: 0.** No script was reordered during this audit.

---

## 9. Dead / Unused Files

**Unreferenced `src/` JavaScript files: 0** — all 463 modules are linked from `index.html` (corroborated by the app-load orphan check). **Unreferenced image/media assets: 0.** **Unused CSS classes: 0** (heuristic over all 18 stylesheets against HTML + JS template strings).

| Severity | Item | Classification | Why it matters | Recommended action | Auto-fix safe? |
|---|---|---|---|---|---|
| LOW | `chore: add feature architecture` (root, 1 byte) | **SAFE TO REMOVE** | Junk artifact of a shell-quoting mistake (commit `90a57d8`); tracked in git, executable bit set. | `git rm` in a dedicated hygiene commit. | Yes. |
| LOW | `addStoryTextMode()` — `src/features/story-text-helpers.js:2-10` | **NEEDS REVIEW → likely SAFE TO REMOVE** | Zero call sites anywhere in the repo. It is the legacy story-creator text mode superseded by the `se-*` story-editor system. If it were ever called, line 4 (`prev.style.background` on `story-prev`, which never exists) would throw — dead code that would crash if revived. The rest of `story-text-helpers.js` (`seOpenTextTool`, `seCloseTextPanel`, `se-update-text-preview`, etc.) is alive and used. | Remove the single dead function (keep the file); verify with the story-editor contract harnesses. | Not auto — one-function removal + regression. |
| LOW | `showNavDebugLog()` / `clearNavDebugLog()` — `src/core/navigation.js:29,40` | **NEEDS REVIEW** | Zero call sites outside their own file; console-debug utilities for the navigation debug log. Harmless at runtime. | Remove in a hygiene batch, or keep deliberately as console-accessible diagnostics (`window.showNavDebugLog()` is callable from DevTools). | Borderline — safe with regression. |
| INFO | 14 empty `src/features/<domain>/` scaffolding dirs + 3 `.gitkeep` in `src/core/`, `src/components/`, `src/styles/` | **NEEDS REVIEW** | Reserved landing spots for an optional directory reorganization (for example, gathering the ~48 Calls/WebRTC modules into `src/features/calls/`). Currently unused. | Keep until the reorganization decision; they cost nothing. | No — decision required. |
| INFO | `setup-posts-realtime.js` | **LIKELY REQUIRED (by design)** | Intentional no-op that defensively removes stale `postsSub` channels from older app versions running in the same tab. Not dead. | Keep. | No. |
| INFO | `docs/` contracts, evidence `.txt`, and migration records | **LIKELY REQUIRED** | The audit/evidence trail for 234+ extraction commits; `contract-artifact-pairing` and readiness harnesses pin their existence. | Keep. | No. |

---

## 10. HTML Integrity Issues

**Duplicate `id` attributes in static `index.html` markup: 0.** **Static inline handler attributes: 18, all resolving** to defined global owners. **JS `getElementById` references: 281 unique; 36 flagged by the static scan were dynamic prefix patterns (`lbtn-`, `am-row-`, `gc-video-`, `se-field-`, `tab-`, …) that are correctly constructed as `id="<prefix>"+id` in templates — false positives.** The remaining findings are the audit's most consequential class — **stale IDs: elements consumed but never created anywhere (static HTML, JS template strings, or property assignment)**:

| Severity | Stale ID | Consumed at | Real element | Impact | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|---|
| **HIGH** | `cinp` | `src/features/smart-replies.js:34` (`quickSendReply`) | Chat input is `id="minp"` (`src/features/open-chat.js:143`) | **User-visible silent feature break:** smart-reply chips render (wired via `onclick="quickSendReply(...)"`), but clicking them does nothing — `if(inp)` guard fails, so the reply is never inserted or sent. | Change `getElementById('cinp')` → `getElementById('minp')`. | Yes — one-line change + regression; behavior matches the visible UI intent. |
| **MEDIUM** | `cinp` | `src/features/ai-moderation.js:23` (comment pre-check in the `sendCmt` wrapper) | Comment input is `id="ci-${postId}"` (`src/features/comments.js:63`) | Comment moderation pre-screen never runs (`if(inp)` fails), so flagged comments are not blocked client-side. The moderation wrapper itself still calls through. | Look up `ci-${pid}` using the `pid` argument already available in the wrapper. | Mostly — needs the `pid` interpolation, small manual change. |
| **HIGH** | `vlenpick`, `vlen-opts` | `src/features/video-length-options.js:3-4`; `src/features/prev-media.js:18` | No template creates either ID | **User-visible feature break:** `showVideoLengthOptions(duration)` *is* invoked on video metadata load (`prev-media.js:12`) but returns at the `if(!wrap||!opts) return;` guard — the video length picker UI (15s/30s/60s/… presets and trimming entry) never renders. | Recreate the picker container in the media preview template (`prev-media.js` renders `mprev-media`) or rewire `showVideoLengthOptions` to append its own container; verify with creation-upload contract harnesses. | No — UI-template change with feature review. |
| **MEDIUM** | `notif-dot` | `src/features/notifications.js:11,204,327`; `src/features/nova-universe.js:148` | Home topbar creates `id="home-notif-dot"` (`src/features/home.js:103`) — but nothing ever updates it either | **User-visible degradation:** the unread-count query runs and the realtime `INSERT` listener fires, but the badge dot never displays (both the count setter and the realtime setter target the nonexistent `notif-dot`; the created `home-notif-dot` has no updater). Notification *content* still refreshes via `renderNotifs()`. | Either rename the consumers to `home-notif-dot` (and add the count/text update logic to the home dot, which is currently a bare 8px dot without text) or create a shared `notif-dot` in the topbar template. | No — requires deciding which badge design wins; cross-file wiring change. |
| **MEDIUM** | `following-count` | `src/features/update-my-following-count.js:3`; `src/features/refresh-profile-counts-owner.js:12-13` | Profile stats template uses `id="followers-count"` with `data-raw` (`src/features/profile-view.js:395`); the "Following" stat has no ID at all | Optimistic following-count update and profile-counts refresh for Following silently no-op (`if` guards). The followers side works. | Add `id="following-count" data-raw="…"` to the Following stat in `profile-view.js:395` (mirroring `followers-count`) and the same in `profile.js`'s stats template. | Mostly — template edit + `refresh-profile-counts` harness check. |
| LOW | `react-box` | `src/features/pin-msg.js:10`, `src/features/unsend-msg.js:10`, `src/features/message-clipboard-helpers.js:7` (removal only) | Never created anywhere | Harmless legacy cleanup no-ops (`if(box) box.remove()`). Confusing but zero runtime impact. | Optionally delete the three stale removal lines in a hygiene batch. | Yes (guarded no-ops — deleting them cannot change behavior). |
| LOW | `story-prev`, `story-text-tools`, `story-submit-btn` | `src/features/story-text-helpers.js:3,6,8` (only inside dead `addStoryTextMode`) | Story editor uses the `se-*` ID system (`show-create-story.js`) | No runtime impact — the only consumer is the dead legacy function (section 9). | Remove together with `addStoryTextMode`. | Yes (same batch as the dead function). |

**Broken form controls / malformed `data-*` attributes: none found.** The `onkeydown`/`oninput` inline wiring on forms all resolves.

---

## 11. PWA / Service Worker Issues

| Severity | File : Line | Problem | Why it matters | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|
| MEDIUM | `sw.js:8` (`CACHE_NAME = 'novasocial-v1'`) + cache-first policy for non-navigation assets (`sw.js:62-66`) | The cache name has never been versioned since creation, and same-origin GET assets are served cache-first once cached. After a deployment, returning PWA users can keep receiving stale feature modules until the SW itself updates (and the SW file itself is subject to HTTP cache lifetimes). | Users may run mixed old/new module versions after deploys — the classic split (one owner per file) makes partial staleness more likely to produce cross-module mismatches. | Adopt a deploy-time cache-versioning convention: bump `CACHE_NAME` (for example `novasocial-v2`) with each release batch, or switch feature scripts to a stale-while-revalidate/network-first policy. Deploy-impacting change — needs its own authorization per the standing rules. | No — service-worker policy change; user said do not change the SW in this task. |
| INFO | `sw.js:12-18` precache list | Precaches only `/`, `/index.html`, icons, `manifest.json` — minimal shell, all files exist. | Intentional Phase 0 design; fine. | None. | — |
| INFO | `sw.js:23-30` activate handler | Deletes all caches not matching the current name — stale-version cleanup present. | Correct behavior once versioning is adopted. | None. | — |
| INFO | `index.html:539` SW registration | Registered at root scope (`/sw.js`, exists, scope `/`). | Correct. | None. | — |
| INFO | `manifest.json` | `start_url`, `scope`, and all three icons (`icon-180.png`, `icon-192.png`, `icon-512.png`) exist and resolve. | Correct. | None. | — |

---

## 12. CSS Issues

| Severity | Item | Detail | Verdict |
|---|---|---|---|
| INFO | `--nova-card` / `--nova-card2` defined in both `src/styles/variables.css` (defaults `#0A0A0A` / `#121212`) and `src/styles/themes.css` (per-`[data-theme]` overrides: aurora, holo, sunset, ocean, pure) | Not a conflict — this is the theme-override system working as designed: `variables.css` sets defaults, `themes.css` re-declares per theme. | By design. No action. |
| INFO | 11 selectors appear in 2+ stylesheets: `.clist`, `.msheet`, `.mhdr`, `.post`, `.av`, `.inp`, `.nitem`, `.skel-card`, `.sbar2` (all base file + `themes.css`), `#screen` (`layout.css` + `performance.css`), `#nav` (`layout.css` + `responsive.css`) | Theme re-styling and responsive overrides — the documented CSS layering (18 source-order-preserving sheets from the Phase 1 extraction). | By design. No action. |
| INFO | Duplicate stylesheets: **0** (all 18 CSS files are unique content). Unused CSS classes: **0** (heuristic). Broken `url()` references: **0**. | — | Clean. |

---

## 13. Security Findings

No secret values are reproduced in this report; all matches are masked.

| Severity | File : Line | Finding | Why it matters | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|---|
| **HIGH (systemic)** | Codebase-wide | **398 `innerHTML`/`insertAdjacentHTML` assignments; 72 with direct template interpolation; and no `escapeHtml`/sanitizer helper is defined anywhere in the repo (0 definitions, 0 usages).** A subset interpolates user-controlled content: typing usernames (`start-typing-watcher.js:31`), optimistic chat text (`send-msg.js:33`), pinned message text (`pin-msg.js:9`), story text elements (`story-editor-owners.js:20`), search-result names (`search-dm.js:6`, `search-gc.js:9`, `search-add-members.js:14`), post attribution (`posts.js:20`), and the explore query echo (`explore.js:140`). | A username or message containing HTML/script becomes executable in every consumer's session (stored/reflected XSS). Supabase auth limits *who* can store content, but any authenticated user can craft such content, so this is a real cross-user attack surface, not just self-XSS. | Introduce a shared `escapeHtml()` in `src/core/utils.js`, then progressively wrap the user-controlled interpolations listed above (highest-touch first: chat, comments, notifications, search). Consider CSP as defense-in-depth afterwards. | No — behavior-sensitive; needs staged fixes with regression per batch. |
| MEDIUM | `src/features/profile-view.js:548` | `eval(a.action)` (see section 7). | Code-execution primitive on a string built with interpolation. | Replace with a dispatch table. | No — manual refactor. |
| INFO | `src/core/supabase.js:2` | Supabase key committed in frontend. JWT payload role = **`anon`** (masked `eyJhbGciOi…`). | This is the public anon key — the correct pattern for Supabase client-side usage; RLS governs access. **No `service_role` key is committed anywhere.** | None — correct as-is. | — |
| INFO | `src/features/call-nova-ai.js:6-16`, `src/features/nova-universe.js:65-68` | AI API key read from `window.ZAI_API_KEY` at runtime; **never defined or committed in the repo** (injected outside version control). | If injected client-side it is visible to users by design — an accepted pattern for client-only AI calls, but worth documenting. If the key grants billed/quota'd access, consider proxying through an Edge Function. | Document the injection point; consider a server proxy if the key is sensitive. | No — architectural decision. |
| INFO | `src/features/search-giphy.js:20` | Giphy public beta API key (`dc6zaTOx…`, masked) hardcoded. | Well-known public demo key, rate-limited; not a private secret leak. | Optionally move to a config or your own key. | Yes (config change). |
| INFO | — | `localStorage` scan: no token/session/password/JWT keys stored; sensitive-storage findings: **0**. Session handling is Supabase-managed. | — | None. | — |
| INFO | — | `eval` elsewhere: **0**. `new Function`: **0**. `document.write`: **0**. | — | — | — |

---

## 14. Documentation Drift

**Core inventory claims are accurate at `6a4d591`:** measured 463 `src/` JS files, 452 feature files, 18 CSS files, 322 harness files, 338 Markdown docs, 465 script tags (464 external + 1 inline) — all matching `HANDOFF.md` section 3 and the `branch2-final-readiness-contract-harness.js` pins. `MIGRATION_MAP.md` and `HANDOFF.md` are current through the 2026-09-05 structural-audit entry.

| Severity | Item | Problem | Recommended fix | Auto-fix safe? |
|---|---|---|---|---|
| LOW | `docs/branch2-final-readiness-contract-harness.js:157-159` | Assertion *messages* are stale relative to their pinned values (message says "321 harness files" while asserting 322; "317 standard contract documents" while asserting 318; "316 standard contract harnesses" while asserting 317). Assertions themselves are correct. | Update the three message strings in a doc-hygiene commit. | Yes (message-only). |
| LOW | `docs/contract-artifact-pairing-contract.md:22` | References `docs/contract-artifact-pairing-harness.js`; actual filename is `…-contract-harness.js` (see section 6). | Fix the filename in the markdown. | Yes. |
| LOW | `docs/branch2-only-safety-contract-harness.js` | The `LATEST_CHECKPOINT` console label is hardcoded (`NOVAULTRAPATCHES_EXTRACTION`) and lags each new docs commit. No assertion depends on it. | Cosmetic; optionally derive from the commit subject. | Yes. |
| INFO | `HANDOFF.md` section 1 prose | Describes "the primary application source remains in `index.html`" — accurate historically, but post-split the inline script is now only the boundary surface (state + bootstrap + 3 listeners); section 6 already says this correctly. | Optional prose refresh at the next handoff update. | Yes. |

---

## 15. Critical Issues

**None.** Zero broken file references, zero syntax errors, zero load-time failures, zero duplicate function implementations, zero duplicate realtime subscriptions, zero committed secrets.

---

## 16. High-Risk Issues

1. **H1 — Smart-reply buttons are dead wiring.** `src/features/smart-replies.js:34` reads `cinp`; the chat input is `minp` (`src/features/open-chat.js:143`). Rendered chips do nothing when tapped. One-line fix; auto-fix safe with regression.
2. **H2 — Video length picker UI never renders.** `showVideoLengthOptions()` is invoked (`src/features/prev-media.js:12`) but its containers `vlenpick`/`vlen-opts` (`src/features/video-length-options.js:3-4`) are never created, so the function returns at its guard. Requires a template fix plus feature review.
3. **H3 — Systemic XSS surface with zero escaping infrastructure.** 398 `innerHTML` assignments (72 interpolated, ~10 with user-controlled text) and no `escapeHtml` helper exists anywhere. Highest-touch flows: typing indicator username, chat optimistic text, pinned text, story text, search names, post attribution. Requires a staged escaping rollout.

---

## 17. Medium-Risk Issues

1. **M1 — Notification badge chain is dead.** Count setter and realtime setter target `notif-dot` (`src/features/notifications.js:11,327`) which is never created; the created `home-notif-dot` (`src/features/home.js:103`) has no updater. Content refresh still works.
2. **M2 — Client-side comment moderation pre-check is dead.** `src/features/ai-moderation.js:23` reads `cinp`; the comment input is `ci-${pid}` (`src/features/comments.js:63`).
3. **M3 — Optimistic Following-count update is dead.** `following-count` (`src/features/update-my-following-count.js:3`, `src/features/refresh-profile-counts-owner.js:12`) never exists; the real stat is `followers-count` (`src/features/profile-view.js:395`) and Following has no ID.
4. **M4 — `eval()` in profile action sheet.** `src/features/profile-view.js:548`; replace with a dispatch table.
5. **M5 — Service-worker cache staleness.** `novasocial-v1` cache name never versioned + cache-first asset policy (`sw.js:8,62-66`) risks serving mixed old/new modules after deploys.
6. **M6 — Repo hygiene.** Junk root file `chore: add feature architecture` (commit `90a57d8`) and 14 empty feature scaffolding directories give a misleading structure picture (also a prerequisite decision point for any future reorganization).
7. **M7 — Dead legacy function that would crash if revived.** `addStoryTextMode` (`src/features/story-text-helpers.js:2-10`) has zero call sites and dereferences nonexistent IDs unguarded.

---

## 18. Low-Risk Issues

1. **L1** — `docs/contract-artifact-pairing-contract.md:22` references a harness filename missing the `-contract` infix.
2. **L2** — Stale assertion messages in `branch2-final-readiness-contract-harness.js:157-159` (values correct, text lags).
3. **L3** — Hardcoded `LATEST_CHECKPOINT` label in the safety harness console output.
4. **L4** — Three guarded no-op `react-box` removals (`pin-msg.js:10`, `unsend-msg.js:10`, `message-clipboard-helpers.js:7`) reference an element that no longer exists anywhere.
5. **L5** — Dead debug owners `showNavDebugLog`/`clearNavDebugLog` (`src/core/navigation.js:29,40`) with no call sites (DevTools-callable by design; keep or remove deliberately).

**Informational (no action):** 33 shared global state flags across files (by-design architecture); `--nova-card*` and 11 cross-file selectors are the theme/responsive override system; 654 inline template handlers are the documented legacy pattern; `window.ZAI_API_KEY` runtime injection (never committed); Giphy public beta key; the 19 intentionally-late-bound scripts after the inline application script.

---

## 19. Recommended Fix Order

Ordered by user-visible impact ÷ risk, with the standing rules (one bounded change per commit, Branch2 only, regression after each):

| # | Fix | Why this order | Safe to automate? |
|---|---|---|---|
| 1 | **H1:** `smart-replies.js:34` `cinp` → `minp` | Highest impact-to-effort ratio; one line; restores a user-visible feature immediately. | Yes (with full regression). |
| 2 | **M2:** `ai-moderation.js:23` `cinp` → `ci-${pid}` (pid in scope) | Same class as #1, one line, restores client-side moderation gate. | Mostly. |
| 3 | **M3:** add `id="following-count" data-raw` to the Following stat in `profile-view.js:395` + `profile.js` stats template | Two template attributes; restores optimistic count + refresh-profile-counts module purpose; has a dedicated harness to verify. | Mostly. |
| 4 | **M1:** notification badge — decide `home-notif-dot` vs shared `notif-dot`, then rewire `notifications.js:11,204,327` and `nova-universe.js:148` | Restores badge UX; needs a small design decision (dot with count text vs bare dot). | No — design decision. |
| 5 | **H2:** recreate `vlenpick`/`vlen-opts` container in the media preview template or self-append in `video-length-options.js` | Restores the video length UI; medium-size template change; validate with creation-upload harnesses. | No. |
| 6 | **H3 (staged):** add `escapeHtml()` to `src/core/utils.js`; wrap user-text interpolations starting with `start-typing-watcher.js:31`, `send-msg.js:33`, `pin-msg.js:9`, `search-dm.js:6`, `posts.js:20`, `story-editor-owners.js:20`, `explore.js:140` | Security debt; each wrap is small and independently verifiable — do one file per commit. | Per-file yes, with targeted harness runs. |
| 7 | **M4:** replace `eval(a.action)` with a dispatch table in `profile-view.js` | Small, isolated; unblocks future CSP. | No — manual refactor. |
| 8 | **M5:** adopt SW cache versioning (bump `CACHE_NAME` per release or network-first for scripts) | Prevents stale-module mixing after future deploys; deploy-gated. | No. |
| 9 | **M6/M7/L1-L5 hygiene batch:** remove junk root file, dead `addStoryTextMode`, stale `react-box` lines, fix the two doc filenames and three harness message strings | Pure cleanup; zero behavior surface; one hygiene commit with regression. | Yes. |

---

## Audit Totals

| Metric | Value |
|---|---|
| Files scanned (tracked) | 1270 |
| JS source files scanned (static + VM) | 464 (463 `src/` + `sw.js`) |
| Harnesses executed (read-only) | 322 — all PASS |
| App-load checks | 10 — all PASS |
| VM sequential-load simulation | 464 scripts, **0 errors** |
| Exact duplicate file groups | 1 (junk file + 17 `.gitkeep`, all 1 byte) |
| Near-duplicate / backup files | 0 / 0 |
| Duplicate function owners (function-valued, multi-file) | 2 — both intentional patch chains |
| Duplicate shared-state names (informational) | 33 |
| Top-level function/lexical declaration collisions | 0 / 0 |
| Broken code references (scripts/CSS/SW/manifest) | 0 |
| Broken documentation references | 1 (naming drift) |
| Syntax errors | 0 |
| Suspected runtime issues (verified real) | 7 stale-ID items (4 user-visible, 3 harmless) + 1 `eval` |
| Duplicate event listeners (actionable) | 0 |
| Duplicate realtime subscriptions | 0 |
| Auth listeners | 1 (correct) |
| Dead files (unreferenced) | 0 |
| Dead functions | 2 (`addStoryTextMode`, nav-debug pair) |
| Unused CSS classes / unreferenced assets | 0 / 0 |
| Security findings | 1 HIGH (systemic XSS surface, no escaping helper), 1 MEDIUM (`eval`), 72 MEDIUM-pattern `innerHTML` interpolations, 0 committed secrets |
| Critical / High / Medium / Low | 0 / 3 / 7 / 5 |

---

## Machine-Readable Summary

```json
{
  "audit": "CODEBASE_HEALTH_AUDIT",
  "date": "2026-09-05",
  "branch": "Branch2",
  "checkpoint": "6a4d591ef6dda89926dd55a458ead182bbfd6dc6",
  "origin_main_immutable": "ef418007c9b9a797488b4825be5f0c807da22369",
  "mode": "READ-ONLY",
  "totals": {
    "files_scanned": 1270, "js_files_scanned": 464, "harnesses_pass": "322/322",
    "app_load": "10/10", "vm_load_errors": 0,
    "duplicate_file_groups": 1, "duplicate_function_owners": 2, "shared_state_names": 33,
    "broken_code_references": 0, "broken_doc_references": 1, "syntax_errors": 0,
    "duplicate_listeners_actionable": 0, "duplicate_subscriptions": 0, "auth_listeners": 1,
    "dead_files": 0, "dead_functions": 2, "unused_css_classes": 0,
    "security": { "high": 1, "medium": 1, "medium_pattern_innerhtml": 72, "committed_secrets": 0 },
    "severity": { "critical": 0, "high": 3, "medium": 7, "low": 5 }
  },
  "findings": [
    { "id": "H1", "sev": "HIGH", "file": "src/features/smart-replies.js", "line": 34, "issue": "stale-id", "detail": "reads cinp; real chat input id is minp (open-chat.js:143); quick-reply buttons render but do nothing", "fix": "cinp -> minp", "auto": true },
    { "id": "H2", "sev": "HIGH", "file": "src/features/video-length-options.js", "line": 3, "issue": "stale-id", "detail": "vlenpick/vlen-opts never created; picker UI never renders though called from prev-media.js:12", "fix": "recreate container in preview template", "auto": false },
    { "id": "H3", "sev": "HIGH", "file": "codebase-wide", "line": 0, "issue": "xss-surface", "detail": "398 innerHTML assignments, 72 interpolated, ~10 user-controlled; no escapeHtml helper exists", "fix": "add escapeHtml to core/utils.js; staged wrap of user-text interpolations", "auto": false },
    { "id": "M1", "sev": "MEDIUM", "file": "src/features/notifications.js", "line": 11, "issue": "stale-id", "detail": "notif-dot never created; home-notif-dot (home.js:103) never updated; badge chain dead", "fix": "reconcile badge id + updater", "auto": false },
    { "id": "M2", "sev": "MEDIUM", "file": "src/features/ai-moderation.js", "line": 23, "issue": "stale-id", "detail": "reads cinp; comment input is ci-${pid} (comments.js:63); moderation pre-check dead", "fix": "ci-${pid} lookup", "auto": true },
    { "id": "M3", "sev": "MEDIUM", "file": "src/features/update-my-following-count.js", "line": 3, "issue": "stale-id", "detail": "following-count never created; real stat followers-count (profile-view.js:395); Following has no id", "fix": "add id/data-raw to Following stat", "auto": true },
    { "id": "M4", "sev": "MEDIUM", "file": "src/features/profile-view.js", "line": 548, "issue": "eval", "detail": "eval(a.action) on internal array string with userId interpolation", "fix": "dispatch table", "auto": false },
    { "id": "M5", "sev": "MEDIUM", "file": "sw.js", "line": 8, "issue": "sw-cache-staleness", "detail": "novasocial-v1 never versioned; cache-first for assets risks stale mixed modules after deploys", "fix": "version cache per release or network-first for scripts", "auto": false },
    { "id": "M6", "sev": "MEDIUM", "file": "chore: add feature architecture", "line": 0, "issue": "junk-file", "detail": "1-byte shell accident from commit 90a57d8; plus 14 empty feature scaffolding dirs", "fix": "git rm junk; decide scaffolding fate", "auto": true },
    { "id": "M7", "sev": "MEDIUM", "file": "src/features/story-text-helpers.js", "line": 2, "issue": "dead-function", "detail": "addStoryTextMode zero call sites; unguarded refs to nonexistent story-prev/story-text-tools/story-submit-btn", "fix": "remove function", "auto": false },
    { "id": "L1", "sev": "LOW", "file": "docs/contract-artifact-pairing-contract.md", "line": 22, "issue": "doc-drift", "detail": "references harness name without -contract infix", "fix": "fix filename", "auto": true },
    { "id": "L2", "sev": "LOW", "file": "docs/branch2-final-readiness-contract-harness.js", "line": 157, "issue": "doc-drift", "detail": "assertion messages lag pinned values (321 vs 322 etc.)", "fix": "update messages", "auto": true },
    { "id": "L3", "sev": "LOW", "file": "docs/branch2-only-safety-contract-harness.js", "line": 61, "issue": "doc-drift", "detail": "hardcoded LATEST_CHECKPOINT label lags new docs commits", "fix": "cosmetic", "auto": true },
    { "id": "L4", "sev": "LOW", "file": "src/features/pin-msg.js", "line": 10, "issue": "stale-id", "detail": "guarded react-box removal no-ops (also unsend-msg.js:10, message-clipboard-helpers.js:7)", "fix": "remove stale lines", "auto": true },
    { "id": "L5", "sev": "LOW", "file": "src/core/navigation.js", "line": 29, "issue": "dead-function", "detail": "showNavDebugLog/clearNavDebugLog no call sites", "fix": "remove or keep as DevTools diagnostics", "auto": false }
  ]
}
```

*Audit tooling (read-only, outside the repository): `/home/z/my-project/scripts/audit_duplicates.js`, `audit_listeners.js`, `audit_references.js`, `audit_vm_load.js`, `audit_deadcode_html_css.js`, `audit_security.js`, `analyze_structure.js`; raw outputs under `/home/z/my-project/audit_out/`. No repository code was modified by this audit. The publication of this report itself is accompanied by the deliberate count-sync of the documentation inventory pins, per the repository's published protocol.*
