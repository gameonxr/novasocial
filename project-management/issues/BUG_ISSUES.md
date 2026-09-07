# NOVASOCIAL — Functional / Logic Bug Issues

**Category (root cause):** functional/logic defects — stale DOM-ID wiring, dead wrapper guards, wrong column references, broken feature chains.
**Established:** 2026-09-07 (H11 task) — imported from docs/CODEBASE_HEALTH_AUDIT.md, docs/DEAD_V2_GUARD_INVESTIGATION.md, and the H9 audit's deferred records. Every historical ID, severity, file/line, fix commit, and status preserved.
**Protocol:** see ISSUE_RULES.md.

---

## 1. Stale DOM-ID wiring (Codebase Health Audit, 2026-09-05)

| ID | Date | Severity | Status | File:line | Exact problem | Real element / impact | Reproduction | Fix commit | Verification |
|----|------|----------|--------|-----------|----------------|----------------------|--------------|------------|--------------|
| HA-H1 | 2026-09-05 | HIGH | FIXED | smart-replies.js:34 | quickSendReply reads `getElementById('cinp')` — no template ever creates `cinp` | Chat input is `minp` (open-chat.js:143); smart-reply chips render but do nothing when tapped (silent feature break) | open any chat with smart-reply chips → tap → no insert/send | 26ffd03 | full regression + focused harness (audit fix 1) |
| HA-H2 | 2026-09-05 | HIGH | FIXED | video-length-options.js:3-4 | `vlenpick`/`vlen-opts` containers never created anywhere; showVideoLengthOptions() invoked from prev-media.js:12 but returns at guard | Video length picker UI (15s/30s/60s presets, trimming entry) never renders (user-visible feature break) | create a video post/reel → observe no length picker | 7c395e6 | creation-upload contract harnesses (audit fix 5) |
| HA-M1 | 2026-09-05 | MEDIUM | FIXED | notifications.js:11, 204, 327; nova-universe.js:148 | Count setter + realtime setter target nonexistent `notif-dot`; the created `home-notif-dot` (home.js:103) had no updater | Unread badge dot never displays (content refresh still works) | receive notification while on Home → no badge | 5b8ea7a | dot-toggle + per-render restore verified (audit fix 4, owner option a) |
| HA-M2 | 2026-09-05 | MEDIUM | FIXED | ai-moderation.js:23 | sendCmt wrapper reads `cinp`; comment input is `ci-${postId}` (comments.js:63) | Client-side comment moderation pre-screen never runs | post a flagged comment → not blocked client-side | 1e422fa (+ 3e29452 DG-2 repair required for runtime execution) | harness marker sync + VM 34/34 |
| HA-M3 | 2026-09-05 | MEDIUM | FIXED | update-my-following-count.js:3; refresh-profile-counts-owner.js:12-13 | `following-count` element never existed; profile stats template used `followers-count` (profile-view.js:395) and Following had no id | Optimistic following-count update + Following-side profile-counts refresh silently no-op | follow/unfollow a user on their profile → Following stat stale until reload | 60287fb | refresh-profile-counts harness (audit fix 3) |

## 2. Dead V2 Guard family (docs/DEAD_V2_GUARD_INVESTIGATION.md)

Root cause (all): 2026-07-27 v1-declaration deletion (8e26c10→58615b3 lineage) orphaned v2 wrapper guards; inherited by origin/main and Branch2.

| ID | Date | Severity | Status | Guard | Verdict / impact | Fix commit | Verification |
|----|------|----------|--------|-------|------------------|------------|--------------|
| DG-1 | 2026-09-05 | HIGH | FIXED | _origCheckUnread (nova-universe.js:144-156) — notification Dynamic Island dead since 2026-07-27 | repaired via one-line declaration rename | 6bf3db0 | VM-verified 29/29: no recursion, no double-exec, no sub duplication |
| DG-2 | 2026-09-05 | HIGH | FIXED | _origSendCmt (ai-moderation.js:20-33) — client-side comment moderation dead (born-broken: never worked even pre-split) | repaired via declaration rename + single authorized harness marker sync | 3e29452 | VM 34/34 incl. multilingual pass-through |
| DG-3 | 2026-09-05 | HIGH | OPEN (HUMAN-DECISION) | _origInitNova (ai-moderation.js:42-49) — double-blocked (name + load order nova-init.js:1645 after ai-moderation.js:313); name-only fix provably inert; full activation leaks 60s intervals per login | DO NOT REPAIR as-is — owner decision required | — | — |
| DG-4 | 2026-09-05 | HIGH | OPEN (HUMAN-DECISION) | updateMyInterests (smart-ranking.js:98) never runs on Branch2 — ultra wrapper _origInitNovaFeatures2 (nova-ultra-patches.js:355) inert due to load order (421 < 1645); live in origin/main pre-split | split-induced regression; "preserved behavior" header claim proven wrong | — | — |
| DG-5 | 2026-09-05 | MEDIUM | OPEN | 3 more same-family dead v2 guards in nova-ultra-patches.js (:60 _origShowNovaUniverseHub, :113 _origGenerateAICaption, :127 _origGetLocalAIResponse) | unactivated wrappers | — | — |
| DG-6 | 2026-09-05 | INFO | FIXED | sendCmt moderation-era stale-id bug (historical) | subsumed by HA-M2 + DG-2 fix | 1e422fa + 3e29452 | — |

## 3. Other functional bugs

| ID | Date | Severity | Status | File:line | Exact problem | Provenance | Reproduction | Impact | Recommended fix | Owning task |
|----|------|----------|--------|-----------|----------------|------------|--------------|--------|-----------------|-------------|
| H9-D5 | 2026-09-06 | LOW (cosmetic) | OPEN | add-to-group.js:14 | reads `conversations.name` — column does not exist (table has `group_name`) → undefined → constant 'a group' fallback in notification | H9 audit row #13 | add a member to a group via GC Info suggestions → notification says "added to a group" instead of the group's name | cosmetic (no security leak — constant fallback) | read `group_name` | Cosmetic fix task |

---

## Index of IDs in this file

HA-H1 · HA-H2 · HA-M1 · HA-M2 · HA-M3 · DG-1 · DG-2 · DG-3 · DG-4 · DG-5 · DG-6 · H9-D5
