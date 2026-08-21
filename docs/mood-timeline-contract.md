# NovaSocial Mood Timeline Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Mood Timeline display feature.

## Contract

`showMoodTimeline()` targets `#screen`, defines five mood fixtures for Today, Yesterday, 2 days ago, 3 days ago, and 1 week ago, and renders the Mood Timeline page directly into the screen.

The page preserves the back navigation through `goBack()`, the Mood Timeline and Mood Journey headings, the timeline line and five mood entries, post-count metadata, and the Mood Insights panel with its existing dominant-mood copy. The feature is presentation-only and does not invoke AI services, fetch captions, persist moods, or modify protected systems.

The harness is static and documentation-only. It does not navigate the screen or run mood detection.

## Harness coverage

`docs/mood-timeline-contract-harness.js` validates screen targeting, five mood fixtures, timeline structure, back navigation, post metadata, insights copy, and side-effect boundaries.

## References

1. [`mood-timeline.js`](../src/features/mood-timeline.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

