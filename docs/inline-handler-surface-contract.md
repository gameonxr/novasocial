# NovaSocial Inline Handler Surface Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-20
**Purpose:** Audit the requirement that functions referenced by inline HTML `onclick` handlers remain available across the modularized source surface.

## Contract

The current `index.html` contains 159 unique direct `onclick` function targets. The handler inventory is checked against both `index.html` and all extracted JavaScript modules, allowing either a function declaration or an explicit global assignment to satisfy the availability requirement.

The audit finds one pre-existing unresolved target: `forwardMessage`. Its caller remains inside the protected inline DM message-action menu, but no implementation exists in `index.html` or `src/`. This same unresolved caller exists on the untouched main reference. Because forwarding behavior has no recoverable implementation or specified product semantics, this checkpoint documents the seam without inventing behavior or modifying the protected DM system.

## Harness coverage

`docs/inline-handler-surface-contract-harness.js` validates the following behavior:

| Check | Result |
|---|---|
| Direct onclick inventory | 159 unique targets detected | PASS |
| Cross-source lookup | `index.html` and `src/**/*.js` searched | PASS |
| Resolved handler surface | All available targets resolve to declarations or global assignments | PASS |
| Known unresolved seam | Only `forwardMessage` remains unresolved | PASS |
| Protected DM boundary | `renderDMs` and `showMsgMenu` remain inline | PASS |
| Caller preservation | `forwardMessage` caller remains visible for a future product decision | PASS |

The harness is static and documentation-only. It does not invoke authentication, Supabase, DMs, message actions, forwarding, navigation, or account mutations.

## Safe boundary

No production code was changed. The protected DM implementation remains inline and unchanged. Implementing `forwardMessage` requires a separate product decision about recipient selection, payload shape, media/text behavior, and message persistence; no speculative implementation was added.

## Validation

The standalone harness passed with `ONCLICK_HANDLERS=159` and `UNRESOLVED_DOCUMENTED_SEAMS=1`. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` inline handler surface](../index.html)
2. [`src/` extracted JavaScript modules](../src/)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
