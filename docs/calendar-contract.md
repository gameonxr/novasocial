# NovaSocial Calendar Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Calendar display feature while preserving the inline Notes-boundary event creator.

## Contract

`showCalendar()` creates a calendar modal titled `📅 Calendar`, obtains its body, and computes the current month and year from a single `Date` value. It derives the first weekday and number of days in the month, renders leading blank cells, and renders every day in the month.

The current day receives the existing gradient highlight. Day cells provide toast-only date feedback. The calendar includes seven weekday headings, previous and next presentation buttons, three upcoming event cards, reminder toast actions, and a full-width `addCalendarEvent()` action.

The `addCalendarEvent()` call intentionally remains an inline Notes-boundary seam. This module does not implement it, persist events, or move any protected Notes system.

The harness is static and documentation-only. It does not open the calendar, create events, or mutate dates.

## Harness coverage

`docs/calendar-contract-harness.js` validates modal/body construction, current-month calculations, day-grid loops, today highlighting, weekday headings, event fixtures, toast actions, and the intentional inline `addCalendarEvent()` boundary.

## References

1. [`calendar.js`](../src/features/calendar.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

