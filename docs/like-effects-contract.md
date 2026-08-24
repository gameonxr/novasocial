# NovaSocial Like Effects Wrapper Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the extracted like-effects wrapper without extracting or executing protected reaction persistence.

## Contract

The `like-effects.js` module preserves the existing protected `window.toggleLike` owner by wrapping it only when the original global is callable. The wrapper records the button’s pre-action `data-liked` state, delegates the original action with its arguments and receiver, then invokes the existing `spawnLikeParticles` helper only when the resulting state changes to liked. Unlike transitions do not spawn particles.

The same module registers a document click listener that removes the `show` class from `#theme-panel` only when a click occurs outside both the panel and `.theme-picker-fab`. Clicks inside either protected UI target leave the panel unchanged.

The wrapper owns only detached UI effect coordination. Protected like/unlike persistence, account state, database/network behavior, post/reaction rendering, particle implementation, navigation, and all other application systems remain delegated or inline outside this contract.

## Harness coverage

`docs/like-effects-contract-harness.js` runs the module in a detached VM with synthetic button, panel, FAB, click-listener, protected-original-toggle, and particle mocks. It verifies callable-wrapper availability, argument/receiver delegation, particle gating for like versus unlike, and outside-click theme cleanup without invoking real persistence or application actions.

| Scenario | Expected behavior | Result |
|---|---|---|
| Wrapper install | Preserve a callable global wrapper around the original toggle | PASS |
| Like transition | Delegate first and spawn particles only after a false-to-true result | PASS |
| Unlike transition | Delegate without spawning particles | PASS |
| Outside click | Remove `show` only for clicks outside panel and FAB | PASS |
| Scope | Keep reaction persistence and protected owners delegated | PASS |

## Safe boundary

The existing `src/features/like-effects.js` module remains unchanged. This checkpoint adds only detached evidence for its wrapper/listener behavior. The original `toggleLike`, particle implementation, account/reaction state, database/network behavior, and protected post systems remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, post/reaction protection, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize real like/unlike actions, persistence, account access, or a protected production split.

## References

1. [`like-effects.js`](../src/features/like-effects.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
