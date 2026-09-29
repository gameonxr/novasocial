# NOVASOCIAL CYCLE-9 FINAL REPORT

**Mission**: organize the remaining flat startup JavaScript files under
`src/features/` into feature/ownership folders — organization-only, zero
behavior change. The demand-loading architecture from the previous migration
was protected, not redesigned.
**Branch**: Branch2. **Period**: 2026-09-29. **Baseline commit**: 3462bd3.
**Close commit**: 83ed335 (HEAD == origin/Branch2).

## A. Git Safety

- **Branch**: `Branch2` (checked before every batch; `git branch --show-current`)
- **HEAD**: `83ed3352f768016c7b0a73daf292f65f28ecb43e` == origin/Branch2
- **origin/Branch2**: `83ed3352f768016c7b0a73daf292f65f28ecb43e` (pushed after every batch; no force push)
- **main before**: `df54898365bc6994b4e321cebc68313a8916fdf4`
- **main after**: `df54898365bc6994b4e321cebc68313a8916fdf4` — **identical, never touched** (verified at every batch close and at final audit)
- **worktree**: clean at close (2 untracked-only local entries during execution were the session tooling's own files, none inside the repo); `git diff --check` CLEAN at every batch

## B. Before

- **Flat startup JS count**: 92 files (279,113 bytes) directly under `src/features/` — all 92 confirmed startup script tags in index.html; none in lazy chunks
- **Existing feature folders**: 34 (5 with content pre-migration: admin/ai/calls/dms/… lazy families; startup placeholders auth/posts/search/chat/home/themes as .gitkeep scaffolds from 2026-08-10; media/system untracked empty local dirs)
- **Architecture state (inherited, protected)**: 129 script tags (1 CDN + 9 core + 2 components + 4 loaders + 92 flat + 21 eager services in family folders); feature-manifest 22 chunks / 346 entries; loader/stubs/prefetch live; sw.js cache-first; battery baseline 320 PASS / 5 FAIL (documented era-pins); previous final report committed at 3462bd3

## C. After

**All 92 flat files moved; zero flat files remain.** 92/92 renames detected
**R100 — content byte-identical** (`git diff -M --name-status`), no file
renamed, no content rewritten, no new duplicates.

Final feature tree (real file counts on disk, 454 total feature files):

```
src/
├── core/          9 files  (untouched)
├── components/    2 files  (untouched)
├── loaders/       4 files  (byte-identical — demand loading untouched)
└── features/
    ├── auth/           17  ← cycle 9 (was 0; .gitkeep placeholder)
    ├── posts/          16  ← cycle 9 (was 0)
    ├── home/            8  ← cycle 9 +7 (ultra-patches.js already there)
    ├── media/          16  ← cycle 9 (was 0)
    ├── notifications/   8  ← cycle 9 (was 0)
    ├── system/         20  ← cycle 9 (was 0)
    ├── chat/            2  ← cycle 9 (was 0; placeholder fulfilled)
    ├── settings/       10  ← cycle 9 +1 eager service (security-center)
    ├── calls/          53  ← cycle 9 +2 eager services (network monitors)
    ├── admin/          55  ← cycle 9 +1 eager service (show-report-detail)
    ├── news/            2  ← cycle 9 +1 eager service (news-feed)
    ├── reels/           8  ← cycle 9 +1 eager service (destroy-reels-…)
    ├── themes/          1  (unchanged)
    └── [22 untouched lazy families: dms 68, stories 70, notes 35, groups 21,
        profile 16, ai 11, explore 3, nova-universe 3, communities 2, and
        13 single/double-file families + empty search/ placeholder (0 files,
        kept as-is — no search-owned startup file exists)]
```

**Files intentionally not moved**: the empty `search/` placeholder folder
stays empty (no flat file had search ownership — verified by call-site
evidence; universal-search.js already lives in explore/); the 3 audit mds,
evidence txts, PM issue ledgers, and dated HANDOFF/MIGRATION_MAP entries keep
their historical at-the-time paths by the never-rewrite-historical-evidence
rule; the pre-existing HYG-002 class-A `file:///home/ubuntu/...` broken link
in account-bootstrap-contract.md is deliberately untouched (owner-decision
item, out of cycle-9 scope). No file was classified UNKNOWN — all 92 received
call-site-verified ownership, so Batch 8 (unknowns) was empty by evidence.

## D. Feature Ownership

Every family assignment is backed by call-site evidence (not filenames):

| Family | Files | Reason (key evidence) |
|---|---|---|
| auth | 17 | loadProf is the boot session-restore call (inline boot + auth.js login); update-last-seen called only by load-prof.js; account-switcher cluster shares getSavedAccounts; ban lifecycle (signOutBanned/showBanScreen/startBanRecheck) = account-state enforcement; appeal pair = ban-flow UI; client-moderation-guards = isBannedClient ban-state render guards |
| posts | 16 | openComments called from posts.js + reels renderer (posts-owned comment sheet); create/submit-create/prev-media/mention = the create-post flow (FAB speed-dial showCreate entries from home/profile/reels); insights.showEnhancedInsights called only from post-actions.js:94; report modal trio = user-side reporting (post-actions/dms/profile entries) |
| home | 7 | smart-feed.loadMoodFeed is patched by home/ultra-patches.js (already in home/); mood cluster (apply-mood/mood-timeline) entered via universe hub/settings/ai; new-posts-indicator consumed by system/-silent-background-refresh; setup-home-hold-restore = home-tab long-press |
| media | 16 | one canonical implementation per helper: upload.js consumed by core/ai/dms/groups/profile/settings/stories; cld-url by core/explore/memories/profile/stories; delete-media-production by dms/groups/notes/profile/stories; pause-all-videos by components/dms/stories + go; fallback-local-queue only by delete-media-production |
| notifications | 8 | send-notif consumed by dms/groups/profile/stories; push stack consumed by settings-notifications (enablePushFromSettings); urlBase64ToUint8Array called only from push-subscription-owner.js:24 (VAPID key) |
| system | 20 | go.js = single nav funnel; tab-cache trio + -silent-background-refresh called only from go.js; emergency-lock pair gated at show-app boot (platform kill-switch); auto-purge called from show-app.js (admin-gated); FAB family wired from initFabSystem (show-app); deep-links = inline-boot processDeepLinks |
| chat | 2 | checkMention(inp, cid) rendered only by dms/open-chat.js:143; insertMention called only from check-mention.js suggestion HTML — both target the dms composer `minp` textarea |
| admin (+1) | 1 | show-reportDetail consumed only by load-reports-list.js:118 + load-user-report-stats.js:30 |
| news (+1) | 1 | showNewsFeed entry from the eager nova-universe hub menu |
| reels (+1) | 1 | destroyReelsPersistentContainer manages the reels persistent container (go.js nav, auth reset, submit-create, post-actions callers) |
| calls (+2) | 2 | start/stopNetworkMonitor read `_callState.peer` stats and update the `nova-call-network-indicator`; called only by show-call-screen.js:115 + end-call.js:21 |
| settings (+1) | 1 | showSecurityCenter = 2FA & devices preferences screen (universe hub + ai quick-action entries) |

Chunk ≠ folder convention honored: the 6 cross-family eager services keep
their script tags (eager stays eager — loading behavior unchanged), exactly
like the pre-existing 17 eager services living in lazy family folders.

## E. Reference Migration

- **imports updated**: 0 ES-module imports existed (classic-script
  architecture); 0 live-src path references existed — verified by the
  pre-flight survey (only index.html + docs referenced flat paths)
- **script paths updated**: 92 index.html tag rewrites, exact-substring
  in-place (relative order proven byte-equivalent modulo family prefix;
  non-feature tags identical)
- **dynamic imports updated**: 0 dynamic imports of flat files existed;
  loaders/feature-manifest byte-identical (22 chunks / 346 entries unchanged)
- **tests/harnesses updated**: ~250 pin evolutions across 7 batches —
  string-form, join-segment (`'features','X.js'`), regex-escaped
  (`src\/features\/X\.js`), absolute-path, backtick-template, dynamic
  bare-name-array forms (dms-seam tabCacheModules, extracted-wrapper-seam
  order array, cloudinary-url-builder file list); 2 proof harnesses evolved
  to the documented-eager-services convention (calls EAGER_SERVICES 4→6,
  admin P1 +1); invalidate-tab-cache git-log pin → earliest-touch both-paths
  convention; reels candidate HTML hash repinned (9 documented repins total,
  following the cycle-5/6/7 practice)
- **harnesses updated**: full 325-harness battery run after every batch —
  320 PASS / 5 FAIL with byte-matched era-pin identity each time
- **service-worker references checked**: sw.js + manifest.json byte-identical
  to baseline (0-line diff); zero src/features references existed in sw.js
- **branch2-only allowlist**: extended with all 92 old flat paths
  (rename-detection deletions) + 92 new folder paths; latest-commit allowlist
  assertion verified satisfied
- **contract md**: 76 files' live References links + 22 backtick labels
  synced; narrative prose and historical evidence untouched (convention)

## F. Demand Loading Preservation

- **before chunk behavior**: 22 demand-loaded chunks / 346 manifest entries;
  `loadFeature()` cached-promise sequential classic-script injection;
  per-URL dedup; failure-clear-retry; stub overwrite-on-load; go() tab
  gating; network-warm-only connection-aware prefetch
- **after chunk behavior**: identical — `src/loaders/` is byte-identical
  (0-line diff vs baseline 3462bd3); manifest 22 chunks / 346 entries;
  stub list unchanged
- **loader behavior**: `docs/feature-loader-contract-harness.js` **PASS**
- **prefetch behavior**: preload-manager.js byte-identical — untouched
- **demand-loading proofs**: calls+groups proof **PASS** (P1–P8, with 6
  documented eager services), admin proof **PASS** (P1–P8, with 1 documented
  eager service) — startup exclusion, manifest linkage, on-demand order,
  second-visit cache, rapid-double-nav, failed-chunk retry, stub entries,
  content preservation all re-verified after the moves

## G. Performance Preservation

| Metric | Before (3462bd3) | After (83ed335) | Δ |
|---|---|---|---|
| Script tags | 129 (128 local + 1 CDN) | 129 (128 local + 1 CDN) | **0** |
| Startup local JS (tagged) | 409,820 bytes | 409,820 bytes | **0** |
| Inline app script | 54,145 bytes | 54,145 bytes | **0** |
| Startup JS total | 463,965 bytes | 463,965 bytes | **0** |
| Demand-loaded chunks | 22 / 346 files | 22 / 346 files | **0** |
| Feature files on disk | 454 | 454 | **0** |
| Renames R100 (byte-identical) | — | 92/92 | — |

(The previous report's ~443 KB figure used a different inline-script
measurement; this table's methodology is internally consistent before/after
and shows byte-exact preservation. Cycle 9 was not a performance pass and did
not attempt further reduction.)

## H. Verification

- **app-load**: 129 tags ∪ 346 manifest entries cover 454/454 feature files;
  all referenced files exist; classic-only rule PASS (no type=module/importmap)
- **regression**: battery 320 PASS / 5 FAIL — the 5 failures are the
  documented era-pins (branch2-final-readiness, branch2-only-safety,
  deletion-fallback-production-split, dms-renderer-independent-proof,
  particle-production-split) and their failure identity is **byte-matched**
  to the pre-cycle baseline after every batch (no new regression ever
  shipped; the single intermediate 5-failure appearance during batch 1 was
  diagnosed and fixed before commit — dynamic pin forms)
- **PWA**: sw.js + manifest.json byte-identical; no SW-referenced asset moved
- **dynamic loader**: feature-loader contract harness PASS; manifest linkage
  intact for all 22 chunks
- **go('reels') / go('calls') / go('groups')**: the go() tab-gating path is
  untouched (system/go.js moved with content byte-identical; stubs and
  manifest byte-identical); the calls+groups demand-loading proof harness
  (which exercises the full go-tab loading contract: exclusion, order, cache,
  double-nav, retry) PASSES, and the admin/reels equivalents likewise
- **reference sweep**: 92 old flat paths — 92 allowlist rename-data entries +
  101 historical-evidence entries intentional; 0 live functional references
  remain (0 in src/; all harness readFileSync/includes/regex pins updated;
  remaining md mentions are convention-exempt narrative/evidence); bare-name
  dynamic path-building sweep clean
- **git diff --check**: CLEAN at every batch close
- **node --check**: 92/92 moved files syntax-valid
- **secret scan**: diff reviewed across all commits — no secrets introduced
  (docs-only + path-only changes)

## I. Deferred

- `src/features/search/` — stays an empty .gitkeep placeholder: no flat file
  had search ownership (call-site-verified; universal-search.js already in
  explore/). Not deleted (uncertain-deletion rule).
- Pre-existing HYG-002 class-A link-rot (file:///home/ubuntu/... author-machine
  links, e.g. account-bootstrap-contract.md:66) — owner-decision item,
  untouched by cycle 9.
- Era-pin reconciliation (5 harnesses pinning stale origin/main
  `ef418007…` vs actual `df54898…`) — pre-existing documented baseline,
  unchanged failure identity, awaiting its owner.
- The 14 pre-existing `.gitkeep` scaffolding files remain (cosmetic removal
  would be churn without behavior value; e.g. home/themes keep theirs per
  cycle 3–7 precedent).
- Contract-md narrative prose and production-split spec tables retain their
  at-the-time flat paths (historical statements per the cycles 3–7
  convention — e.g. add-members-renderer-contract.md narrative kept its old
  path after cycle 7; live links were updated).

## J. Commits

| Commit | Purpose |
|---|---|
| f6439a4 | batch 1 — system startup modules → src/features/system/ (20) |
| 2085d86 | fix — allowlist gains old flat paths (rename-detection deletions) |
| beed209 | batch 2 — home feed modules → src/features/home/ (7) |
| 3ce6392 | batch 3 — posts/post-actions/create modules → src/features/posts/ (16) |
| c5ec309 | batch 4 — auth/account/ban/emergency modules → src/features/auth/ (17) |
| 6252c88 | batch 5 — notifications + push modules → src/features/notifications/ (8) |
| 3aa95c8 | batch 6 — shared media modules → src/features/media/ (16) |
| df49e2b | batch 7 — chat mention helpers + cross-family eager services (8, chunk≠folder) |
| 83ed335 | fix — live link labels synced with rewritten URLs (backtick form) |
| (this commit) | docs — ARCHITECTURE.md cycle-9 close-out, MIGRATION_MAP.md dated entry, this report |

Each batch commit was individually verified (syntax + app-load + battery
320/5 + git diff --check) and pushed before the next batch began.

## K. FINAL STATUS

**CYCLE 9 COMPLETE — ORGANIZATION VERIFIED**

All 92 flat startup files re-foldered by verified feature ownership; 92/92
R100 byte-identical renames; demand-loading architecture byte-identical
(loader/manifest/stubs/prefetch/sw.js untouched); tag count, tag order, chunk
count, startup bytes all preserved exactly; battery 320/5 with byte-matched
era-pin identity; main untouched (df54898365bc6994b4e321cebc68313a8916fdf4);
HEAD == origin/Branch2 == 83ed335 at close.
