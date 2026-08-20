# NovaSocial Communities Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Communities feature invariants before any further structural change.

## Contract

The Communities feature hydrates `myCommunities` from the `nova-communities` local-storage key with malformed-data tolerance. `showCommunities()` preserves the empty state, owned-community list, Explore cards, new-community entry point, open-community navigation, and join actions.

`createCommunity()` renders name, topic, description, and rules controls. `saveCommunity()` trims and validates the required name, creates a local community record with the selected topic, derived icon, fixed gradient, initial membership/forum/voice-room state, and ISO timestamp, persists the list, shows success feedback, closes the modal, and refreshes the community list.

`openCommunity(communityId)` rejects missing communities and otherwise preserves metadata, description/rules, and dispatch buttons for voice rooms, forums, events, and members. `showVoiceRoomsForCommunity`, `showForums`, and `showCommunityEvents` retain their current dispatch boundaries; `showCommunityMembers` and `joinCommunity` retain their current feedback behavior.

## Harness coverage

`docs/communities-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Hydration | Read `nova-communities` with malformed-data tolerance | PASS |
| List surface | Preserve empty, owned, Explore, create, open, and join actions | PASS |
| Creation | Render name/topic/description/rules controls | PASS |
| Validation | Reject blank community names | PASS |
| Record defaults | Preserve topic/icon/color/members/forums/voiceRooms/timestamp | PASS |
| Persistence | Save and refresh community list | PASS |
| Opening | Reject missing community and render metadata/rules/actions | PASS |
| Dispatch | Preserve voice-room/forum/calendar/member boundaries | PASS |
| Join | Preserve feedback-only behavior | PASS |

The harness is deterministic and static. It does not access real local storage, open modals, navigate communities, or mutate community data.

## Safe boundary

The extracted `src/features/communities.js` module remains unchanged in this checkpoint. Voice Rooms, Forums, Events, Members, and other group production systems remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`communities.js`](../src/features/communities.js)
2. [`channels-contract.md`](./channels-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

