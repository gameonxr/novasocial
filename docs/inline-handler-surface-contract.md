# NovaSocial Inline Handler Surface Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Audit the requirement that functions referenced by inline HTML `onclick` handlers remain available across the modularized source surface.

## Contract

The current `index.html` contains 159 unique direct `onclick` function targets. The handler inventory is checked against both `index.html` and all extracted JavaScript modules, allowing either a function declaration or an explicit global assignment to satisfy the availability requirement.

The audit previously found one unresolved target, `forwardMessage`. Branch2 now resolves it with the authorized inline implementation, while the untouched main reference intentionally remains caller-only. The implementation is covered by the product-decision and production-parity contracts and stays inside the protected DM owner rather than being extracted.

## Harness coverage

`docs/inline-handler-surface-contract-harness.js` validates the following behavior:

| Check | Result |
|---|---|
| Direct onclick inventory | 159 unique targets detected | PASS |
| Cross-source lookup | `index.html` and `src/**/*.js` searched | PASS |
| Resolved handler surface | All available targets resolve to declarations or global assignments | PASS |
| Forward handler | `forwardMessage` resolves to the authorized Branch2 inline implementation | PASS |
| Protected DM boundary | `renderDMs` resolves through `window.renderDMs` in the classic external owner; `showMsgMenu` remains inline | PASS |
| Caller preservation | `forwardMessage` caller remains visible and origin/main caller parity is preserved | PASS |

The harness is static and documentation-only. It does not invoke authentication, Supabase, DMs, message actions, forwarding, navigation, or account mutations.

## Safe boundary

The authorized `forwardMessage` implementation remains inline in the protected DM owner and is not extracted; the bounded `renderDMs()` owner is externalized through its classic `window` handoff. Its recipient selection, payload allowlist, block policy, insert ordering, and failure behavior are defined by the companion product-decision and production-parity contracts; no group forwarding, schema migration, upload, or realtime behavior was added.

## Validation

The standalone harness passes with `ONCLICK_HANDLERS=159` and `UNRESOLVED_DOCUMENTED_SEAMS=0`. The complete repository validation chain must pass after publication.

## References

1. [`index.html` inline handler surface](../index.html)
2. [`src/` extracted JavaScript modules](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
