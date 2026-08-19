# NovaSocial Dependency-Loading Order Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Preserve the deterministic dependency order required by the classic-script architecture.

## Contract

`index.html` must load the Supabase CDN script before local application scripts, all 18 local stylesheets before application scripts, core modules before components, components before feature modules, and the inline application script before the final `smart-ranking.js`, `nova-init.js`, and `like-effects.js` sequence. All local scripts must remain classic scripts without `type="module"`, `defer`, or `async` attributes.

## Harness coverage

`docs/dependency-loading-order-contract-harness.js` parses script and stylesheet tags in source order and asserts the dependency boundaries without executing browser code.

| Check | Expected behavior | Result |
|---|---|---|
| CDN dependency | Supabase CDN is the first script | PASS |
| Stylesheets | All 18 local stylesheets precede application scripts | PASS |
| Module order | Core → components → features → inline application script | PASS |
| Final order | `smart-ranking.js`, `nova-init.js`, `like-effects.js` are the final three scripts | PASS |
| Classic loading | No local `type="module"`, `defer`, or `async` attributes | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not reorder tags, load external services, or execute application functions.

## References

1. [`classic-script-compatibility-contract.md`](./classic-script-compatibility-contract.md)
2. [`stylesheet-reference-contract.md`](./stylesheet-reference-contract.md)
3. [`module-script-reference-contract.md`](./module-script-reference-contract.md)

