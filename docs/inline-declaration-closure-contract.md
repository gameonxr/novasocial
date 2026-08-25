# NovaSocial Inline-Declaration Closure Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Freeze the current inline-function inventory after safe modularization candidates were exhausted, preventing accidental movement of fragile declarations.

## Contract

The inline application script must retain 236 function declarations, including the 19 protected declarations that must remain in `index.html`: DMs, Reels, WebRTC calls, story viewer, particle effects, recording, push settings, notes, polls, and local-deletion fallback. The remaining declarations are preserved in their current inline boundary because their global ordering and cross-feature dependencies have not been independently proven safe for extraction.

The previously unresolved `forwardMessage` caller is now backed by the authorized inline `forwardMessage` and `completeForwardMessage` declarations; these remain in the protected DM runtime and are not extracted.

## Harness coverage

`docs/inline-declaration-closure-contract-harness.js` extracts only the inline application script, counts function declarations, asserts the exact protected-name set, confirms none of those protected declarations exist under `src/`, and confirms the authorized forwarding implementation remains inline.

| Check | Expected behavior | Result |
|---|---|---|
| Inline inventory | 236 declarations remain in the application script | PASS |
| Protected set | Exact 19 protected declarations remain inline | PASS |
| Protected extraction guard | No protected declaration exists in `src/` | PASS |
| Forwarding declarations | `forwardMessage` and `completeForwardMessage` remain authorized inline owners | PASS |

## Safe boundary

This is a static, documentation-only audit of the protected inline boundary. It does not extract functions or change script order; the authorized forwarding implementation remains inline and is validated separately by detached production-parity evidence.

## References

1. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
2. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

