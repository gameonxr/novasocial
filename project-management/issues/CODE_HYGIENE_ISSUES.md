# NOVASOCIAL — Code Hygiene (Dead Code / Repository) Issues

**Category (root cause):** dead code, junk artifacts, naming drift, doc/message drift, dead variables.
**Established:** 2026-09-07 (H11 task) — imported from docs/CODEBASE_HEALTH_AUDIT.md and the H10 ledger. IDs preserved.
**Protocol:** see ISSUE_RULES.md.

---

| ID | Date | Severity | Status | Item | Exact problem | Recommended fix | Fix commit | Verification |
|----|------|----------|--------|------|----------------|-----------------|------------|--------------|
| HA-M6 | 2026-09-05 | MEDIUM | OPEN (decision part) | 14 empty `src/features/<domain>/` scaffolding dirs + 3 `.gitkeep` (src/core, src/components, src/styles) | Scaffolded for a directory reorganization that was never executed; all 452 real feature files live flat in src/features/. Junk root file half of this row was removed (see below) | Keep until the reorganization decision (they are the natural landing spots); full repo organization happens only after H+M complete (standing rule) | 7a1cc80 (junk root file only) | hygiene harness + full regression |
| HA-hygiene (junk root file) | 2026-09-05 | LOW | FIXED | `chore: add feature architecture` (repo root, 1 byte, commit 90a57d8) | 1-byte shell-quoting accident tracked in git | git rm in dedicated hygiene commit | 7a1cc80 (+6615800 amendment) | full regression 322/322 |
| HA-M7 | 2026-09-05 | MEDIUM | FIXED | addStoryTextMode() — story-text-helpers.js:2-10 | Zero call sites; unguarded refs to nonexistent story-prev/story-text-tools/story-submit-btn — would crash if revived | Remove the single dead function (file kept) | 7a1cc80 | story-editor contract harnesses |
| HA-L4 | 2026-09-05 | LOW | FIXED | 3 guarded no-op `react-box` removals — pin-msg.js:10, unsend-msg.js:10, message-clipboard-helpers.js:7 | Reference an element that no longer exists anywhere (harmless no-ops) | Remove the stale lines | 7a1cc80 | message-clipboard-helpers-contract-harness (gained stay-removed assertion) |
| HA-L1 | 2026-09-05 | LOW | FIXED | docs/contract-artifact-pairing-contract.md:22 | Referenced harness filename missing the `-contract` infix | Fix filename in markdown | 7a1cc80 | pairing harness pass |
| HA-L2 | 2026-09-05 | LOW | FIXED | docs/branch2-final-readiness-contract-harness.js:157-159 | Assertion messages lagged pinned values (321 vs 322 etc.); values correct | Update the three message strings | 7a1cc80 (+6615800 count-sync) | readiness harness pass |
| HA-L3 | 2026-09-05 | LOW | OPEN (cosmetic) | docs/branch2-only-safety-contract-harness.js LATEST_CHECKPOINT label | Hardcoded label lags each new docs commit; no assertion depends on it | Cosmetic; optionally derive from commit subject | — | — |
| HA-L5 | 2026-09-05 | LOW | WONT_FIX (kept deliberately) | showNavDebugLog/clearNavDebugLog — navigation.js:29,40 | Zero call sites outside their own file; console-debug utilities, DevTools-callable by design | Keep as console-accessible diagnostics (owner decision at fix-9 time) | — | — |
| H10-14 | 2026-09-07 | INFO | OPEN (deduped — security aspect tracked as XSS-C1 in SECURITY_ISSUES.md) | utils.js:329 — av() computes safeName (quote+quot escape) but never uses it | Dead variable inside av() | Remove or use in the av() review task | — | — |
| HYG-001 | 2026-09-07 | INFO | OPEN | reel-like-helper.js:2-16 vs reels-renderer-owner.js:135-149 | dblLikeReel declared twice with identical bodies: once top-level (reel-like-helper.js, the global owner that inline onclick handlers resolve to) and once nested inside window.renderReels (function-scope declaration, unreachable from global onclick scope). No behavior conflict (identical code, nested one shadows nothing at global scope), but the nested copy is dead weight discovered during the H11 reels audit | Delete the nested duplicate inside renderReels in a future hygiene batch (NOT in security commits — keeps H11 diff at exactly 2 lines) | — | — |

---

## Notes

- The 33 shared global state flags, 654 inline template handlers, and intentional patch chains (`showApp`, `initNovaFeatures`, `toggleLike`) recorded in the health audit are by-design architecture, not issues — no action.
- Repo/doc reorganization beyond this folder is explicitly deferred until H-series AND M-series are complete (standing rule; see ISSUE_RULES.md #10-#11).
