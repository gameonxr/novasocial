**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Purpose:** Define a narrow, reversible preparation boundary for the story-viewer mute toggle without extracting story loading, story-viewer rendering, story-view persistence, polling, navigation, deletion, or any protected media/call system.

## Candidate boundary

`toggleSVMute()` flips the existing `window._svMuted` UI state, updates the current detached `#sv-media video` element’s `muted` property when present, and delegates one existing `renderSV()` refresh so the mute icon is redrawn. Its single production caller remains the story-viewer mute control in `renderSV()`.

The candidate owns no database query or mutation, storage, network request, notification, upload, navigation, authentication, account, moderation, deletion, or call operation. `renderSV()`, story-view persistence, poll handlers, playback lifecycle, and all other story-viewer boundaries remain inline and unchanged.

## Preparation status

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Normalized owner matches immutable `origin/main` | PASS |
| Caller boundary | One story-viewer control invokes the owner; render remains delegated | PASS |
| UI-only classification | No direct database, storage, network, account, moderation, or navigation operation | PASS |
| Injected seam | Muted/unmuted transitions, video-present/video-missing, and one render delegation pass deterministically | PASS |
| Browser proof | Detached synthetic DOM/mock only; no live account, query, action, or mutation | PASS |
| Rollback | Preparation baseline and restoration procedure pinned | PASS |
| Production split | Not started; no production files changed for this candidate | PENDING |
| Full regression | Not applicable before production split | PENDING |

## Safe boundary

Only the `toggleSVMute()` owner may move. If separately authorized for production extraction, preserve the classic-script global API as exactly one anonymous `window.toggleSVMute = function(){ ... }` assignment, with no ES-module conversion, `defer`, or `async`. The existing story-viewer renderer and all stateful story/media boundaries remain outside the extracted owner.

## References

1. [`index.html`](../index.html)
2. [`toggle-sv-mute-preparation-contract-harness.js`](toggle-sv-mute-preparation-contract-harness.js)
3. [`toggle-sv-mute-preparation-browser-proof-evidence.txt`](toggle-sv-mute-preparation-browser-proof-evidence.txt)
4. [`toggle-sv-mute-parity-rollback-evidence.txt`](toggle-sv-mute-parity-rollback-evidence.txt)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
6. [`high-risk-extraction-gate-contract-harness.js`](high-risk-extraction-gate-contract-harness.js)
7. [`visibility-audio-lifecycle-harness.js`](visibility-audio-lifecycle-harness.js)
8. [`stop-all-preview-audio-contract-harness.js`](stop-all-preview-audio-contract-harness.js)
9. [`toggle-reels-mute-contract-harness.js`](toggle-reels-mute-contract-harness.js)
10. [`toggle-preview-play-contract-harness.js`](toggle-preview-play-contract-harness.js)
11. [`toggle-segment-preview-contract-harness.js`](toggle-segment-preview-contract-harness.js)
12. [`toggle-note-music-manual-contract-harness.js`](toggle-note-music-manual-contract-harness.js)
13. [`media-frame-loop-contract-harness.js`](media-frame-loop-contract-harness.js)
14. [`pause-all-videos-contract-harness.js`](pause-all-videos-contract-harness.js)
15. [`play-next-audio-contract-harness.js`](play-next-audio-contract-harness.js)
16. [`video-observer-contract-harness.js`](video-observer-contract-harness.js)
17. [`set-verify-filter-production-split-contract.md`](set-verify-filter-production-split-contract.md)
18. [`set-reports-filter-production-split-contract.md`](set-reports-filter-production-split-contract.md)
19. [`admin-verification-tab-contract.md`](admin-verification-tab-contract.md)
20. [`admin-reports-tab-contract.md`](admin-reports-tab-contract.md)
21. [`window-assignment-surface-contract-harness.js`](window-assignment-surface-contract-harness.js)
22. [`source-boundary-hygiene-contract-harness.js`](source-boundary-hygiene-contract-harness.js)
23. [`module-script-reference-contract-harness.js`](module-script-reference-contract-harness.js)
24. [`index-integrity-contract-harness.js`](index-integrity-contract-harness.js)
25. [`inline-declaration-count-contract-harness.js`](inline-declaration-count-contract-harness.js)
26. [`interval-audit-contract-harness.js`](interval-audit-contract-harness.js)
27. [`local-html-asset-reference-contract-harness.js`](local-html-asset-reference-contract-harness.js)
28. [`object-url-lifecycle-contract-harness.js`](object-url-lifecycle-contract-harness.js)
29. [`realtime-subscription-lifecycle-contract-harness.js`](realtime-subscription-lifecycle-contract-harness.js)
30. [`storage-key-surface-contract-harness.js`](storage-key-surface-contract-harness.js)
31. [`refresh-profile-counts-production-split-contract-harness.js`](refresh-profile-counts-production-split-contract-harness.js)
32. [`note-reactors-list-production-split-contract-harness.js`](note-reactors-list-production-split-contract-harness.js)
33. [`push-settings-production-split-contract-harness.js`](push-settings-production-split-contract-harness.js)
34. [`deletion-fallback-production-split-contract-harness.js`](deletion-fallback-production-split-contract-harness.js)
35. [`particle-production-split-contract-harness.js`](particle-production-split-contract-harness.js)
36. [`admin-appeals-filter-production-split-contract-harness.js`](admin-appeals-filter-production-split-contract-harness.js)
37. [`set-reports-filter-production-split-contract-harness.js`](set-reports-filter-production-split-contract-harness.js)
38. [`set-verify-filter-production-split-contract-harness.js`](set-verify-filter-production-split-contract-harness.js)
39. [`admin-verification-tab-contract-harness.js`](admin-verification-tab-contract-harness.js)
