# NovaSocial Check Mention Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted chat mention autocomplete renderer.

## Contract

`checkMention(inp, cid)` reads the input value, inspects the final space-delimited word, and only enters autocomplete when it begins with `@` and is shorter than 20 characters. It lowercases the query, reads `window._chatMembers`, matches profile usernames containing the query, and excludes `ME.id`.

When matches exist, it creates `#mention-list` if absent, appends it beneath the existing list container, renders avatar/name rows, and delegates selection to `insertMention(username, 'minp')`. When there are no matches or the final word is not a valid mention token, it removes any existing mention list.

The helper owns autocomplete presentation only. DM loading, realtime membership, message sending, and mention insertion behavior remain outside this module and protected DM systems remain untouched. The harness is static and does not open a chat or manipulate messages.

## Harness coverage

`docs/check-mention-contract-harness.js` validates token/query branching, member filtering, current-user exclusion, list creation/removal, match rendering, insertMention delegation, and non-ownership of DM/realtime behavior.

## References

1. [`check-mention.js`](../src/features/check-mention.js)
2. [`insert-mention.js`](../src/features/insert-mention.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

