# Dead v2 Wrapper Guard Investigation — NOVASOCIAL Branch2

**Phase:** 1 (read-only investigation — no repairs, no production changes, no commits, no push)
**Date:** 2026-09-05
**Investigator:** Super Z (GLM session), Task ID `dead-v2-guard-investigation`
**Repo state at investigation start:** `HEAD = 41f048b = origin/Branch2`, `origin/main = ef418007` (immutable), worktree clean, 322/322 harnesses PASS, 10/10 app-load PASS.

---

## 1. Executive Summary

Three "v2" wrapper guards (`_origCheckUnread`, `_origSendCmt`, `_origInitNova`) are dead because their guard conditions — and their delegation (`apply`) calls — reference variable names that are **not declared anywhere in the repository**. This is not a typo introduced during the Branch2 extraction; git archaeology proves the guards were already dead in `origin/main` and have been dead since the **2026-07-27 source upload**.

**Root cause (all three guards share one origin):** the original production HTML contained *paired* wrapper copies — a v1 copy (`const _origX = window.fn;`) whose guard self-referenced correctly, and a v2 copy (`const _origX_v2 = window.fn;`) whose guard and body still referenced the **v1 name**. On 2026-07-27 the v1 declarations were deleted from the uploaded source, orphaning every v2 guard. `typeof` on an undeclared identifier returns `'undefined'` silently (no exception), so the wrappers stopped installing with **zero error output** — a silent feature death.

Key empirical results (Node `vm` simulation, 91/91 assertions; full 322/322 regression re-run green):

1. **Guards #1 (`_origCheckUnread`) and #2 (`_origSendCmt`) are single-blocker dead:** the wrapped base functions load *before* the wrapper files in Branch2's script order, so the capture succeeds — only the orphaned name keeps the guard false. A one-line declaration rename would activate each wrapper.
2. **Guard #3 (`_origInitNova`) is double-blocker dead:** besides the orphaned name, `src/features/ai-moderation.js` (index.html:313) loads **before** `src/features/nova-init.js` (index.html:1645), so `window.initNovaFeatures` is `undefined` at capture time. A name fix alone is **provably inert** (sim test T5).
3. **Repair hazard (verified):** a naive "guard-only" repair activates the wrapper but leaves the body's v1-name delegation dangling → `ReferenceError` on first call (notification badge chain or comment submission would break). Any repair must fix **both** the guard and the `apply` target (a single declaration rename does both).
4. **New discovery — separate split-induced regression (not one of the three guards):** the correctly-named ultra wrapper `_origInitNovaFeatures2` (`nova-ultra-patches.js:355`) was **LIVE in origin/main** (proven empirically, test T1-A5: `updateMyInterests` ran 5s after login) but is **inert on Branch2** because the extraction placed `nova-ultra-patches.js` (line 421) before `nova-init.js` (line 1645). The header comment at `nova-ultra-patches.js:5-6` claiming "preserved pre-split behavior" is **incorrect**. Result: smart-feed interest auto-detection (`updateMyInterests`, smart-ranking.js:98) has silently not run since the split.
5. **Related dead-guard family (beyond the three in scope):** three more orphaned v2 guards of the same lineage exist in `nova-ultra-patches.js` (`_origShowNovaUniverseHub` :60, `_origGenerateAICaption` :113, `_origGetLocalAIResponse` :127).

**Verdicts:** Guard #1 → HUMAN DECISION REQUIRED · Guard #2 → HUMAN DECISION REQUIRED · Guard #3 → DO NOT REPAIR (as-is).

No production source files were modified. No wrappers were activated. No live database, network, notification, or account actions were performed. `git diff` after this investigation contains only this document.

---

## 2. Guard #1 — `_origCheckUnread` (Dynamic Island notification wrapper)

### 2.1 Location

`src/features/nova-universe.js:144-156` (extraction-inherited; identical block in `origin/main:index.html:19590-19599`):

```js
// Patch checkUnreadNotifs to also show dynamic island
const _origCheckUnread_v2 = window.checkUnreadNotifs;          // line 145 — declaration (v2 name)
if(typeof _origCheckUnread === 'function'){                    // line 146 — GUARD (v1 name — undeclared)
  window.checkUnreadNotifs = async function(){                  // line 147
    const prevCount = parseInt(document.getElementById('home-notif-dot')?.dataset.count || '0');
    await _origCheckUnread.apply(this, arguments);              // line 149 — BODY delegation (v1 name — undeclared)
    const dot = document.getElementById('home-notif-dot');
    const newCount = parseInt(dot?.dataset.count || '0');
    if(newCount > prevCount){
      showDynamicIsland(`🔔 ${newCount} new notifications`, '🔔');
    }
  };
}
```

### 2.2 Variables referenced by the guard

| Reference | Kind | Status |
|---|---|---|
| `_origCheckUnread` (guard, line 146) | identifier read via `typeof` | **Never declared anywhere in the repo** — git archaeology shows it was the v1 wrapper's const, deleted in the 2026-07-27 upload (last present in commit `02cafd5`, 2026-07-05, at index.html:13009) |
| `_origCheckUnread_v2` (declaration, line 145) | `const`, script-scope lexical binding | Declared and initialized — captures the base function **successfully** (see 2.4) |
| `_origCheckUnread` (body, line 149) | `.apply` target | Same undeclared v1 name — a second, hidden landmine (see 2.6) |

`typeof` on an unresolvable reference does **not** throw; it returns `'undefined'`, so line 146 evaluates false and lines 147-155 never execute. No console error is ever produced. That is why this has survived five release uploads, the origin/main rename, and 240+ Branch2 extraction commits unnoticed.

### 2.3 Wrapped code controlled by the guard

An async replacement for `window.checkUnreadNotifs` that:
1. Reads the unread count **before** the base call (`home-notif-dot.dataset.count` — the dataset contract introduced by audit FIX 4, commit 5b8ea7a);
2. Awaits the original unread-count query;
3. Reads the count **after**;
4. If the count increased, calls `showDynamicIsland('🔔 N new notifications')` — a floating top banner (`nova-universe.js:129-142`, z-index 99999, auto-hides after 3s).

### 2.4 Base function and capture status

- Base: `checkUnreadNotifs` — `src/features/notifications.js:8-16` (queries `db.from('notifications')` count, toggles `home-notif-dot`, writes `dataset.count`).
- Load order (index.html): `notifications.js` at **line 229** → `nova-universe.js` at **line 309**. The capture on line 145 therefore happens **after** the base is defined and succeeds (classic scripts; function declarations create the window property at script evaluation).
- **Conclusion: the name is the ONLY blocker for Guard #1. Load order is not a blocker.**

### 2.5 Full reference trace (Branch2)

| Site | File:line | Nature |
|---|---|---|
| Declaration `_origCheckUnread_v2` | nova-universe.js:145 | capture (succeeds) |
| Guard `_origCheckUnread` | nova-universe.js:146 | dead condition |
| Delegation `_origCheckUnread.apply` | nova-universe.js:149 | dead body reference |
| Base definition | notifications.js:8 | `async function checkUnreadNotifs` |
| Wrapper install target | nova-universe.js:147 | `window.checkUnreadNotifs = ...` |
| Caller (profile load) | load-prof.js:33 | `checkUnreadNotifs();` (fire-and-forget) |
| Caller (every Home render) | home.js:155 | `checkUnreadNotifs();` (fire-and-forget, added by FIX 4) |
| `showDynamicIsland` definition | nova-universe.js:129-142 | shared banner factory |
| `showDynamicIsland` other callers | voice-assistant.js:22, 78, 96, 103, 163, 187 | live feature — proves the island UI itself works today |
| Documentation | MIGRATION_MAP.md:4597, HANDOFF.md:469, 522 | deferred-item records |
| Harness pins | **none** | no harness pins the `_origCheckUnread` strings (verified by grep across docs/*-harness.js) |

Call chain today (dead guard): `loadProf / every Home render → window.checkUnreadNotifs (BASE) → Supabase count query → dot toggle`. The island is never triggered by notifications; it is only used by the voice assistant.

Call chain if repaired: `loadProf / Home render → wrapper → [prev-count read] → BASE (exactly once) → [new-count read] → showDynamicIsland if increased`.

### 2.6 Partial-repair hazard (empirically verified, test T3 C-1)

Repairing **only the guard** (line 146 → `typeof _origCheckUnread_v2`) installs the wrapper, but line 149 still evaluates `_origCheckUnread.apply` → **`ReferenceError: _origCheckUnread is not defined`** on every call. Because `checkUnreadNotifs()` is invoked fire-and-forget from `load-prof.js:33` and `home.js:155`, every profile load and every Home render would raise an unhandled promise rejection and the badge chain would stop updating. The complete minimal repair is a **single declaration rename** on line 145 (`_origCheckUnread_v2` → `_origCheckUnread`), which makes guard, body, and declaration mutually consistent.

### 2.7 Classification

**(A) Genuine bug — accidental feature death by historical deduplication.** Evidence: v1+v2 paired wrappers exist in uploads `8e26c10` (2026-07-03) and `02cafd5` (2026-07-05); v1 declarations are absent from every upload starting `58615b3/df9ae99/19ab465` (2026-07-27) through `ef41800` (origin/main, 2026-08-10) and all of Branch2. In the paired era the v2 wrapper was the live one (its guard passed via the still-declared v1 const and its body called the base captured by v1's const), so deleting the v1 declarations is what killed the feature. It was **not** an intentional dormancy decision — there is no comment, commit message, or documentation supporting intentional dormancy.

**Feature dead since:** 2026-07-27 (pre-dates origin/main's tip and the entire Branch2 line).

### 2.8 Recommended next action

**HUMAN DECISION REQUIRED** — repairing is a *product* decision, not a correctness fix:
- The repair itself is low-risk (verified: single execution, no recursion, no listener/timer/subscription duplication, thenable return — see section 6.1), and `nova-universe.js` is already on the branch2-only-safety-contract allowlist.
- But it activates a user-visible feature (notification banners) that users have never seen in any deployed version since 2026-07-27 — including users of origin/main.
- If approved: one-line declaration rename at nova-universe.js:145 + HANDOFF/MIGRATION_MAP ledger entries + awareness of the two minor UX notes in section 7 (concurrent-call double banner; island element shared with voice assistant).
- If declined: the dead block (lines 144-156) is a clean removal candidate for a later hygiene commit.

---

## 3. Guard #2 — `_origSendCmt` (comment moderation pre-check wrapper)

### 3.1 Location

`src/features/ai-moderation.js:19-33` (extraction-inherited; identical block in `origin/main:index.html:19860-19873`):

```js
// Patch sendCmt to auto-moderate
const _origSendCmt_v2 = window.sendCmt;                        // line 20 — declaration (v2 name)
if(typeof _origSendCmt === 'function'){                        // line 21 — GUARD (v1 name — undeclared)
  window.sendCmt = function(pid){                              // line 22
    const inp = document.getElementById('ci-'+pid);            // line 23 — fixed by audit FIX 2 (1e422fa)
    if(inp){
      const mod = moderateContent(inp.value);                  // line 25 — banned-word pre-check
      if(mod.flagged){
        toast('⚠️ Comment flagged for: ' + mod.reason + '. Please follow community guidelines.');
        return;                                                 // line 29 — BLOCKS the comment
      }
    }
    return _origSendCmt.apply(this, arguments);                // line 31 — BODY delegation (v1 name — undeclared)
  };
}
```

`moderateContent` (ai-moderation.js:8-17): case-insensitive **substring** match against `['spam','scam','fake','abuse','hate','violent']`; first match wins.

### 3.2 Variables referenced by the guard

| Reference | Kind | Status |
|---|---|---|
| `_origSendCmt` (guard, line 21) | identifier read via `typeof` | **Never declared** — v1 const deleted 2026-07-27 (last present in `02cafd5` at index.html:13083) |
| `_origSendCmt_v2` (declaration, line 20) | `const` | capture **succeeds** (comments.js loads earlier) |
| `_origSendCmt` (body, line 31) | `.apply` target | undeclared — same partial-repair landmine as guard #1 |

### 3.3 Base function and capture status

- Base: `sendCmt` — `src/features/comments.js:85-108` (ban check → reads `#ci-<pid>` input → clears it → `db.from('comments').insert` → notification to post owner → `openComments(pid)` refresh).
- Load order (index.html): `comments.js` at **line 224** → `ai-moderation.js` at **line 313**. Capture succeeds.
- **The name is the ONLY blocker for Guard #2. Load order is not a blocker.**
- Entry points: inline HTML attributes in comments.js:63 (`onkeydown="...sendCmt('${pid}')"`) and :64 (`onclick="sendCmt('${pid}')"`) — runtime global lookups, so an installed wrapper **would** intercept them.

### 3.4 Comment-moderation connection (task question B)

- **Yes, this wrapper IS the client-side comment moderation layer.** It is the only moderation gate in the comment submission path (server-side there is only the rate-limit error path in the base function, comments.js:94-96).
- **The moderation pre-check currently does NOT execute.** The guard is false, so `window.sendCmt` is the unmodified base function; `moderateContent` is dead code (zero call sites reachable).
- Historical note: even in the "live" paired era (≤ 2026-07-05), the wrapper body read a **stale `#cinp` element id** (real ids were already per-post `ci-<pid>`, cf. `02cafd5:index.html` line 2523), so `document.getElementById('cinp')` returned `null`, `if(inp)` was false, and the pre-check silently passed everything through. **This moderation feature has never once actually blocked a comment in any version of this app.** Audit FIX 2 (commit 1e422fa) corrected the lookup to `ci-<pid>`, so a *repaired* wrapper would moderate for the first time ever.
- The HANDOFF.md:469 note ("fix 2's corrected lookup alone does not activate the comment-moderation pre-screen") is confirmed by this investigation.

### 3.5 What exactly changes if the wrapper activates (verified, tests T4 D1-D9)

- Comments whose text contains any of the six banned substrings are **blocked client-side**: no insert, no owner notification, no comment-list refresh; user sees the toast.
- Clean comments behave identically to today: exactly one insert, input cleared, one owner notification attempt, one `openComments` refresh, thenable-compatible return.
- Missing input element (`#ci-<pid>` absent): moderation is skipped and the base still guards itself — no crash.

### 3.6 Partial-repair hazard (empirically verified, test T4 D-1)

A guard-only repair makes the **first clean comment** throw `ReferenceError: _origSendCmt is not defined` (line 31) inside the onclick handler — comment submission silently dies for every user. The minimal correct repair is the single declaration rename at ai-moderation.js:20.

**Repair cost note:** unlike guard #1, `docs/ai-moderation-contract-harness.js` **pins the dead-guard naming** — line 14 requires `'const _origSendCmt_v2 = window.sendCmt'` and line 18 requires `'return _origSendCmt.apply(this, arguments)'` to exist in the module. Either repair style breaks one of the two pins, so any activation commit must update the harness markers in the same change (a deliberate contract-marker sync, same pattern used by FIX 2).

### 3.7 Classification

**(A) Genuine bug (same v1-deletion lineage), with a caveat:** the intended feature has *never functionally worked* (stale `cinp` in the live era; dead guard ever since). This is not legacy code that used to work and rotted — it is a feature that was born broken, was half-duplicated, and then went fully dark.

**Dead since:** 2026-07-27 (guard); never functionally active at any earlier date either.

### 3.8 Recommended next action

**HUMAN DECISION REQUIRED**:
- Activating introduces a brand-new user-facing behavior (client-side comment blocking) that no production version has ever exhibited, including origin/main. Product sign-off is required, and the banned-word list should be reviewed (English-only words, substring matching, in a Hinglish-first app — false-positive/negative review needed).
- If approved: declaration rename at ai-moderation.js:20 + `docs/ai-moderation-contract-harness.js` marker sync (lines 14/18 kept consistent with the new spelling) + HANDOFF/MIGRATION_MAP ledger entries.
- If declined: `moderateContent` + both wrapper blocks in ai-moderation.js (lines 19-33, 42-49) become removal candidates for a later hygiene commit — but see guard #3 first, because the initNova wrapper block lives in the same file.

---

## 4. Guard #3 — `_origInitNova` (Nova Ultra init wrapper)

### 4.1 Location

`src/features/ai-moderation.js:42-49` (extraction-inherited; identical block in `origin/main:index.html:19883-19889`):

```js
// Patch initNovaFeatures to also init ultra features
const _origInitNova_v2 = window.initNovaFeatures;              // line 43 — declaration (v2 name)
if(typeof _origInitNova === 'function'){                       // line 44 — GUARD (v1 name — undeclared)
  window.initNovaFeatures = function(){
    _origInitNova.apply(this, arguments);                      // line 46 — BODY delegation (v1 name — undeclared)
    initUltraFeatures();                                       // line 47 — initDynamicUI() + mood load
  };
}
```

`initUltraFeatures` (ai-moderation.js:36-40) calls `initDynamicUI()` — `nova-universe.js:159-162`: `applyDynamicBackground()` **plus `setInterval(applyDynamicBackground, 60000)`** — and reads `currentMood` from localStorage.

### 4.2 Variables referenced by the guard — TWO independent blockers

| Reference | Kind | Status |
|---|---|---|
| `_origInitNova` (guard, line 44) | identifier read via `typeof` | **Never declared** — v1 const deleted 2026-07-27 (last in `02cafd5` at index.html:13106) |
| `_origInitNova_v2` (declaration, line 43) | `const` | **captures `undefined`** — see below |
| `_origInitNova` (body, line 46) | `.apply` target | undeclared |

**Second blocker — load order.** Base: `initNovaFeatures` — `src/features/nova-init.js:9-17` (loads at index.html **line 1645**, after the inline application block). Wrapper file: `ai-moderation.js` (index.html **line 313**). At script-evaluation time of line 43, `window.initNovaFeatures` does not exist yet, so `_origInitNova_v2 === undefined`. Even with a perfect name fix, `typeof _origInitNova_v2 === 'function'` is false. **Empirically proven (test T5 E1: name-only repair remains inert; zero side effects).**

This differs from origin/main, where the entire app lived in **one hoisted classic script block** (index.html lines 674-23746): function declarations were hoisted, so `window.initNovaFeatures` existed before the wrapper lines ran, and the capture would have succeeded. The Branch2 extraction reversed the relative order for this pair, adding the second blocker.

### 4.3 Nova initialization layer and who performs the work today

- The Nova init layer is `nova-init.js`: base `initNovaFeatures` (loadSavedTheme, setupLogoLongPress, setupProfileNavHold, setupDraggableFAB) plus the **live** showApp wrapper seam (nova-init.js:337-344, pinned by `docs/extracted-wrapper-seam-contract-harness.js`): every `showApp()` call schedules `setTimeout(initNovaFeatures, 100)`.
- `initNovaFeatures` is invoked **only** through that wrapper chain (sole call site nova-init.js:342). Entry points: bootstrap `showApp()` at index.html:575 and :607, and auth.js:45.
- **What this wrapper would add if activated:** time-of-day background theming (applyDynamicBackground), a 60-second refresh interval, and currentMood restore. No other code path initializes these (the only other `initDynamicUI`/`applyDynamicBackground` callers are inside this dead chain and the voice-assistant-free nova-universe declarations).

### 4.4 Dynamic Island / Nova Ultra activation status (task question C)

- Dynamic Island **UI** (`showDynamicIsland`): already live — used by voice-assistant.js (7 call sites). Guard #1 (not this guard) controls the *notification-driven* island.
- **Nova Ultra v4/v5 init:** `initUltraFeatures` would become active only if this wrapper were activated. Today it never runs — confirmed by simulation (no `localStorage['nova-current-mood']` read, no interval registered: tests T2 B4/E2).
- **Another init path already performing the same work?** No. `updateMyInterests` (smart-ranking.js:98, the *other* Ultra init-layer wrapper, see 4.5) is separately inert post-split, and nothing else reads `nova-current-mood` at init or applies time-based backgrounds.

### 4.5 The sibling ultra wrapper — a split-induced divergence (new finding, outside the three guards but essential context)

`nova-ultra-patches.js:354-366` wraps `window.initNovaFeatures` with a **correctly-named** guard (`_origInitNovaFeatures2`) to run `updateMyInterests()` (interest auto-detection for smart feed, smart-ranking.js:98) 5 seconds after init.

- **origin/main (single hoisted block): LIVE.** Empirically verified — test T1 A5: after `showApp()`, the 100ms init ran the ultra wrapper and the 5s timer fired `updateMyInterests` exactly once.
- **Branch2 (current order): INERT.** `nova-ultra-patches.js` (index.html:421) loads **before** `nova-init.js` (1645) — the capture is `undefined`. Test T2 B5: `updateMyInterests` never fires.
- The file's own header (nova-ultra-patches.js:5-6) says the toggleLike and initNovaFeatures guards are "intentionally inert when their targets load after this module (preserved pre-split behavior)". The "preserved pre-split behavior" claim is **factually wrong for initNovaFeatures**: pre-split, the ultra wrapper was live (hoisting made the target available). For toggleLike the claim is functionally true only because its guard body is empty (nova-ultra-patches.js:15-17) — it was a no-op even when the guard passed pre-split.
- Consequence: **the split silently regressed smart-feed interest auto-detection.** This is a pre-existing Branch2 defect independent of the three named guards and is recorded here for the owner's decision (restoring it requires load-order surgery — see 6.3 — plus an interval-leak fix for the v2 chain if guard #3 is ever activated in the same commit).

### 4.6 Full call/patch chain (current, all layers)

```
bootstrap/auth login
  → showApp()                                    (index.html:575/607, auth.js:45)
  → window.showApp = nova-init wrapper           (nova-init.js:338-344 — LIVE)
      → base showApp()                           (show-app.js:5)
      → setTimeout(initNovaFeatures, 100)
          → window.initNovaFeatures = BASE       (nova-init.js:9 — no wrapper installed)
              [ai-moderation v2 wrapper: DEAD — orphaned name + capture undefined]
              [nova-ultra wrapper:    INERT — capture undefined (load order)]
              → loadSavedTheme / long-press / FAB setup
          [updateMyInterests: NEVER runs post-split — origin/main ran it 5s later]
```

### 4.7 Classification

**(C) Obsolete/dead patch code as currently positioned — plus (A) lineage.** The v1-deletion bug (2026-07-27) killed it first; the Branch2 extraction's load-order reversal made it doubly unreachable. Even the "obvious fix" (name repair) provably changes nothing. In its current position the block is unreachable by any single-line repair, which is the definition of dead code.

### 4.8 Recommended next action

**DO NOT REPAIR (as-is).** Specifically:
- A name-only repair is inert (no behavior change, no risk, no benefit) — pointless churn that would still require ai-moderation-contract-harness.js marker sync (line 22 pins `'const _origInitNova_v2 = window.initNovaFeatures'`, line 23 pins `'_origInitNova.apply(this, arguments)'`).
- Full activation requires: (1) declaration rename, (2) moving `ai-moderation.js` after `nova-init.js` in index.html (ai-moderation's position is not pinned, but nova-init's late position IS pinned by four harnesses — branch2-final-readiness, modularization-completeness, module-script-reference, extracted-wrapper-seam — so nova-init must stay put), (3) fixing the **interval leak** first (see 6.3), (4) harness marker sync, (5) deciding whether the ultra `updateMyInterests` wrapper should chain in the same change. That is a designed feature-restoration project, not a guard fix.
- The dead block (ai-moderation.js:42-49) plus `initUltraFeatures` (36-40) are removal candidates in a later hygiene commit **if** the owner decides the Ultra init chain is not wanted; if the owner wants it, restore it as a deliberate, idempotent initializer (single guarded interval, e.g. `if(!window.__novaUltraInitDone)`).

---

## 5. Call / Patch Chains (summary diagrams)

### 5.1 Guard #1 — notification badge / dynamic island

```
index.html:229  notifications.js     → window.checkUnreadNotifs = BASE (async, db count query, dot + dataset.count)
index.html:309  nova-universe.js     → const _origCheckUnread_v2 = BASE  ✓ capture OK
                                        if (typeof _origCheckUnread)      ✗ DEAD (undeclared v1 name)
                                        [wrapper never installed]

Runtime today:  load-prof.js:33 ─┐
                home.js:155  ────┴─→ BASE → Supabase count → dot update          (island: never)
Runtime if repaired: same callers → WRAPPER → BASE (once) → island if count grew
Pre-v1-deletion (≤2026-07-05): v2 wrapper live via v1's const; island fired on growth (body read notif-dot textContent — matching the then-current base contract).
```

### 5.2 Guard #2 — comment submission / moderation

```
index.html:224  comments.js         → window.sendCmt = BASE (async, insert + notif + refresh)
                                        inline onclick/onkeydown handlers (comments.js:63-64) → global lookup at click time
index.html:313  ai-moderation.js    → const _origSendCmt_v2 = BASE  ✓ capture OK
                                        if (typeof _origSendCmt)      ✗ DEAD
                                        [moderateContent never called]

Runtime today:  click → BASE → insert (unmoderated)                            (moderation: never, in any era)
Runtime if repaired: click → WRAPPER → moderateContent → [flagged: toast+block] or → BASE → insert
Live-era note (≤2026-07-05): wrapper installed but body read stale #cinp → null → passthrough (never blocked anything).
```

### 5.3 Guard #3 + ultra wrapper — Nova init layers

```
index.html:313  ai-moderation.js    → const _origInitNova_v2 = window.initNovaFeatures  = undefined (nova-init not loaded) ✗✗
index.html:421  nova-ultra-patches  → const _origInitNovaFeatures2 = window.initNovaFeatures = undefined ✗ (correct name, late target)
index.html:1645 nova-init.js        → window.initNovaFeatures = BASE
                                        window.showApp = wrapper (captures show-app.js BASE ✓ LIVE)

origin/main (single hoisted block 674-23746): all captures succeeded; v2 guards dead by name only;
                                        ultra wrapper LIVE → initNovaFeatures = ultra(BASE + updateMyInterests@5s)

Runtime today:  showApp() → nova-init wrapper → BASE showApp + 100ms → initNovaFeatures = BASE only.
Runtime origin/main:  showApp() → ... → initNovaFeatures = ultra wrapper → BASE + 5s updateMyInterests.
Runtime if guard #3 fully activated: initNovaFeatures = [ultra →] v2(BASE + initUltraFeatures) [+ 5s interests]
                                        with a 60s interval LEAK per login (see 6.3).
```

### 5.4 Historical patch lineage (git archaeology)

| Date | Commit | State |
|---|---|---|
| 2026-07-03 | `8e26c10` upload | v1+v2 pairs present — v2 wrappers live (guards pass via v1 consts) |
| 2026-07-05 | `02cafd5` upload | v1 (index.html:13009/13083/13106) + v2 (14245/14515/14538) — last version with v1 |
| 2026-07-27 | `58615b3` / `df9ae99` / `19ab465` uploads | **v1 declarations deleted — all three guards orphaned; features die silently** |
| 2026-08-08 | `a70b5f0` (diag 27) | v2-only, dead |
| 2026-08-10 | `a9aa617` → `ef41800` rename | **origin/main tip — dead state inherited** |
| Branch2 | Phase 35 `8a4d995`, Phase 39 `8d0011d` → `41f048b` | blocks extracted verbatim to nova-universe.js / ai-moderation.js — still dead |

Related family members orphaned by the same 2026-07-27 cleanup: `_origShowNovaUniverseHub` (nova-ultra-patches.js:60), `_origGenerateAICaption` (:113), `_origGetLocalAIResponse` (:127) — all guards reference deleted v1 names; all three wrappers dead (their correctly-named siblings at :180/:279/:373 are live).

---

## 6. Runtime Impact Analysis (simulated, no wrappers activated in production code)

All claims below are backed by the persisted simulation script `/home/z/my-project/scripts/dead_v2_guard_sim.js` (Node `vm`, real repo files loaded in exact index.html order, real wrapper regions extracted verbatim from `origin/main:index.html`; stubbed DOM/db/timers that only record actions). Result: **91/91 assertions PASS**.

### 6.1 Guard #1 (`_origCheckUnread`) — impact if repaired

| Question | Finding (test IDs) |
|---|---|
| New code that would execute | wrapper before/after count comparison + `showDynamicIsland` on increase (T3 C1) |
| User-facing change | floating "🔔 N new notifications" banner appears when unread count grows (never seen since 2026-07-27) |
| Wrapped function executes twice? | **No** — base runs exactly once per wrapper call (T3 C2) |
| Wrapper calls itself recursively? | **No** — captured base is pre-replacement object; call counts prove 1:1 (T3 C2) |
| Initialization twice? | N/A (no init in this chain) |
| Event listeners registered twice? | **No** (T3 C6b) |
| Supabase realtime subscriptions duplicated? | **No** — wrapper adds zero channels; `setupNotifsRealtime` untouched (T3 C6b) |
| Depends on not-yet-initialized functions? | **No** — `showDynamicIsland` defined in same file; base loaded earlier |
| Execution-order change? | Base runs *inside* the wrapper's await — same relative order for callers; wrapper returns thenable (T3 C0) |
| Breaks existing behavior? | Complete repair: no. **Partial (guard-only) repair: YES — ReferenceError on every call; badge chain dies** (T3 C-1) |
| Runtime exception risk? | Only in the partial-repair scenario; `parseInt` NaN paths default to 0 (safe) |
| App startup affected? | No — nothing in the load path changes; wrapper installs at script-eval time as a no-op |
| Notifications/chat/Nova Ultra affected? | Notifications: badge logic unchanged; adds banner only. Chat/comments/Nova Ultra: untouched |
| Known minor UX notes | (a) concurrent overlapping calls can double-fire the banner (T3 C6, UX-level, not recursion); (b) the island element is shared with voice-assistant — simultaneous use overwrites content (single `#dynamic-island` node, nova-universe.js:130-136); (c) banner shows total unread ("N new notifications" with N = total, not delta — cosmetic wording bug in the dead body, pre-existing) |

### 6.2 Guard #2 (`_origSendCmt`) — impact if repaired

| Question | Finding (test IDs) |
|---|---|
| New code that would execute | `moderateContent` substring scan before every comment submit |
| User-facing change | comments containing `spam/scam/fake/abuse/hate/violent` (case-insensitive substrings) are blocked with a toast; **first time this feature would ever work in the app's history** |
| Comment moderation connected? | **Yes — this IS the client-side moderation gate** (currently does not execute; see 3.4) |
| Wrapped function executes twice? | **No** — exactly one insert per clean comment (T4 D4) |
| Recursion? | **No** (T4 D4) |
| Listeners/realtime duplicated? | **No** — wrapper adds nothing; input `onkeydown`/`onclick` handlers unchanged |
| Depends on uninitialized functions? | **No** — `moderateContent` same file; `toast` is a core util |
| Execution-order change? | moderation runs before base; blocked path skips insert+notification+refresh by design (T4 D1) |
| Breaks existing behavior? | Complete repair: no crash; behavior intentionally changes (blocking). **Partial repair: first clean comment throws ReferenceError → all commenting silently dies** (T4 D-1) |
| Runtime exception risk? | Complete repair: none observed across flagged/clean/missing-input cases (T4 D3/D7) |
| App startup affected? | No |
| False-positive scope | substring matching: e.g. "hate" inside longer words, "fake" in "fakemaker" — English-only list vs Hinglish user base (product review recommended) |
| Rate-limit path | untouched — server-side RATE_LIMIT_EXCEEDED handling remains (comments.js:94-96) |

### 6.3 Guard #3 (`_origInitNova`) — impact if fully activated (name fix + load-order change)

| Question | Finding (test IDs) |
|---|---|
| New code that would execute | `initUltraFeatures()` after every initNovaFeatures: `initDynamicUI()` (time-of-day body background + **60s setInterval**) + `currentMood` restore |
| User-facing change | time-based background tinting; mood restore feeds Smart Feed (when Smart Feed used) |
| Dynamic Island / Nova Ultra activation? | Island UI already live (voice assistant); this wrapper adds background theming + mood, NOT the island. `updateMyInterests` (Ultra interest auto-detect) activates only if the sibling ultra wrapper's order is also fixed |
| Another path already does this work? | **No** — nothing else calls initDynamicUI/applyDynamicBackground at init (see 4.4) |
| Wrapped function executes twice? | **No** — base once per chain call (T6 F1) |
| Recursion? | **No** |
| Initialization twice? | **YES — by design of the seam, and it leaks:** `showApp()` runs on every login/session restore; each run schedules `initNovaFeatures` at +100ms; each activated run calls `initUltraFeatures` → **one new 60s interval per login, unbounded accumulation** (T6 F3: 3 logins → 3 intervals). Account switching within a session grows the leak |
| Event listeners registered twice? | The wrapper itself adds none; base setupX() functions add document/fab listeners once per call (pre-existing seam semantics, unchanged by the wrapper) |
| Supabase realtime duplicated? | Not by the wrapper; `showApp` base re-subscribes notifs/posts channels per call — **pre-existing behavior, unchanged** (T6 F5: 4 channel chains across 4 showApp calls, identical with or without the wrapper) |
| Depends on uninitialized functions? | `initDynamicUI` (nova-universe.js:159) and `applyDynamicBackground` (:116) load at index.html:309 — **before** ai-moderation at :313, so callable ✓; `currentMood` is a shared state var (inline block) — assignment works via global |
| Execution-order change? | wrapper runs after base returns; ultra wrapper (if also activated) wraps this wrapper — chain order: ultra → v2 → base (T6 F1) |
| Breaks existing behavior? | Background gradient overlays on body could interact with theme system (product review); mood write could alter Smart Feed defaults |
| Runtime exception risk? | none observed (T6 F4); body.style writes are safe in browser |
| App startup affected? | +100ms delayed extra init only; no blocking work |
| Nova Ultra / chat / comments / notifications? | Nova Ultra: partially (backgrounds + mood; interests only via sibling fix). Chat/comments/notifications: untouched |

### 6.4 What happens if each guard is repaired *in isolation* (matrix)

| Repair | Effect |
|---|---|
| #1 name fix alone (declaration rename) | wrapper activates; island on unread growth; base unaffected (T3) |
| #1 guard-only fix (guard line renamed to _v2) | **ReferenceError per call — badge chain breaks** (T3 C-1) |
| #2 name fix alone | moderation activates for the first time; clean comments identical (T4) |
| #2 guard-only fix | **ReferenceError on first clean comment — all commenting dies** (T4 D-1) |
| #3 name fix alone | **NOTHING — remains inert** (capture ran before nova-init.js) (T5 E1/E2) |
| #3 name fix + order fix | v2 chain activates + 60s interval leak per login (T6 F1-F3) |
| #3 order fix alone (no name fix) | nothing — guard still false (name) |
| ultra sibling order fix (nova-ultra-patches after nova-init) | `updateMyInterests` restored (post-split regression fixed); does NOT touch the three guards |

---

## 7. Duplicate / Recursion / Order Risks

1. **Recursion: none in any scenario.** Each wrapper captures the base *before* replacing the property (`const _origX_v2 = window.fn;` then `window.fn = wrapper`). The wrapper body calls the captured object, never the replaced property. Verified by 1:1 call-count assertions (T3 C2, T4 D4, T6 F1). The only recursion-shaped hazard would be loading the same wrapper script **twice** — impossible in the current index.html (each feature file has exactly one `<script src>` tag; verified: one occurrence each).
2. **Double execution: none** for the wrapped bases. The double-execution risk lives in the *historic* paired era, not today: when v1+v2 both existed (≤ 2026-07-05), v2's body called the base via v1's const while v1's wrapper object was captured-but-never-invoked — net single execution, which is why deleting v1 seemed safe but silently orphaned the guards.
3. **Order risks:**
   - Script-load order is the **second, independent blocker** for guard #3 (ai-moderation.js:313 before nova-init.js:1645) and for the ultra sibling wrapper (421 before 1645) — the extraction's placement of ai-moderation.js/nova-ultra-patches.js in the pre-inline batch reversed the origin/main relative order for the initNova chain.
   - nova-init.js's late position is **pinned by four harnesses** (branch2-final-readiness-contract-harness, modularization-completeness-contract-harness, module-script-reference-contract-harness, extracted-wrapper-seam-contract-harness) — any activation plan for guard #3 must move **ai-moderation.js** later, not nova-init.js earlier.
   - ai-moderation.js's current position is NOT pinned by any order harness (only content pins in ai-moderation-contract-harness.js and the commit allowlist).
4. **Interval leak (guard #3 activation):** `initDynamicUI` registers a fresh `setInterval(applyDynamicBackground, 60000)` on every initNovaFeatures run, and the live showApp seam schedules initNovaFeatures after **every** login/session restore (index.html:575/607, auth.js:45) — unbounded interval growth across re-logins/account switches (T6 F3). Any activation must first add an idempotency guard.
5. **Realtime subscriptions:** the three wrappers add no channels. `showApp` base re-subscribes notifs/posts channels per call — pre-existing, unchanged (T6 F5). No duplicate-subscription risk is introduced by any single guard repair.
6. **Event listeners:** wrapper bodies add none. Guard #3's activated chain re-runs the base's setup listeners per login (pre-existing seam semantics) — out of scope for the guard decision.
7. **Island element contention (guard #1):** `showDynamicIsland` uses a single `#dynamic-island` node also driven by voice-assistant.js — simultaneous triggers overwrite each other's content (cosmetic).
8. **Harness/contract coupling:** guards #2/#3 are **name-pinned** by `docs/ai-moderation-contract-harness.js` (lines 14/18/22/23/31/33) — every repair style breaks exactly one pin pair and requires a deliberate same-commit marker sync. Guard #1 has **no content pins** (only the generic commit allowlist, which already contains nova-universe.js).

---

## 8. Classification

| Guard | File:line | Verdict | One-line rationale |
|---|---|---|---|
| #1 `_origCheckUnread` | nova-universe.js:145-156 | **HUMAN DECISION REQUIRED** | Single-blocker dead; complete repair is low-risk and verified, but activates a user-visible feature (notification island) unseen since 2026-07-27 — a product call, not a bug fix |
| #2 `_origSendCmt` | ai-moderation.js:20-33 | **HUMAN DECISION REQUIRED** | Single-blocker dead; repair activates client-side comment blocking that has **never functioned in any version** — new user-facing behavior + banned-word list product review + harness pin sync required |
| #3 `_origInitNova` | ai-moderation.js:43-49 | **DO NOT REPAIR (as-is)** | Double-blocker dead: name fix alone is provably inert; full activation needs load-order surgery + interval-leak mitigation + harness sync — that is a designed feature-restoration project, not a guard fix. If unwanted, the block is a clean later-removal candidate (OBSOLETE — REMOVE LATER) |

Sub-verdicts for record:
- Root-cause category for all three: **(A) genuine bug** — accidental feature death from the 2026-07-27 v1-declaration cleanup, inherited by origin/main and Branch2.
- Guard #3 additionally: **(C) obsolete/dead as currently positioned** (unreachable by single-line repair).
- None of the three is **(B) intentionally dormant** — no comment, commit, or doc ever declared dormancy; the only "intentional inertness" claim in the codebase (nova-ultra-patches.js:5-6) concerns the *sibling* wrapper and is factually wrong about pre-split behavior anyway.
- **(D) Uncertain** applies to zero guards — all conclusions have direct code+simulation evidence. One adjacent item remains **UNCERTAIN — HUMAN REVIEW REQUIRED**: whether the owner *wants* the split-induced `updateMyInterests` regression fixed (section 4.5) — the evidence is certain, the decision is not.

---

## 9. Recommended Next Actions

| Priority | Action | Scope |
|---|---|---|
| 1 (decision) | Owner decides guard #1: activate island-on-unread-increase (one-line declaration rename at nova-universe.js:145; verified safe; consider delta-count wording + island contention note) OR schedule dead-block removal (lines 144-156) | docs + 1 src line if approved |
| 2 (decision) | Owner decides guard #2: activate client-side moderation (declaration rename at ai-moderation.js:20 + ai-moderation-contract-harness.js marker sync lines 14/18 + banned-word/substring review) OR schedule removal with guard #3's block | docs + 1 src line + harness if approved |
| 3 (do not do) | Guard #3: no repair as-is. If the Ultra init chain is wanted, restore it as a designed, idempotent initializer (interval guard + load-order move of ai-moderation.js after nova-init.js + harness sync) in its own approval cycle | separate project |
| 4 (flag, new finding) | Owner review of the split-induced regression: `updateMyInterests` (smart feed interest auto-detect) live in origin/main, inert on Branch2 (nova-ultra-patches.js:355 load order). Fix = move nova-ultra-patches.js after nova-init.js (order harnesses must be re-checked) or re-point the wrapper to a post-init hook. Also correct the nova-ultra-patches.js:5-6 header comment | separate approval |
| 5 (hygiene, later) | Same-family dead guards in nova-ultra-patches.js (:60, :113, :127) — remove or repair together with any Ultra-patches decision; do NOT fix them silently (same activation semantics as guard #1/#2: they wrap live targets) | later hygiene commit |
| 6 (ledger) | Record this investigation in HANDOFF.md / MIGRATION_MAP.md when the next docs-sync commit happens (this phase intentionally adds no other files) | next docs commit |

---

## 10. Exact Files / Lines Inspected

**Branch2 @ 41f048b (read-only):**
- `index.html` — script order map: :13 (supabase CDN), :224 (comments.js), :229 (notifications.js), :262 (local-ai-response.js), :300 (ai-generators.js), :301 (smart-feed.js), :309 (nova-universe.js), :313 (ai-moderation.js), :355 (show-app.js, within multi-tag line), :421 (nova-ultra-patches.js), :423-1642 (inline application block: state + bootstrap wiring), :1645 (nova-init.js), :575/:607 (bootstrap showApp calls)
- `src/features/nova-universe.js` — :8-53 (hub), :116-126 (applyDynamicBackground), :129-142 (showDynamicIsland), :144-156 (**guard #1**), :159-162 (initDynamicUI)
- `src/features/ai-moderation.js` — full file (50 lines; **guards #2 :19-33, #3 :42-49**, moderateContent :8-17, initUltraFeatures :36-40)
- `src/features/notifications.js` — :8-16 (base checkUnreadNotifs), :18-30, :324-331 (setupNotifsRealtime)
- `src/features/comments.js` — :8-66 (openComments + handlers), :85-108 (base sendCmt)
- `src/features/nova-init.js` — :9-17 (base initNovaFeatures), :337-344 (live showApp wrapper seam)
- `src/features/nova-ultra-patches.js` — :1-7 (header comment), :14-17, :35-56, :59-60, :112-113, :126-127, :180-181, :279-280, :354-366 (ultra sibling), :373-374
- `src/features/show-app.js` — :5-47 (base showApp + lifecycle timers)
- `src/features/smart-ranking.js` — :98 (updateMyInterests)
- `src/features/voice-assistant.js` — :22, :78, :96, :103, :163, :187 (island callers)
- `src/features/load-prof.js` — :33; `src/features/home.js` — :155 (checkUnreadNotifs callers); `src/features/auth.js` — :45 (showApp caller)
- `docs/ai-moderation-contract-harness.js` — :8-36 (full pin list)
- `docs/branch2-only-safety-contract-harness.js` — commit-allowlist (nova-universe.js, ai-moderation.js, notifications.js, home.js present)
- `docs/branch2-final-readiness-contract-harness.js`, `docs/modularization-completeness-contract-harness.js`, `docs/module-script-reference-contract-harness.js`, `docs/extracted-wrapper-seam-contract-harness.js` — nova-init position pins
- `MIGRATION_MAP.md:4597`, `HANDOFF.md:469,522` — prior deferred-item records

**origin/main @ ef418007 (read-only via `git show`):**
- index.html :13/:674/:23746 (script structure), :3420 (checkUnreadNotifs), :5824 (sendCmt), :2222 (showApp), :18213 (initNovaFeatures), :18542-18550 (showApp wrapper), :19562-19609 (dynamic UI + guard #1 region), :19849-19890 (moderation + guards #2/#3 region), :21133 (updateMyInterests), :21393-21405 (ultra wrapper)

**Historical commits (git log -S / git grep):** `8e26c10` (2026-07-03), `02cafd5` (2026-07-05, v1 lines 13009/13083/13106 + v2 lines 14245/14515/14538), `58615b3`/`df9ae99`/`19ab465` (2026-07-27), `61ed56a` (2026-08-02), `9b2f7db` (2026-08-03), `e86960f` (2026-08-07), `a70b5f0` (2026-08-08), `a9aa617`/`ef41800` (2026-08-10)

---

## 11. Tests / Analysis Performed (read-only)

| # | Test | Result |
|---|---|---|
| 1 | Static reference grep: `_origCheckUnread` / `_origSendCmt` / `_origInitNova` across src/, docs/, index.html | complete site map (sections 2-4); guard variables confirmed undeclared repo-wide |
| 2 | Script load-order map of index.html (all relevant tags with line numbers) | order table (section 5); guard #3 double-blocker established |
| 3 | Git archaeology: `git log -S` + `git grep` across 10 historical commits | v1/v2 paired-era timeline; 2026-07-27 v1 deletion identified as root cause |
| 4 | origin/main structural analysis (`git show origin/main:index.html`) | single hoisted block 674-23746; all captures would succeed pre-split; ultra wrapper live pre-split |
| 5 | **VM simulation** `/home/z/my-project/scripts/dead_v2_guard_sim.js` — 6 scenarios, real repo files + verbatim origin/main wrapper regions, stubbed DOM/db/timers: T1 origin/main semantics; T2 current Branch2; T3 guard #1 repaired (+partial-repair hazard); T4 guard #2 repaired (+hazard); T5 guard #3 name-only; T6 guard #3 fully activated (interval leak) | **91/91 PASS** (0 FAIL) |
| 6 | Full read-only regression: all 322 `docs/*-harness.js` from repo cwd (`/home/z/my-project/scripts/run_regression.sh`) | **322/322 PASS / 0 FAIL** (run with a clean worktree, i.e. before this document existed — see the post-document note in section 12) |
| 7 | Harness-pin analysis for repair cost (ai-moderation contract, readiness/completeness/reference/seam, safety-contract allowlist) | pin matrix (sections 3.6, 4.8, 7.8) |

No live database actions, no message/comment sends, no real notifications, no dormant patch activation, no production network mutations were performed. All runtime behavior was observed inside Node `vm` sandboxes with recording stubs.

---

## 12. Git State

- Branch: `Branch2` (only branch checked out; work done exclusively here)
- `HEAD = 41f048b68f4b76c8ce25913df7afe68d223702f6` = `origin/Branch2` (aligned before and after investigation)
- Worktree before this document: **clean** (nothing staged, nothing committed)
- Worktree after this document: single untracked file `docs/DEAD_V2_GUARD_INVESTIGATION.md` — **no tracked file modified** (`git diff` empty; `git status --short` shows only the new untracked doc)
- **Post-document regression note (re-verified 2026-09-05):** while this document remained uncommitted, a regression re-run reported **320/322** — the two failures (`docs/branch2-only-safety-contract-harness.js:15`, `docs/branch2-final-readiness-contract-harness.js:35`) were **self-referential**: both assert `git status --porcelain === ''` (clean worktree), and the untracked document was the only entry in that output. No source regression existed — `git diff` on tracked files was empty, and the VM simulation still passed 91/91.
- **Publication (owner-requested, same day):** after reviewing the uncommitted deliverable, the repository owner requested GitHub publication (same delivery channel as the audit series). The document was committed to **Branch2** together with a deliberate inventory count-sync of `docs/branch2-final-readiness-contract-harness.js` (339 → 340 markdown files, nonstandard-docs exceptions list + this filename, message string updated — assertion strength unchanged, following the audit-series count-sync pattern) and pushed to **origin/Branch2 only**. `origin/main` remains untouched. Phase-1 investigation itself was completed read-only; the commit contains only the document and its harness count-sync — no source files, no wrapper activation.

## 13. Branch / HEAD Summary

```
HEAD:            41f048b (Branch2)  — audit-fix series close-out checkpoint
origin/Branch2:  41f048b (identical — no divergence)
origin/main:     ef418007 (untouched throughout; verified identical before and after)
origin/HEAD:     -> origin/main (default remote HEAD unchanged)
```

## 14. origin/main Integrity Confirmation

- `origin/main` was **never modified**: no commit, no push, no ref update was issued at any point in this phase. Verified: `git rev-parse origin/main` = `ef418007c9b9a797488b4825be5f0c807da22369` before the investigation and after it — byte-identical.
- All `origin/main` content was accessed **read-only** via `git show origin/main:index.html` / `git grep <commit>` / `git log -S`.
- No production source file (HTML/JS/CSS) was modified; no behavior changed; no environment variables, database, service worker, or account state touched; no dormant wrapper was activated in any shipped artifact (activation scenarios ran only inside disposable `vm` sandboxes).
- The only artifacts added to the repository are this document and the deliberate count-sync edit to `docs/branch2-final-readiness-contract-harness.js` required to publish it (owner-requested publication commit; see section 12).
