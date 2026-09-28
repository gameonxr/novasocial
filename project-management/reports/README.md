# NovaSocial — Project-Management Reports

**Established:** 2026-09-29 (repository-organization pass, autonomous cycle).
**Purpose:** problem-wise home for issue-system reports, separated from active
issue tracking (which lives in `issues/` per-category ledgers).

## Intended structure

```
project-management/reports/
  execution/     — per-task execution logs (what a cycle did, step by step)
  verification/  — verification reports (harness outputs, proof runs)
  historical/    — superseded/dated reports kept for evidence
```

## Current population decision (2026-09-29)

The three subdirectories above are the canonical homes for future reports, but
**no files are moved into them yet**. The reasons, per the organization pass's
"do not move what would create unnecessary risk" rule:

1. **Per-cycle execution and verification evidence currently lives in two
   authoritative in-repo places**, both deliberately:
   - the category ledgers' in-row cells + dated sections (e.g.
     `issues/security/SECURITY_ISSUES.md` sections 1–46) — the issue system's
     permanent record, with immutable history per `issues/ISSUE_RULES.md`;
   - the master index sync-log (`issues/ISSUE_INDEX.md`) — one dated entry per
     cycle.
   Duplicating either into `reports/` would violate the dedupe rule
   (`ISSUE_RULES.md` #5: never duplicate an existing issue/record).
2. **The `docs/` tree is the pinned publication area for split-era evidence**
   (before/after browser proofs, dependency maps, authorization addenda).
   Those files are count-pinned by `docs/branch2-final-readiness-contract-harness.js`
   (341 markdown / 322 harnesses / 318 contracts / 317 standard harnesses) and
   heavily cross-referenced by each other; moving any of them would create new
   baseline failures and broken cross-references — documented risk, so they
   stay in `docs/`.
3. **Empty directory scaffolding is deliberately avoided** (the same stance as
   the HA-M6 `src/features/` scaffolding decision — natural landing spots are
   documented, not manufactured). Subdirectories are created when the first
   real report lands.

## Rules

- A report belongs here when it is a standalone narrative document (execution
  log, verification run, historical snapshot) — NOT when it is issue state
  (that belongs in the category ledger rows/sections).
- Never delete evidence to make the repository look cleaner
  (`ISSUE_RULES.md` #4/#6).
- `ISSUE_RULES.md` (in `issues/`) remains the single protocol document for the
  whole issue system; no separate `rules/` directory is created because no
  other project-management rule documents exist.
