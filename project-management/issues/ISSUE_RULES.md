# NovaSocial — Issue Management Rules

**Location:** `project-management/issues/` (established 2026-09-07, H11 task, per owner instruction)
**Repo line:** Branch2 only (`origin/Branch2`); `origin/main` immutable
**This file is the permanent protocol for the entire NovaSocial issue-management system.**

---

## Permanent rules

1. **Every discovered issue must be recorded.** No issue found by any audit, task, regression run, or code read may be silently dropped.
2. **Classify issues by root cause.** The category file an issue lives in is decided by WHY the issue exists (e.g., stale DOM-ID wiring is a BUG even if the broken feature is notifications; a PWA cache policy defect is PLATFORM even though it surfaces after deploy).
3. **Store each issue in its appropriate category file** (`SECURITY_ISSUES.md`, `BUG_ISSUES.md`, `PERFORMANCE_ISSUES.md`, `UI_UX_ISSUES.md`, `ARCHITECTURE_ISSUES.md`, `PLATFORM_ISSUES.md`, `DATABASE_ISSUES.md`, `REALTIME_NOTIFICATION_ISSUES.md`, `AI_ISSUES.md`, `DEPLOYMENT_ISSUES.md`, `CODE_HYGIENE_ISSUES.md`, …).
4. **Never silently discard an issue.** Superseded/duplicate/accepted-risk entries keep status `WONT_FIX` or `DUPLICATE` with a pointer to the surviving entry — they are never deleted.
5. **Never duplicate an existing issue.** A rediscovery updates the existing entry (dedupe rule) — new provenance/line evidence is appended to the existing row.
6. **Preserve historical issue information.** IDs, severity, file/line, provenance, reproduction conditions, commits, and verification results are immutable history once recorded.
7. **Never mark an issue FIXED without verification.** FIXED requires: implementation complete + focused test passing + regression passing + commit existing (hash recorded).
8. **Issues outside the current task must be DEFERRED.** Discovering an issue during task X does not authorize fixing it in task X; record it, assign the likely owner, and continue.
9. **New categories require their own issue file.** If a genuinely new root-cause category appears (e.g., `CACHE_ISSUES.md`, `MEDIA_ISSUES.md`, `AUTH_ISSUES.md`), create `<CATEGORY>_ISSUES.md` for it. Do not force unrelated issues into an existing category file. Do not create empty category files.
10. **Do not reorganize the entire repository during H/M work.** The issue-management folder is the only structural addition allowed during H-series/M-series work.
11. **Full repository organization happens only after H + M are complete.** Audit reports and general documentation remain in `docs/` until then.
12. **Branch2-only work must never modify main.** Issue-ledger commits follow the same rule as all other work.

---

## Status values

`OPEN` · `DEFERRED` · `IN_PROGRESS` · `FIXED` · `WONT_FIX` · `DUPLICATE`

Historical leadgers also used `SAFE` (verified non-issue) and `HUMAN-DECISION` (owner call required); both remain valid for legacy rows. New entries should prefer `OPEN`/`DEFERRED` + a note.

FIXED is allowed **only** when: implementation complete, focused test passes, regression passes, and the fix commit exists.

## ID conventions

- **Historical IDs are immutable.** Legacy identifiers from the pre-migration ledgers (`XSS-H*`, `XSS-M*`, `XSS-C*`, `XSS-10.5`, `HA-*`, `DG-*`, `H9-D*`, `H10-*`) keep their exact IDs forever, in whatever category file their root cause dictates.
- **New issues** get `<PREFIX>-<seq>` per category, starting at 001: `SEC-` (security), `BUG-`, `PERF-`, `UIUX-`, `ARCH-`, `PLAT-`, `DB-`, `RTN-`, `AI-`, `DEPL-`, `HYG-`, and `<CATEGORY>-` for any future new category file.

## Entry format (where applicable)

Issue ID · Date discovered · Severity · Category · Status · File · Function · Line/reference · Exact problem · Source/provenance · Reproduction condition · Impact · Recommended fix · Owning H/task · Fix commit · Verification status

Do not invent information that was not verified.

## Index discipline

`ISSUE_INDEX.md` is the master index of all categories. It must be synchronized whenever any issue status changes, any issue is added, or any category file is created.

## Task report hooks

At the end of every H/M task, report: historical issues imported/updated · issues fixed in this task · issues remaining open · newly discovered issues · ledger/index changes.

## Migration record

- 2026-09-07 (H11): `docs/SECURITY_DEFERRED_ISSUES.md` (created by H10) was migrated into this system. Security-root-cause entries moved to `SECURITY_ISSUES.md`; non-security entries from that ledger were re-homed by root cause (`BUG_ISSUES.md`, `PLATFORM_ISSUES.md`, `CODE_HYGIENE_ISSUES.md`, `UI_UX_ISSUES.md`) with their IDs, severity, provenance, and statuses preserved. The old file was removed only after verification. Audit reports and general documentation remain in `docs/` (reorganization deferred until H + M complete).
