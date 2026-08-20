# NovaSocial Copy Invite Link Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted group invite-link clipboard helper.

## Contract

`copyInviteLink(link)` delegates the supplied link to `navigator.clipboard.writeText(link)` and shows the success toast `Invite link copied! 📋`. If the clipboard operation throws, it shows the fallback toast `Could not copy`.

The helper owns clipboard feedback only. Invite generation, group membership, navigation, persistence, and external sharing remain outside this module.

## Harness coverage

`docs/copy-invite-link-contract-harness.js` validates clipboard delegation, success/error toast branches, and isolated scope.

The harness is deterministic and static. It does not access the clipboard, show toasts, or mutate invite state.

## Safe boundary

The extracted `src/features/copy-invite-link.js` module remains unchanged in this checkpoint. Group invite and collaboration systems remain untouched.

## References

1. [`copy-invite-link.js`](../src/features/copy-invite-link.js)
2. [`communities-contract.md`](./communities-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

