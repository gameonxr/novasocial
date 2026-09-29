# NovaSocial — Feature-Based Architecture + Demand Loading
## Final Migration Report

**Mission**: reorganize the flat feature source into a feature-owned folder
architecture and ship production-safe demand loading so initial startup does
not load every feature's JavaScript.
**Branch**: Branch2 (origin/main never touched — verified at every step).
**Period**: 2026-09-29.
**Status at close**: **All behavior-changing work COMPLETE.** 12 of 12
migration cycles closed (cycle 9 = startup re-folder is explicitly deferred
as organization-only, zero behavior change — see §7).

---

## 1. Measured results (Phase 20 — repository measurements, no fabrication)

| Metric | BEFORE (parent 740c4b0) | AFTER (852c571) | Δ |
|---|---|---|---|
| Script tags in index.html | 464 (463 local) | 129 (128 local) | **−72.2%** |
| Startup local JS (tagged files) | ~1,218 KB | 400.2 KB | **−67.1%** |
| Startup JS incl. inline app script | ~1,260 KB | 442.6 KB (400.2 + 42.4) | **−64.9%** |
| Feature JS loaded at startup | 452 flat files, all families | 113 eager feature files (startup + services) | −75% |
| Feature JS loaded on demand | 0 | **346 files / 866.1 KB across 22 chunks** | — |
| Feature folders (ownership) | 5 pre-existing dirs, 452 flat files | 32 family folders, 92 flat startup files | — |

Numbers are disk-measured (`scripts/cycle12_final_audit.js`, repo tree only;
no production-network claims). The plan's 68.6% target assumed 119 startup
scripts/~383 KB; the delivered startup keeps 128 scripts/400.2 KB because the
final set retains the 17 documented eager service files from lazy folders
(realtime subscriptions, cleanup jobs, sync helpers, sync media helper) —
behavior preservation was weighted over the last ~4% of byte savings.

Startup now executes: 9 core + 2 components + 4 loaders + 113 feature files
(auth/session, app shell, home feed render path, posts actions, media
observers, notifications/push/realtime, navigation, tab cache, themes, and
the 17 service files). Everything else — stories editor, DMs, calls WebRTC,
groups, admin, AI, notes, reels, profile, explore, settings, marketplace,
communities, games, learning, news, calendar, voice-rooms, live-stream,
memories, scheduled-posts, creator — loads only when the user navigates to it.

## 2. Architecture delivered

```
src/
  core/         9 files  (unchanged)
  components/   2 files  (unchanged)
  loaders/      4 files  (NEW: feature-manifest, feature-loader,
                          feature-stubs, preload-manager)
  features/     32 family folders + 92 flat startup files
                  lazy families (22 chunks, 346 files):
                    stories dms admin profile ai calls notes settings groups
                    reels explore communities creator live-stream voice-rooms
                    games memories calendar marketplace learning news
                    scheduled-posts
                  startup families (flat, cycle-9 deferred):
                    auth/account, posts/home, notifications, system, media,
                    chat, search + misc
```

**Chunk ≠ folder**: each lazy family's folder may contain eager service
files that keep their script tags (17 files: notes realtime/cleanup, profile
realtime-sync, calls init-calling-system + get-connection-quality + ringtone
pair, stories cleanup pair, dms deletion-fallback + blocked-set pair,
ai-moderation, nova-universe pair, fab-customization, check-user-active-note).
These are files called from the eager startup path — the demand-loading
boundary deliberately excludes them.

### Loader contract (src/loaders/)

- `feature-manifest.js` — 22 chunks; order preserves the exact relative
  script order the files had in index.html (per family; verified for
  calls/groups this session: 37 + 11 subsequences, load-time-dependency-free).
- `feature-loader.js` — `loadFeature(name)`: cached Promise, sequential
  classic-script injection, per-URL dedup (shared subsystems evaluate once),
  failure clears pending (retry works), debug flag, transitional
  already-present detection.
- `feature-stubs.js` — boundary stubs for every entry global reachable
  before its chunk loads; real definitions overwrite stubs on load; a guard
  errors loudly if a chunk loads without defining its entry.
- `preload-manager.js` — network-warm-only prefetch (`fetch` low priority,
  never evaluates): idle prefetch of likely-next per tab (home→reels+stories,
  dms→profile…), pointerover intent on bottom-nav, skips saveData/2g/downlink
  <1, offline clears state. Same-origin GETs pass through the untouched sw.js.

## 3. Migration history (each cycle independently verified + committed)

| Cycle | Commit | Scope |
|---|---|---|
| 0/1/2 | 2b8f8d6 | master plan: 463-script baseline, AST dependency graph (acorn), 6 load-time patch files identified, 22-chunk manifest, no code change |
| 2 | f6d0791 | loader infrastructure (inert transitional state) |
| 3 | e7d5726 | admin pilot: folder + tags removed + stubs + P1–P8 proof harness |
| 4 | 5f68ef0 | discover families (marketplace, communities, channels, games, learning, news, calendar, voice-rooms, live-stream, memories, creator) + nova-universe/themes/scheduled-posts startup-folder pass |
| 5 | 1228ceb | settings, notes, ai, reels, explore, profile + nova-ultra-patches 3-way split |
| 6 | ad88236 | stories (68) + dms (65) — largest families; notes-bar shared-subsystem dedup |
| 7 | d4768f6 | **calls (47) + groups (21) — final lazy families** (this session) |
| 8 | (with 5) | profile/explore/reels go() tab gating |
| 9 | deferred | startup re-folder — organization-only, see §7 |
| 10 | (with 2) | prefetch activation — live since the loader infrastructure |
| 11 | 852c571 | media lazy-load audit (this session) |
| 12 | 852c571 | dead-path sweep + final audit (this session) |

## 4. Cycle-7 boundary decisions (recorded in-repo)

Full detail in `docs/calls-groups-demand-loading-proof-contract.md`:

1. **Group-call WebRTC files (11) live in the calls chunk** — the committed
   stub design routes `initiateGroupCall`/`joinGroupCall`/
   `showGroupCallScreen`/`showGroupCallTypeMenu` to `loadFeature('calls')`;
   manifest membership must match stub routing or the loader's
   missing-definition guard fires. Folder ownership stays `calls/`.
2. **`get-connection-quality.js` stays eager** — the eager feed media
   optimizer `optimize-cloudinary-url.js` calls `getConnectionQuality()`
   synchronously; the promise-based stub boundary cannot serve sync calls.
3. **`showGroupInfo` stub added to groups** — the dms chunk renders
   `onclick="showGroupInfo(cid)"` chat headers; the only unstubbed
   cross-chunk entry found by the preflight boundary analysis.
4. **Zero calls↔groups cross-chunk references** — all 70 family globals
   scanned in both directions; the families are independent at the boundary.
5. **4 eager service files stay tagged** in `src/features/calls/`
   (get-connection-quality, init-calling-system, play-ringtone,
   stop-ringtone).

## 5. Proof evidence (Phase 19 — executed, not assumed)

- `docs/calls-groups-demand-loading-proof-contract-harness.js` (new, cycle 7):
  P1 startup exclusion (0 lazy tags, 4 documented services), P2 manifest
  linkage, P3 on-demand sequential injection (47+21 in manifest order),
  P4 second-visit cache (0 new injections), P5 rapid double navigation (one
  promise, one chunk), P6 failed chunk rejects + retry reloads, P7 stub
  entries incl. showGroupInfo, P8 content preservation (72 files
  syntax-valid, owners intact). **8/8 PASS.**
- `docs/admin-demand-loading-proof-contract-harness.js` (cycle 3): same
  P1–P8 for the admin family. **PASS.**
- `docs/feature-loader-contract-harness.js` (cycle 2): loader contract. **PASS.**
- Prefetch: network-warm-only by construction (fetch, no script evaluation);
  connection-gated; never prefetches all features (per-tab likely-next map,
  max 2).

## 6. Safety rules honored

- **main untouched**: origin/main == df548983 at every verification
  (pre-commit, post-commit, post-push); all work on Branch2; no force push.
- **No bundler introduced**: classic-script semantics preserved; the loader
  injects classic scripts in order; no type=module, no import maps.
- **Behavior preserved**: git mv only (content byte-identical, rename
  detection 100%); tags removed only for files whose entry points are
  stub-gated or internally loaded; realtime/PWA/push/auth untouched;
  sw.js byte-identical since 740c4b0; security fixes moved verbatim.
- **Historical evidence untouched**: docs/*.md never rewritten; only live
  harness readFileSync paths and live linkage pins evolved, with dated
  `/* architecture-migration */` comments; the branch2-only allowlist keeps
  old flat paths (rename-detection data) alongside new folder paths.
- **No giant rewrite commits**: 6 family commits, each independently
  verified (battery + app-load + proofs) before the next.

## 7. Remaining work (explicit)

1. **Cycle 9 — startup re-folder (deferred, organization-only)**: 92 flat
   startup files → family folders (auth, posts, home, notifications, system,
   media, chat, search). Tags stay, paths update; zero loading/behavior
   change. Deliberately deferred this session: it touches 227+ harness path
   pins across 92 harnesses — pure cost, zero behavior value, cleanly
   executable as a standalone follow-up. Documented in ARCHITECTURE.md §10.
2. **Era-pin reconciliation (pre-existing)**: the 5 documented battery
   failures (branch2-final-readiness, branch2-only-safety,
   deletion-fallback-production-split, dms-renderer-independent-proof,
   particle-production-split) all fail on stale origin/main-ref-class pins
   from before this mission — failure identity verified unchanged.
3. Pre-existing non-security ledger rows (DG-3/4/5, HA-M5, HA-M6, HYG-002)
   — unchanged owner-decision/external items, out of migration scope.

## 8. Final verification state (at 852c571)

- Battery: **320 PASS / 5 FAIL** (325 harnesses; the 5 = documented
  era-pins, failure identity verified this session).
- App-load: **10/10** — 128 startup refs + 346 manifest entries cover 454
  feature files; 469/469 scripts fetch 200; classic-only rule intact; PWA
  assets 200.
- Demand-loading proofs: 8/8 (calls+groups), admin 8/8, loader contract PASS.
- node --check: all 72 moved files + 4 loaders OK.
- Secret scan: 0 suspects (104 diff files, cycle 7).
- `git diff --check`: CLEAN. Worktree clean. HEAD == origin/Branch2 ==
  852c571. **origin/main == df548983 — never touched.**
