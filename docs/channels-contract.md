# NovaSocial Channels Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Channels feature invariants before any further structural change.

## Contract

The Channels feature hydrates `myChannels` from the `nova-channels` local-storage key with malformed-data tolerance. `showChannels()` preserves the empty state, owned-channel list, Explore cards, new-channel entry point, channel navigation, and subscribe actions.

`createChannel()` renders name, description, icon, and color controls, initializes the default icon and color, and delegates saving. `saveChannel()` trims and validates the required name, creates a local channel record with stable defaults and an ISO timestamp, persists the list, shows success feedback, closes the modal, and refreshes the channel list. `openChannel(channelId)` rejects missing channels and otherwise preserves metadata, empty-post state, and broadcast entry point.

`broadcastToChannel(channelId)` ignores blank text or missing channels, prepends a trimmed post with an ISO timestamp, persists the channel list, shows feedback, closes the modal, and reopens the channel. `subscribeChannel(name)` preserves its current feedback-only behavior.

## Harness coverage

`docs/channels-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Hydration | Read `nova-channels` with malformed-data tolerance | PASS |
| List surface | Preserve empty, owned, Explore, create, open, and subscribe actions | PASS |
| Creation | Render controls and initialize icon/color defaults | PASS |
| Validation | Reject blank channel names | PASS |
| Persistence | Create and persist channel records with defaults and timestamp | PASS |
| Opening | Reject missing channel and render valid channel metadata/posts | PASS |
| Broadcast | Ignore blank/missing targets, prepend trimmed post, persist, refresh | PASS |
| Subscription | Preserve feedback-only behavior | PASS |

The harness is deterministic and static. It does not access real local storage, open modals, prompt for broadcasts, or mutate channels.

## Safe boundary

The extracted `src/features/channels.js` module remains unchanged in this checkpoint. Communities and other group features remain outside this audit and unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`channels.js`](../src/features/channels.js)
2. [`community` feature boundaries in `index.html`](../index.html)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

