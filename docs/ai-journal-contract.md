# NovaSocial AI Journal Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted local AI Journal UI without invoking AI services or reading user entries.

## Contract

`showAIJournal()` renders the Journal screen with a localized current date, AI Daily Summary, fixed activity stats, Mood Today display, and three Recent Entries fixtures. Navigation remains delegated to the existing global handlers.

`showAIJournalEntry()` creates a New Journal Entry modal with title and content fields, eight mood chips, Save Entry routing, and deterministic AI Auto-Generate routing. `saveJournalEntry()` requires non-empty trimmed title and content, otherwise emits the existing validation toast and returns. Valid entries are prepended to the `nova-journal` local-storage array with title, content, selected/default mood, and ISO timestamp; storage errors are contained. Successful save emits feedback, closes the modal, and refreshes the journal.

`generateAIJournal()` fills the content field with the existing deterministic journal text and emits the AI-generated toast when the field exists. No external AI service is invoked by this module.

The harness is static and documentation-only. It does not open the journal, access storage, or save an entry.

## Harness coverage

`docs/ai-journal-contract-harness.js` validates screen and modal rendering, fixtures, mood chips, validation, storage key and entry shape, save lifecycle, deterministic generation, and local-only scope.

## References

1. [`ai-journal.js`](../src/features/ai-journal.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

