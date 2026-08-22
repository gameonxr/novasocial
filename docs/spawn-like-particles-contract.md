# NovaSocial Like Particle Effect Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected like-particle effect’s rendering, cleanup, global-surface, and after-split invariants.

## Contract

`spawnLikeParticles(el)` is a safe no-op when the target element is absent. For a valid target, it reads the target bounding rectangle and creates exactly twelve `.particle` elements centered on the target. Each particle receives a deterministic palette color, a radial `--tx`/`--ty` transform vector, is appended to `document.body`, and schedules removal after 800 milliseconds.

The effect is purely visual. It does not change likes, posts, database state, navigation, authentication, or account data.

## Harness coverage

`docs/spawn-like-particles-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Missing target | No-op with no particles | PASS |
| Particle count | Exactly 12 particles are created | PASS |
| CSS class | Every particle uses `.particle` | PASS |
| Geometry | Particles start at the target center | PASS |
| Palette | Colors are assigned and repeat deterministically | PASS |
| Transform | Every particle receives radial vectors | PASS |
| Cleanup | Every particle schedules 800 ms removal and removes itself | PASS |
| Window caller compatibility | The extracted like-effects caller continues to invoke the global `spawnLikeParticles(el)` contract without importing a second owner | PASS |
| Production browser smoke | Loaded production global creates 12 particles and leaves zero after 850 ms cleanup | PASS |

The harness loads the production module under mocked DOM geometry, body insertion, timers, and randomness, then compares it with the injected test-only adapter. It also statically checks that the extracted like-effects caller keeps the global `spawnLikeParticles(el)` handoff. The after-split browser smoke evidence separately loads the production preview and uses only a synthetic geometry target. Neither proof invokes real likes, database writes, navigation, authentication, or account actions.

## Safe boundary

The protected `spawnLikeParticles()` implementation now resides in `src/features/spawn-like-particles.js` as an anonymous function assigned to `window.spawnLikeParticles`. Its canonical owner body matches the pre-split SHA-256 anchor `44952efebe4daed59f18b3367561cc604b0cce3ea9d9092d1ff41d0bb541fb57`; `like-effects.js` continues to call the global surface without importing a second owner.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` protected particle call-site and script order](../index.html)
2. [`spawn-like-particles.js` production owner](../src/features/spawn-like-particles.js)
3. [`particle-after-split-browser-proof-evidence.txt`](./particle-after-split-browser-proof-evidence.txt)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
