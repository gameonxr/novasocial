# NovaSocial Calendar Display Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Calendar display invariants before any further structural change.

## Contract

`showCalendar()` opens the existing modal boundary and derives the current month, year, first weekday, and month length from the current date. It builds leading blank cells followed by one cell for every day in the current month, highlights today, and preserves the day-tap reminder toast behavior.

The rendered surface preserves month/year navigation controls, weekday headers, the calendar grid, the existing upcoming-events display, reminder buttons, and the inline `addCalendarEvent()` action boundary. The current module is display-only; it does not own event persistence, account state, navigation, or external data queries.

## Harness coverage

`docs/calendar-display-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal entry | Open the Calendar modal and target its body | PASS |
| Date derivation | Preserve current month, year, first weekday, and month length calculations | PASS |
| Grid | Render leading blanks and every day in the current month | PASS |
| Today state | Highlight the current day | PASS |
| Day interaction | Preserve day reminder toast action | PASS |
| Upcoming events | Preserve static event cards and reminder actions | PASS |
| Add event boundary | Preserve inline `addCalendarEvent()` delegation | PASS |
| Scope | Keep display module free of database and navigation ownership | PASS |

The harness is deterministic and static. It does not open a modal, change dates, set reminders, or persist events.

## Safe boundary

The extracted `src/features/calendar.js` module remains unchanged in this checkpoint. The inline event-creation helper remains inline and unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`calendar.js`](../src/features/calendar.js)
2. [`event-listener-boundary-contract.md`](./event-listener-boundary-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

