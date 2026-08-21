# NovaSocial Theme System Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted theme picker and saved-theme helpers.

## Contract

`toggleThemePicker()` locates `#theme-panel` and toggles its `show` class only when the panel exists.

`setTheme(theme, el)` first removes `data-theme` from both the document root and body. For a non-empty theme other than `default`, it applies the theme to both elements. It persists the requested theme under `nova-theme` when local storage is available, resets all `.theme-opt` backgrounds and swatch borders, highlights the selected option when supplied, closes the picker after 300 milliseconds, and emits the existing theme toast.

`loadSavedTheme()` reads `nova-theme` and reapplies only a stored non-default theme to the document root and body. Storage failures are caught without escaping. The module does not own protected DM, Reels, Calls, Stories, Notes, push, recording, diagnostics, or particle systems.

The harness is static and documentation-only. It does not alter browser storage, theme attributes, or DOM state.

## Harness coverage

`docs/theme-system-contract-harness.js` validates panel toggling, root/body reset and application, storage key, option highlighting, delayed close, toast feedback, saved-theme restoration, and guarded storage access.

## References

1. [`theme-system.js`](../src/features/theme-system.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

