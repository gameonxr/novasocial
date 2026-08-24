# NovaSocial Add-Members Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the isolated Add Members modal renderer without executing protected group membership behavior.

## Contract

`showAddMembers(cid)` opens the existing Add Members modal and renders a search bar plus an empty result container. The search input preserves its placeholder, id, visual classes, and inline `searchAddMembers(cid, value)` callback wiring for the supplied conversation id. The renderer does not invoke the delegated callback while constructing the markup.

This contract covers only the renderer already isolated in `src/features/show-add-members.js`. The protected `searchAddMembers`, `addMemberToGroup`, conversation membership mutations, DMs realtime, message loading, block enforcement, and scroll restoration remain outside this contract.

## Harness coverage

`docs/add-members-renderer-contract-harness.js` loads the renderer in a detached VM with synthetic modal, body, and icon mocks. It verifies global availability, modal title, search icon request, placeholder, input/result element ids, conversation-id callback interpolation, and zero invocation of protected member-search or membership actions.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the Add Members modal and replace its body | PASS |
| Search UI | Preserve icon, placeholder, input id, and result-container id | PASS |
| Callback wiring | Preserve the supplied conversation id in the inline input handler | PASS |
| Delegation | Keep `searchAddMembers` as a non-invoked delegated callback | PASS |
| Scope | Keep member search/add, membership mutation, realtime, and chat behavior outside the renderer | PASS |

## Safe boundary

The existing `src/features/show-add-members.js` module remains unchanged. This checkpoint adds only detached evidence for its modal renderer. Group membership state, database/network access, account state, realtime messaging, protected DM behavior, and member actions remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, DM/group-chat preparation, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize searching users, adding members, changing a conversation, or navigating a live application.

## References

1. [`show-add-members.js`](../src/features/show-add-members.js)
2. [`dms-seam-preparation-contract.md`](./dms-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
