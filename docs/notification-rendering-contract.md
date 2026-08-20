# NovaSocial Notification Rendering Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted notification-rendering invariants before any further structural change.

## Contract

`renderNotifs()` captures the current render generation before querying the current user’s notifications and follow relationships. It fetches only the fields required for rendering and uses the follow set to determine whether an individual follow notification should expose a Follow Back action. The active `notifFilter` is applied locally after the query.

The renderer groups only consecutive `like` notifications targeting the same post and consecutive `follow` notifications. Grouped entries preserve newest-sender display, unread aggregation, grouped counts, and like-to-post routing; non-groupable types remain individual. The generated notification surface preserves filter controls, clear-all behavior, notification icons, unread styling, and inline click routing for posts, profiles, DMs, stories, and administrative states.

Before writing the DOM, `renderNotifs()` checks the captured generation and aborts if navigation or another render superseded the request. After a current render is committed, unread notifications for the current recipient are marked read and the notification dot is hidden. `setupNotifsRealtime()` replaces any prior subscription, filters inserts by the current recipient, shows the unread dot, and requests a refresh.

## Harness coverage

`docs/notification-rendering-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Query surface | Use current-user notification and follow queries with required fields | PASS |
| Filter state | Apply the selected notification filter | PASS |
| Grouping | Group only consecutive same-target likes and follows | PASS |
| Individual entries | Preserve comments, mentions, messages, stories, and other individual routing | PASS |
| Follow back | Show only when the sender is not already followed | PASS |
| Generation race | Do not overwrite DOM after a newer render generation | PASS |
| Read state | Mark current recipient’s unread rows read after a committed render | PASS |
| Realtime | Replace subscription, filter by recipient, show dot, refresh | PASS |

The harness is deterministic and static. It does not query Supabase, render a real DOM, navigate accounts, or mutate notification state.

## Safe boundary

The extracted `src/features/notifications.js` implementation remains unchanged in this checkpoint. No notification rendering, routing, grouping, realtime, or read-state production code was moved or rewritten.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`notifications.js`](../src/features/notifications.js)
2. [`notification-dispatch-contract.md`](./notification-dispatch-contract.md)
3. [`admin-notification-contract.md`](./admin-notification-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

