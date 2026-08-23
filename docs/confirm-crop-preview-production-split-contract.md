# `confirmCropPreview()` Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Purpose:** Define the narrow, reversible production split for the contained local crop-preview confirmation owner without moving upload, account, navigation, messaging, or protected systems.

## Production boundary

`confirmCropPreview()` reads the existing `_cropState`, crop viewport/image DOM elements, and browser canvas/File primitives. It renders the selected crop, closes the existing crop preview, and invokes the existing confirmation callback. Missing crop inputs close safely; canvas conversion failure reports the existing toast, closes the preview, and passes the original file to the existing callback.

The production owner is preserved as an anonymous classic global assignment in [`src/features/confirm-crop-preview-owner.js`](../src/features/confirm-crop-preview-owner.js): `window.confirmCropPreview = async function() { ... };`. The single existing Done-control caller remains unchanged. The owner depends only on `_cropState`, DOM/canvas/File primitives, `closeCropPreview()`, and `toast()`. The upload owner, avatar/profile creation, crop drag/zoom setup, account state, story/editor systems, messaging, calls, navigation, and all protected high-risk systems remain outside this split.

## Completion gates

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Normalized external owner matches immutable `origin/main`; SHA-256 `668fae8c…23ab4` | PASS |
| Caller boundary | Exactly one existing `confirmCropPreview()` Done-control caller remains unchanged | PASS |
| UI-only boundary | Local canvas/File crop, preview close, toast fallback, and callback only; no database, network, browser-storage, permission, account, messaging, upload, or navigation operation | PASS |
| Detached preparation proof | Success, missing-input safe close, and conversion-error original-file fallback pass with zero side effects | PASS |
| Detached after-split proof | One external owner load per synthetic document; all three crop branches pass with zero side effects | PASS |
| Production split | Inline named owner removed; one external anonymous classic global owner linked in dependency order | PASS |
| Focused regression | Candidate, neighboring owner, tab-cache, and protected contracts pass | PASS |
| First exhaustive regression | Clean pushed Branch2 gate passed at `5610775e465fe84e4c1c39bcde09399d264d66a1` (`HARNESS_COUNT=273`) | PASS |
| Final documentation-tip regression | Clean exhaustive Branch2 gate passed from the final contract package at `cba72ee637723f98aae9ad6017698dab6ec640f3` (`HARNESS_COUNT=274`) | PASS |

## Independent seam

The deterministic seam covers normal crop success, missing crop inputs, and canvas conversion failure. It uses only detached synthetic crop viewport/image elements, a synthetic canvas, a synthetic File implementation, and injected callbacks. The proof does not load NovaSocial, a login session, live data, upload services, database services, network endpoints, browser storage, account controls, or stateful navigation.

## Rollback

The production split is reversible with `git revert 74664d31bf280d8e7d638ff8e0a850b96c306de4` on `Branch2`, followed by the focused candidate/protected checks and a clean exhaustive gate. Rollback restores the named inline owner and removes only the external crop-preview owner linkage. It must preserve the existing crop state, preview close behavior, upload owner, avatar/profile creation, story/editor systems, messaging, calls, navigation, and every protected high-risk boundary.

## Evidence

1. [`confirm-crop-preview-preparation-contract.md`](confirm-crop-preview-preparation-contract.md)
2. [`confirm-crop-preview-preparation-contract-harness.js`](confirm-crop-preview-preparation-contract-harness.js)
3. [`confirm-crop-preview-preparation-browser-proof-evidence.txt`](confirm-crop-preview-preparation-browser-proof-evidence.txt)
4. [`confirm-crop-preview-after-split-browser-proof-evidence.txt`](confirm-crop-preview-after-split-browser-proof-evidence.txt)
5. [`confirm-crop-preview-production-split-contract-harness.js`](confirm-crop-preview-production-split-contract-harness.js)
6. [`confirm-crop-preview-parity-rollback-evidence.txt`](confirm-crop-preview-parity-rollback-evidence.txt)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
8. [`src/features/confirm-crop-preview-owner.js`](../src/features/confirm-crop-preview-owner.js)

## Documentation status

The final documentation-tip gate passed from the published contract package at `cba72ee637723f98aae9ad6017698dab6ec640f3` with `HARNESS_COUNT=274`. The production contract and rollback status are now closed; the mandated final clean exhaustive gate remains required from the completion-documentation tip before this checkpoint is considered complete.
