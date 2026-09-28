# NOVASOCIAL — UI / UX Issues

**Category (root cause):** display quirks, visual regressions, cosmetic behavior that is not a functional break and not a security defect.
**Established:** 2026-09-07 (H11 task) — imported from the H10 ledger. IDs preserved.
**Protocol:** see ISSUE_RULES.md.

---

| ID | Date | Severity | Status | File:line | Exact problem | Provenance | Reproduction condition | Impact | Recommended fix | Owning task |
|----|------|----------|--------|-----------|----------------|------------|------------------------|--------|-----------------|-------------|
| H10-15 | 2026-09-07 | INFO | SAFE 2026-09-29 (verified non-issue, autonomous cycle) | posts.js:21 (formatCaption more-expander) | more-expander rebuilds the caption block with esc(esc(username)) — a deliberate double-escape for the attr→JS→innerHTML layering — CLAIM: `&` in usernames displays as `&amp;` after tapping "more" | H10 audit (pre-existing; the old XSS audit said DO NOT TOUCH — kept out of XSS commits) | username containing `&` + caption longer than 120 chars + tap "more" | claimed cosmetic mis-display | VERDICT: the claim is FALSE for the current code — the two esc() levels are consumed by exactly the two decoding parse layers [onclick attribute character-reference parse decodes level 1; the innerHTML assignment parse decodes level 2; the JS-string layer does NOT entity-decode]. Executed the row's exact reproduction with the REAL esc() + REAL formatCaption (vm-loaded) through a browser-faithful chain cross-checked by TWO independent decode implementations (regex single-pass + character-level HTML tokenizer): "A&B" displays as "A&B" (12/12 assertions, scripts/h1015_verify.js); &, ', ", <>, unicode, truncation boundary, full-caption-after-more all correct; formatCaption byte-identical to the row-creation commit d7becc7 (no drift — the row always described this code). The code comment from H3 fix 239497f documents the deliberate correct layering | no fix needed (no production change per the verified-non-issue rule) |

---

## Verified non-issues (recorded so they are not re-reported)

- XSS-C4 (rename input quote-escaped attr) — SAFE, tracked in SECURITY_ISSUES.md 1.4.
- XSS-C5 (isSystem() styling spoof) — cosmetic styling only; tracked as LOW in SECURITY_ISSUES.md 1.4.
- H10-15 (formatCaption double-escape display quirk) — SAFE, verified non-issue 2026-09-29 (see row above; the double-escape exactly matches the two decode layers).
