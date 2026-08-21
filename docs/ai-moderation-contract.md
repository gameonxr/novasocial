# NovaSocial AI Moderation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted deterministic comment moderation and Ultra initialization feature.

## Contract

`moderateContent(text)` lowercases input and checks the ordered banned-word list: spam, scam, fake, abuse, hate, and violent. It returns `{flagged: true, reason}` for the first matching word and `{flagged: false}` when no word matches.

When the original `sendCmt` exists, the wrapper reads `#cinp`, moderates its value, emits the existing flagged-comment toast and stops for flagged content, or delegates unchanged to the original handler for clean content. The wrapper preserves the original function context and arguments.

`initUltraFeatures()` calls `initDynamicUI()` and loads `nova-current-mood` from local storage with a `default` fallback. When the original `initNovaFeatures` exists, the wrapper calls it first and then initializes Ultra features. Storage failures are caught. No comment is submitted and no AI service is invoked by this audit.

The harness is static and documentation-only. It does not patch live handlers, read inputs, access storage, or execute initialization.

## Harness coverage

`docs/ai-moderation-contract-harness.js` validates deterministic moderation, ordered banned words, sendCmt interception and delegation, flagged feedback, context/argument preservation, Ultra initialization ordering, mood storage key and fallback, and guarded storage access.

## References

1. [`ai-moderation.js`](../src/features/ai-moderation.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

