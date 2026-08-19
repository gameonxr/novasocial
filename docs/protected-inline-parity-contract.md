# NovaSocial Protected Inline Parity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Reference:** untouched `origin/main`
**Date:** 2026-08-19
**Purpose:** Confirm that fragile protected declarations remain inline and signature-stable across modularization.

## Contract

The protected systems identified in the migration safeguards must remain in `index.html` and must not be extracted into `src/`. Their declaration signatures must remain present exactly once in both Branch2 and the untouched main reference. This parity audit is structural only; it does not execute any protected behavior.

## Harness coverage

`docs/protected-inline-parity-contract-harness.js` compares Branch2 with `origin/main:index.html` for the protected declaration inventory covering DM, Reels, WebRTC calls, Story viewer/elements/polls, notes, push permissions, voice recording, local deletion fallback, and particle effects.

| Check | Expected behavior | Result |
|---|---|---|
| Protected declaration presence | Every safeguarded signature exists exactly once in both HTML references | PASS |
| Extraction guard | No protected signature exists in `src/` | PASS |
| Branch safety | Comparison uses read-only git output and does not modify main | PASS |
| Runtime safety | No application function is invoked | PASS |

## Safe boundary

No production application code is changed. The harness only reads the two HTML references and extracted source files.

## References

1. [`CRITICAL_CONTEXT.md`](../CRITICAL_CONTEXT.md)
2. [`protected-inline-boundary-contract.md`](./protected-inline-boundary-contract.md)
3. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)

