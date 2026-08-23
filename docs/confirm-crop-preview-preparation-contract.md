# `confirmCropPreview()` Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Candidate:** `confirmCropPreview()`  
**Status:** Preparation only; no production split has been made.

## Candidate boundary

`confirmCropPreview()` is a contained local image-crop preview owner. It reads the existing `_cropState`, `crop-viewport`, and `crop-image` values; renders the selected crop into a local canvas; creates a JPEG `File`; closes the existing crop preview; and invokes the existing confirmation callback. If the preview inputs are missing, it closes safely. If canvas conversion fails, it reports the existing toast and passes the original file to the existing callback.

The candidate owns no database query or mutation, network request, browser storage, permission, account, messaging, upload, navigation, or persistent state operation. Its dependencies are the existing `_cropState` lexical binding, DOM/canvas/File primitives, `closeCropPreview()`, and `toast()`. The existing upload owner remains outside the boundary.

The immutable normalized owner hash from `origin/main` is `668fae8c651998f577e5edb1f361c8ce5868f6050eeb7afea2c81a7f84723ab4`. The owner currently remains inline in `index.html`; no `src/features/confirm-crop-preview-owner.js` exists.

## Preparation gates

| Gate | Status |
|---|---|
| Exact normalized origin parity | PASS |
| Caller boundary | PASS — one existing Done control caller |
| Local preview boundary | PASS — canvas/File creation, preview close, and callback only |
| Stateful-boundary audit | PASS — no database, network, storage, permission, account, messaging, upload, or navigation tokens |
| Detached synthetic proof | PASS — success, missing-input, and conversion-error branches |
| Production split | Not started |
| Rollback evidence | Required before any production split |

## Explicit exclusions

This preparation does not alter `closeCropPreview`, crop drag/zoom setup, avatar creation, Cloudinary upload, account state, profile state, story/editor systems, messaging, calls, navigation, or any protected high-risk owner. The candidate must be abandoned if its seam requires moving or modifying those owners.

## Evidence

The detached synthetic proof is recorded in [`confirm-crop-preview-preparation-browser-proof-evidence.txt`](confirm-crop-preview-preparation-browser-proof-evidence.txt). The preparation contract harness is [`confirm-crop-preview-preparation-contract-harness.js`](confirm-crop-preview-preparation-contract-harness.js).
