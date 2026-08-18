# NovaSocial Like Particle Effect Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected inline like-particle effect’s rendering and cleanup invariants before any future refactor.

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

The harness uses mocked DOM geometry, body insertion, timers, and randomness only. It does not invoke real likes, database writes, navigation, authentication, or account actions.

## Safe boundary

The protected `spawnLikeParticles()` implementation remains inline and unchanged. No production particle, like, animation, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` protected particle implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
