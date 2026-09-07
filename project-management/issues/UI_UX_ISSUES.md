# NOVASOCIAL — UI / UX Issues

**Category (root cause):** display quirks, visual regressions, cosmetic behavior that is not a functional break and not a security defect.
**Established:** 2026-09-07 (H11 task) — imported from the H10 ledger. IDs preserved.
**Protocol:** see ISSUE_RULES.md.

---

| ID | Date | Severity | Status | File:line | Exact problem | Provenance | Reproduction condition | Impact | Recommended fix | Owning task |
|----|------|----------|--------|-----------|----------------|------------|------------------------|--------|-----------------|-------------|
| H10-15 | 2026-09-07 | INFO | OPEN | posts.js:21 (formatCaption more-expander) | more-expander rebuilds the caption block with esc(esc(username)) — a deliberate double-escape for the attr→JS→innerHTML layering — so `&` in usernames displays as `&amp;` after tapping "more" | H10 audit (pre-existing; the old XSS audit said DO NOT TOUCH — kept out of XSS commits) | username containing `&` + caption longer than 120 chars + tap "more" | cosmetic mis-display of `&`-containing usernames after caption expansion | rework the expander to avoid the nested-context double-escape in a dedicated cosmetic task | Cosmetic task |

---

## Verified non-issues (recorded so they are not re-reported)

- XSS-C4 (rename input quote-escaped attr) — SAFE, tracked in SECURITY_ISSUES.md 1.4.
- XSS-C5 (isSystem() styling spoof) — cosmetic styling only; tracked as LOW in SECURITY_ISSUES.md 1.4.
