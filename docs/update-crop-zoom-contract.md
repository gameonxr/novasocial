# NovaSocial Update Crop Zoom Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted crop zoom UI helper.

## Contract

`updateCropZoom(sliderVal)` parses the slider value as an integer, divides it by 100 to obtain a zoom percentage, and multiplies `_cropState.minScale` by that percentage to update `_cropState.scale`.

It looks up `#crop-image` and, when present, applies the existing transform combining the negative 50-percent centering, `_cropState.offsetX`, `_cropState.offsetY`, and computed scale. When the image element is absent, state calculation still occurs but no DOM mutation is performed.

The helper owns crop zoom state/UI synchronization only. Crop persistence, image loading, gestures, and final image processing remain outside this module. Existing numeric coercion and transform composition are documented rather than changed.

## Harness coverage

`docs/update-crop-zoom-contract-harness.js` validates slider parsing/normalization, minimum-scale multiplication, crop-image lookup, guarded transform update, offset composition, and non-ownership of persistence/network behavior.

## References

1. [`update-crop-zoom.js`](../src/features/update-crop-zoom.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

