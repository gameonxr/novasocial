# NovaSocial Select Filter Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted media-filter selection UI helper.

## Contract

`selectFilter(chip, css)` assigns `window._selectedFilter`, applies the filter to `#mprev-media` while mapping `none` to an empty style, and safely handles absent preview media. When the filter tray exists, it resets filter-box borders, highlights the selected chip and label, resets other labels and boxes, and shows `Filter applied 🎨`.

The helper owns filter-selection UI state and preview styling only. Filter processing, media export, upload, persistence, and protected post creation remain outside this module.

## Harness coverage

`docs/select-filter-contract-harness.js` validates state assignment, `none` handling, preview-media guard, tray/chip highlighting, reset behavior, and toast feedback.

The harness is deterministic and static. It does not mutate DOM, process media, or upload content.

## Safe boundary

The extracted `src/features/select-filter.js` module remains unchanged in this checkpoint. Protected media processing and post-creation systems remain untouched.

## References

1. [`select-filter.js`](../src/features/select-filter.js)
2. [`prev-media-contract.md`](./prev-media-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

