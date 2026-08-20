# NovaSocial Local AI Response Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted deterministic Local Nova AI fallback invariants before any further structural change.

## Contract

`getLocalAIResponse(text)` lowercases the input and selects a deterministic response branch for caption requests, hashtags, post ideas, bios, smart replies, identity questions, capability/help questions, greetings, and thanks. Unmatched input receives the existing capability, navigation, guide, feature, and fun-command index.

The helper preserves the current response language and content categories, personalizes greetings from `PROF?.username` with a friend fallback, and remains a local pure-response generator. It does not own network calls, navigation execution, message sending, authentication, or account mutation. Later inline override patches remain outside this module and unchanged.

## Harness coverage

`docs/local-ai-response-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Normalization | Lowercase incoming text before routing | PASS |
| Content branches | Preserve caption, hashtag, idea, bio, and smart-reply routes | PASS |
| Identity/help | Preserve identity and capability responses | PASS |
| Personalization | Use profile username with friend fallback for greetings | PASS |
| Courtesy | Preserve thanks response | PASS |
| Default | Preserve broad command index for unmatched input | PASS |
| Scope | Keep helper deterministic and free of transport/actions | PASS |

The harness is deterministic and static. It does not invoke the helper, call external models, navigate the application, or send messages.

## Safe boundary

The extracted `src/features/local-ai-response.js` module remains unchanged in this checkpoint. Inline Nova AI overrides and navigation/action handlers remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`local-ai-response.js`](../src/features/local-ai-response.js)
2. [`contract-artifact-pairing-contract.md`](./contract-artifact-pairing-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

