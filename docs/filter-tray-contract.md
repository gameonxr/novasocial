# NovaSocial Filter Tray Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted filter-chip tray renderer while preserving inline filter definitions and selection behavior.

## Contract

`showFilterTray(mediaUrl)` locates `#filter-tray` and returns without mutation when absent. It clears and displays the tray with the existing horizontal chip styling.

The renderer combines `FILTERS` and `AI_FILTERS`, creates one chip per filter, preserves selected-first border and label styling, embeds the supplied media URL with the filter CSS when available, renders the existing art fallback when no media URL is provided, and delegates chip clicks to `selectFilter(this, flt.css)`. Filter definitions and selection behavior remain outside this module.

The harness is static and documentation-only. It does not create DOM nodes, load media, or select a filter.

## Harness coverage

`docs/filter-tray-contract-harness.js` validates tray lookup/guard, styling, source combination, chip creation, selected-first state, media and fallback branches, image error hiding, and selectFilter delegation.

## References

1. [`filter-tray.js`](../src/features/filter-tray.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

