# NovaSocial View Avatar Fullscreen Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted fullscreen avatar viewer UI helper.

## Contract

`viewAvatarFullscreen(avatarUrl, username)` displays the existing toast and returns when no avatar URL is provided. Otherwise, it removes any existing `#nova-avatar-viewer`, creates a new fixed fullscreen viewer with the same ID and styling, and renders a close control, escaped username label, and avatar image.

The helper assigns a backdrop click handler that removes the viewer only when the backdrop itself is clicked, then appends the viewer to `document.body`. The helper owns viewer UI lifecycle only; profile loading, avatar storage, navigation, and account state remain outside the module.

Existing avatar URL interpolation is preserved and documented rather than changed because this checkpoint is structural and production-safe. No browser DOM or user profile data is touched by the harness.

## Harness coverage

`docs/view-avatar-fullscreen-contract-harness.js` validates missing-avatar guard, existing-viewer cleanup, required viewer ID/styling, close control, escaped username, avatar image, backdrop dismissal, body insertion, and non-ownership of network or persistence behavior.

## References

1. [`view-avatar-fullscreen.js`](../src/features/view-avatar-fullscreen.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

