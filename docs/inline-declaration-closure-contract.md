# NovaSocial Inline-Declaration Closure Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Freeze the current inline-function inventory after safe modularization candidates were exhausted, preventing accidental movement of fragile declarations.

## Contract

The inline application script must retain 251 function declarations, including the 19 protected declarations that must remain in `index.html`: DMs, Reels, WebRTC calls, story viewer, particle effects, recording, push settings, notes, polls, and local-deletion fallback. The remaining declarations are preserved in their current inline boundary because their global ordering and cross-feature dependencies have not been independently proven safe for extraction.

The unresolved `forwardMessage` caller remains a pre-existing seam without an implementation and is not changed by this inventory audit.

## Harness coverage

`docs/inline-declaration-closure-contract-harness.js` extracts only the inline application script, counts function declarations, asserts the exact protected-name set, confirms none of those protected declarations exist under `src/`, and confirms no speculative `forwardMessage` implementation exists.

| Check | Expected behavior | Result |
|---|---|---|
| Inline inventory | 251 declarations remain in the application script | PASS |
| Protected set | Exact 19 protected declarations remain inline | PASS |
| Protected extraction guard | No protected declaration exists in `src/` | PASS |
| Unresolved seam | `forwardMessage` remains caller-only and unimplemented | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not extract functions, change script order, execute application code, or implement the unresolved DM forwarding seam.

## References

1. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
2. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

