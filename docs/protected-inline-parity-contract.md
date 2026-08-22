# NovaSocial Protected Inline Parity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Reference:** untouched `origin/main`
**Date:** 2026-08-19
**Purpose:** Confirm that fragile protected declarations remain inline and signature-stable across modularization, with only the explicitly approved particle owner moved under a verified global handoff.

## Contract

The protected systems identified in the migration safeguards must remain in `index.html` and must not be extracted into `src/`, except for the explicitly approved `spawnLikeParticles` production split. The other 18 protected declaration signatures remain present exactly once in both Branch2 and the untouched main reference; the particle signature remains exactly once in `origin/main` and is represented in Branch2 by one window-assigned module owner with preserved canonical body hash and caller order. This parity audit is structural only; browser behavior is recorded separately.

## Harness coverage

`docs/protected-inline-parity-contract-harness.js` compares Branch2 with `origin/main:index.html` for the protected declaration inventory covering DM, Reels, WebRTC calls, Story viewer/elements/polls, notes, push permissions, voice recording, local deletion fallback, and particle effects. It permits only the approved particle exception and verifies the module’s window assignment and load order.

| Check | Expected behavior | Result |
|---|---|---|
| Protected declaration presence | The 18 unapproved safeguarded signatures exist exactly once in both HTML references; the particle signature remains in untouched main and is replaced only by the approved module owner in Branch2 | PASS |
| Extraction guard | No protected declaration signature is duplicated in `src/`; the approved particle module uses one anonymous window assignment | PASS |
| Branch safety | Comparison uses read-only git output and does not modify main | PASS |
| Runtime safety | No application function is invoked | PASS |

## Safe boundary

The approved particle production change is limited to the new module, its script tag, and removal of the original inline owner. The harness reads both HTML references and extracted source files; it does not invoke application behavior or mutate main.

## References

1. [`CRITICAL_CONTEXT.md`](../CRITICAL_CONTEXT.md)
2. [`protected-inline-boundary-contract.md`](./protected-inline-boundary-contract.md)
3. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)

