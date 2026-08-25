# NovaSocial Inline-Declaration Closure Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Freeze the current inline-function inventory after safe modularization candidates were exhausted, preventing accidental movement of fragile declarations.

## Contract

The inline application script must retain 235 function declarations after the jump-to-message owner split, including the 19 protected declarations that must remain in `index.html`: DMs, Reels, WebRTC calls, story viewer, particle effects, recording, push settings, notes, polls, and local-deletion fallback. The remaining declarations are preserved in their current inline boundary because their global ordering and cross-feature dependencies have not been independently proven safe for extraction.

The previously unresolved `forwardMessage` caller is now backed by the authorized inline `forwardMessage` and `completeForwardMessage` declarations; these remain in the protected DM runtime and are not extracted. The prepared DOM-only `jumpToMessage` owner is the separate external classic-script exception documented by its production-split contract.

## Harness coverage

`docs/inline-declaration-closure-contract-harness.js` extracts only the inline application script, counts function declarations, asserts the exact protected-name set, confirms none of those protected declarations exist under `src/`, and confirms the authorized forwarding implementation remains inline.

| Check | Expected behavior | Result |
|---|---|---|
| Inline inventory | 235 declarations remain in the application script after the jump-to-message split | PASS |
| Protected set | Exact 19 protected declarations remain inline | PASS |
| Protected extraction guard | No protected declaration exists in `src/` | PASS |
| Forwarding declarations | `forwardMessage` and `completeForwardMessage` remain authorized inline owners | PASS |

## Safe boundary

This is a static audit of the protected inline boundary. It records the one safe jump-to-message owner extracted with exact parity and confirms that the fragile protected declarations remain inline; the authorized forwarding implementation remains inline and is validated separately by detached production-parity evidence.

## References

1. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
2. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

