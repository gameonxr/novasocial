# NovaSocial AI Context Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted AI context state and mood detector.

## Contract

The module initializes the shared `novaAIContext` state with `lastCommand`, `lastTopic`, `pendingAction`, and `userMood` set to `null`.

`detectUserMood(text)` lowercases the input, evaluates the ordered mood keyword map, and returns the first matching mood. The supported order is happy, sad, angry, excited, tired, motivated, and confused. It returns `null` when no keyword matches. Matching is deterministic substring matching; no network, model, persistence, or protected application behavior is invoked.

The harness is static and documentation-only. It does not execute mood detection or mutate shared AI state.

## Harness coverage

`docs/ai-context-contract-harness.js` validates shared context fields, ordered mood categories, keyword-map structure, lowercasing, first-match return, and null fallback.

## References

1. [`ai-context.js`](../src/features/ai-context.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

