# NOVASOCIAL — Platform (Android / PWA / Build) Issues

**Category (root cause):** platform-level defects — service-worker policies, PWA caching, build/deploy platform behavior.
**Established:** 2026-09-07 (H11 task) — imported from docs/CODEBASE_HEALTH_AUDIT.md and the H10 ledger. IDs preserved.
**Protocol:** see ISSUE_RULES.md.

---

| ID | Date | Severity | Status | File:line | Exact problem | Provenance | Reproduction condition | Impact | Recommended fix | Owning task | Fix commit | Verification |
|----|------|----------|--------|-----------|----------------|------------|------------------------|--------|-----------------|-------------|-------------|--------------|
| HA-M5 | 2026-09-05 | MEDIUM | DEFERRED (deploy-gated, owner decision) | sw.js:8 (`CACHE_NAME='novasocial-v1'`) + cache-first policy for non-navigation assets (sw.js:62-66) | Cache name never versioned since creation; same-origin GET assets served cache-first once cached. After a deployment, returning PWA users can keep receiving stale feature modules until the SW itself updates (and the SW file is subject to HTTP cache lifetimes) | Codebase Health Audit section 11; documented in HANDOFF.md:522 (fix 8 deliberately skipped as deploy-gated) | deploy a release → open installed PWA → observe stale/missing new features until SW refresh | Users may run mixed old/new module versions after deploys — the classic split (one owner per file) makes partial staleness more likely to produce cross-module mismatches | Adopt deploy-time cache-versioning convention: bump CACHE_NAME (e.g. novasocial-v2) per release batch, or switch feature scripts to stale-while-revalidate/network-first | Deploy-gated platform task (owner authorization + a deploy required) | — | Not fixable without deploy; standing instruction: DO NOT modify sw.js during H/M work |
