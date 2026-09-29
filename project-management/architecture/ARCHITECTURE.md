# NovaSocial Feature-Based Architecture + Demand Loading — Master Plan

**Status**: Active migration (2026-09-29)
**Branch**: Branch2 (main is never touched)
**Parent**: `740c4b0e85672edd0f710a4f20f8dabb02a57fff` (all security + non-security issues closed)

---

## 1. Why

Today `index.html` loads **every feature's JavaScript during initial startup**: 464
script tags (463 local classic scripts, ~1.18 MB) execute sequentially before the
inline application script boots the app. A user who only wants the home feed still
downloads and evaluates Reels, Stories, DMs, Calls, Admin, AI, Marketplace, Games,
Calendar, and 15 other feature families.

This migration reorganizes the flat `src/features/` directory (452 files) into
**feature-owned folders** and introduces a **demand loading** layer so feature code
is fetched and evaluated only when the user actually needs it — the publicly
documented startup-minimization principles used by large social apps, adapted to
NovaSocial's actual architecture (classic scripts + global functions, no bundler).

## 2. Current architecture (measured, Phase 0/1 evidence)

- **Loading model**: classic `<script>` tags, no `type=module`, no `defer`/`async`,
  no bundler, no import map, no package.json. Order in `index.html` is the
  dependency contract; files communicate through `window` globals.
- **Entry chain**: 1 external CDN (Supabase) → 9 `src/core/` → 2 `src/components/`
  → 452 `src/features/*.js` (flat) → inline application script (43 KB, position 444)
  → 20 post-inline scripts (`nova-init.js`, `like-effects.js`, owner files).
- **Boot**: inline script `window.addEventListener('load')` → `NovaEngine.boot()`
  → session restore → `loadProf()` → `showApp()` → `go('home')`.
- **Navigation**: single funnel `window.go(tab)` in `src/features/go.js` dispatches
  to `renderHome/renderExplore/renderReels/renderDMs/renderNotifs/renderProfile`
  with skeleton + tab-cache (stale-while-revalidate) already built in.
- **Service worker**: `sw.js` — cache-first for same-origin GETs, network-first
  for navigation, push + notificationclick handlers. Feature chunks fetched via the
  loader are cached by the existing SW with zero `sw.js` changes.

## 3. Dependency analysis (AST-verified, acorn)

Load-time (top-level, outside function bodies) cross-file dependencies exist in
exactly 6 files — all monkey-patch wrappers:

| File | Patches | Live today | Migration treatment |
|------|---------|-----------|---------------------|
| `nova-ultra-patches.js` | `loadMoodFeed` (home) | ACTIVE | split → `home/ultra-patches.js` at original startup position |
| | `handleNovaCommand`, `getLocalAIResponse`(v1+v2), `generateAICaption`(v1+v2) | v1 blocks INERT (guard var never assigned), v2 ACTIVE | split → `ai/ultra-patches.js`, last file of the lazy ai chunk |
| | `showNovaUniverseHub` | INERT (guard var `_origShowNovaUniverseHub` never assigned) | split → `nova-universe/ultra-patches.js`, stays inert by construction |
| | `initNovaFeatures` | INERT today (loads before `nova-init.js` defines it) | stays in the startup-placed home patch file **before** post-inline scripts → inertness preserved |
| `nova-universe.js` | `checkUnreadNotifs` → dynamic island | ACTIVE | stays in STARTUP manifest (patch target is startup notifications) |
| `ai-moderation.js` | `sendCmt` moderation + `initNovaFeatures` | sendCmt ACTIVE, initNovaFeatures INERT (position) | stays in STARTUP manifest at original relative position |
| `like-effects.js` | `toggleLike` particles | ACTIVE | posts chunk is startup; file stays startup |
| `nova-init.js` | `showApp` post-init | ACTIVE | stays startup (post-inline) |

All other 458 files have **zero load-time dependencies** — their cross-file
references live inside function bodies (runtime), which the stub boundary covers.

## 4. Target structure

```
src/
  core/          (unchanged — 9 files)
  components/    (unchanged — 2 files)
  loaders/       (NEW)
    feature-manifest.js   feature → ordered script list + startup registry
    feature-loader.js     loadFeature(name): promise-dedup, sequential inject, retry
    feature-stubs.js      boundary stubs (lazy entry functions)
    preload-manager.js    idle prefetch (network-warm only), connection-aware
  features/
    system/  auth/  notifications/  home/  posts/  media/  themes/   ← STARTUP
    reels/  stories/  dms/  groups/  calls/  profile/  explore/     ← LAZY (main tabs)
    ai/  notes/  admin/  settings/                                  ← LAZY
    marketplace/ communities/ games/ learning/ news/ calendar/
    voice-rooms/ live-stream/ nova-universe/ memories/
    scheduled-posts/ creator/                                       ← LAZY (small)
```

Folder = ownership. **Chunk ≠ folder**: small behavior-coupled files stay in the
STARTUP script list even when their folder is lazy (see §5).

## 5. Startup critical path (119 scripts, ~383 KB local vs 1,218 KB today = 68.6% cut)

core (9) + components (2) + loaders (4) + feature folders: system (incl. FAB +
tab-cache + `nova-init`), auth (login is the first screen), notifications (badge +
push + realtime subscriptions), home (initial route), posts (feed rendering,
like/comments actions), media (shared Cloudinary/video observers), themes (static
HTML references `setTheme`), plus these **service files** from lazy folders:

- `notes/`: `setup-notes-realtime.js`, `cleanup-expired-notes.js` (called by `showApp`)
- `profile/`: `setup-self-profile-realtime-sync.js` (called by `showApp`)
- `calls/`: `init-calling-system.js` (incoming-call realtime subscription)
- `stories/`: `cleanup-expired-stories.js`, `cleanup-expired-story-media.js`
- `dms/`: `sync-local-deletion-fallback.js`, `get-blocked-list.js`,
  `get-blocked-both-ways-set.js` (feed rendering reads blocked sets)
- `ai/`: `ai-moderation.js` (sendCmt patch timing)
- `nova-universe/`: both files (checkUnreadNotifs patch + dynamic island)
- `posts/`: `spawn-like-particles.js`, `like-effects.js` (toggleLike patch targets)

The inline application script and post-inline startup scripts
(`smart-ranking.js`, `nova-init.js`) keep their exact relative order.

## 6. Demand-loaded features (22 chunks, ~835 KB)

| Feature | Files | Trigger |
|---|---|---|
| reels | 9 | `go('reels')` tab gate |
| explore | 3 | `go('explore')` tab gate, hashtag/search taps |
| dms | 65 | `go('dms')` tab gate, `openChat`/`startDM` stubs |
| profile | 16 | `go('profile')` tab gate, `showUserProfile`/`viewAvatarFullscreen` stubs |
| stories | 68 | `openSv`/`showCreateStory` stubs (feed story ring, FAB) |
| calls | 37 | `initiateCall`/`handleIncomingCall` stubs |
| groups | 32 | `showGc`/`createGc`/`openChat` stubs |
| ai | 9 | `toggleNovaAI`/`sendNovaMsg`/`generateAICaption` stubs (static panel HTML) |
| notes | 32 | `showNotes`/`createNote` stubs |
| admin | 54 | `showAdminPanel` stub |
| settings | 8 | `showSettings`/`restoreFabButton` stubs |
| marketplace/communities/games/learning/news/calendar/voice-rooms/live-stream/memories/scheduled-posts/creator/nova-universe-hub-entry | 1–2 each | universe hub + AI command stubs |

## 7. Loader contract (`src/loaders/`)

- `loadFeature(name)` returns a cached Promise; sequential script injection
  preserves the current global order within the chunk; duplicate concurrent calls
  share one promise; failures clear the pending entry so the next call retries;
  debug logging behind a flag.
- **Backward compatibility**: while a feature's scripts are still present as
  `<script>` tags in the document (transitional state), `loadFeature` resolves
  immediately — this makes the migration incrementally activatable per feature.
- `feature-stubs.js` replaces lazy entry globals with stubs that
  `loadFeature(...).then(() => window[name].apply(...))` — after the chunk loads,
  the real file's definition overwrites the stub. A guard throws a clear error if
  the chunk loaded but never defined the function (no silent recursion).
- `go(tab)` gains a pre-dispatch gate: if the tab's feature is not loaded, show
  the existing skeleton, `await loadFeature`, then render. Cache-restore path:
  restored HTML shows instantly, `_silentBackgroundRefresh` awaits the feature.
- `preload-manager.js` (network-warm only, no execution): idle-time `fetch()` of
  likely-next feature scripts (home → reels + stories), hover/touch intent on
  `.nb` nav buttons; skipped when `navigator.connection.saveData` or
  `effectiveType` is 2g/slow-2g or `downlink < 1`.

## 8. Media loading policy

Existing: `init-video-observer.js` (IntersectionObserver for feed videos),
`reels-video-windowing.js` (reels window), `optimize-cloudinary-url.js`
(transforms). Migration adds `loading="lazy" decoding="async"` on feed images
where missing — verified per-file, no renderer rewrites.

## 9. Cache policy

`sw.js` unchanged: same-origin GETs are cache-first, so feature chunks become
SW-cached after first fetch. No private API responses are cached by the loader.
`CACHE_NAME` versioning stays as-is.

## 10. Migration cycles (each independently verified + committed)

1. ✅ Phase 0/1/2 analysis — this document (no production change)
2. ✅ Loader infrastructure (inert while all script tags present) + loader harness
3. ✅ Admin pilot: folder move + script-tag removal + stub activation + proof harness
4. ✅ Small discover features (marketplace … creator) — folder + demand loading
5. ✅ settings + notes + ai (incl. `nova-ultra-patches.js` split)
6. ✅ stories + dms
7. ✅ calls + groups (final lazy families — boundary notes in
   `docs/calls-groups-demand-loading-proof-contract.md`: 11 group-call WebRTC
   files live in the calls chunk to match the committed stub routing;
   `get-connection-quality.js` stays an eager service because the eager feed
   optimizer `optimize-cloudinary-url.js` calls it synchronously; 4 eager
   service files stay tagged in `src/features/calls/`; `showGroupInfo` stub
   added for dms chat headers. Startup after this cycle: 128 scripts /
   ~400 KB tagged + ~42 KB inline ≈ 443 KB vs 1,218 KB baseline)
8. ✅ profile + explore + reels (go() tab gating) — completed with cycle 5
9. Startup families re-foldered (posts, home, media, system, auth,
   notifications) — tags stay, paths update only. **Status: deferred —
   organization-only (zero loading/behavior change). 92 flat startup files
   remain; moving them touches 227+ harness path pins across 92 harnesses.
   All lazy-family migration (the behavior-changing work) is COMPLETE;
   execute this cycle as a standalone follow-up whenever desired.**
10. ✅ Prefetch activation (shipped live with the loader infrastructure:
    idle prefetch of likely-next, hover intent, connection-aware,
    network-warm-only)
11. ✅ Media lazy-load audit (per-file verified: posts.js/post-actions.js feed
    images + profile/explore grids already `loading="lazy"`; news-feed.js
    thumbnails gained `loading="lazy"`; home.js story-ring avatars,
    profile-view covers and the share-sheet QR stay eager — above-the-fold /
    immediately-visible surfaces; feed videos keep poster + muted +
    IntersectionObserver pause; reels keep their window; zero renderer
    rewrites)
12. ✅ Dead-path sweep + final audit + report (cycle12_final_audit: zero dead
    references to the 72 pre-cycle-7 flat paths in 814 live files — the
    branch2-only allowlist retention is intentional rename-detection data;
    coverage 454/454; calls+groups intra-chunk relative order preserved —
    37 + 11 subsequences, load-time-dependency-free)

## 11. Verification per cycle

- Full harness battery (325 harnesses after cycle 7; baseline 319 PASS / 5
  documented era-pin FAILs — failure identity tracked, never silently rebased)
- `test_app_load.js` (evolved: script tags ∪ feature-manifest entries must cover
  every `src/features/**/*.js` on disk; all fetch 200; classic-only rule kept)
- Per-feature contract harnesses for the moved family
- New `docs/feature-loader-contract-harness.js` + per-feature demand-loading
  proof harnesses (startup exclusion, load-on-demand, cache-on-second-visit,
  no-duplicate-init, failed-chunk retry, offline SW path)
- `git diff --check`, secret scan, `node --check` on moved files

## 12. Safety rules honored

main untouched; Branch2 only; no force push; no bundler introduced; classic
script semantics preserved; Supabase/Cloudinary/Vercel/PWA/auth/realtime/push
behavior preserved; security fixes (esc() wraps etc.) move verbatim with their
files; historical evidence in `docs/*.md` is never rewritten — only live
`readFileSync` paths and live markdown links are updated.
