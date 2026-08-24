# NovaSocial Segment Drag-Window Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the extracted segment-picker drag-window interaction without expanding into protected audio playback or Note submission.

## Contract

`setupSegmentDragWindow(previewUrl)` binds the existing `#drag-window` to the existing `#waveform-track`, returns safely when either required node is absent, and initializes the selection at zero. The selection window is fixed at 8 seconds within a 30-second timeline. Touch movement converts track-relative pixels to percentage, clamps the left edge to the legal range, rounds the selected start second, updates `window._segmentStartSec` and `#segment-time-label`, and seeks the optional local `_segmentAudio` only while it is already playing.

The helper preserves the existing touch lifecycle: `touchstart` captures the pointer origin and changes the cursor to `grabbing`, `touchmove` prevents the browser default and updates the selection while dragging, and `touchend` stops dragging and restores the `grab` cursor. It owns only detached picker DOM and local segment-selection/audio-preview state. It does not access the database, network, storage, account state, messaging, navigation, media devices, or Note persistence.

## Harness coverage

`docs/segment-drag-window-contract-harness.js` runs the helper in a detached VM with synthetic track, window, label, touch events, and local audio mocks. It verifies initialization, midpoint movement, lower and upper clamping, label/start-time updates, optional audio seeking, cursor lifecycle, default prevention, and missing-node tolerance. No real media, playback device, upload, account, database, or Note action is executed.

| Scenario | Expected behavior | Result |
|---|---|---|
| Initialization | Start at zero with an 8-second label | PASS |
| Midpoint drag | Convert touch delta to percentage and seconds | PASS |
| Lower/upper bounds | Clamp selection to the 0–22 second range | PASS |
| Preview seek | Seek only an already-playing local audio mock | PASS |
| Touch lifecycle | Preserve cursor and prevent-default behavior | PASS |
| Missing nodes/scope | Return safely with no protected side effects | PASS |

## Safe boundary

The existing `src/features/setup-segment-drag-window.js` module remains unchanged. This checkpoint adds only detached evidence for its local picker interaction. Music search, audio playback controls, segment confirmation, Note submission, persistence, and protected DM/Reels/Calls systems remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, music-picker contracts, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize live playback, uploads, Note submission, or a protected production split.

## References

1. [`setup-segment-drag-window.js`](../src/features/setup-segment-drag-window.js)
2. [`show-music-segment-picker-contract.md`](./show-music-segment-picker-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
