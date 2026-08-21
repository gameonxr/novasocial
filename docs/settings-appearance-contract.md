# NovaSocial Settings Appearance Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Appearance settings renderer.

## Contract

`showSettingsAppearance()` creates an `Appearance` modal and writes the settings body through the modal body element. It renders four `.nova-setting-row` entries for Themes, Profile Themes, Gradient Packs, and Premium Customization.

The Themes and Gradient Packs rows delegate to `showThemePickerModal()`. The Profile Themes and Premium Customization rows delegate to `showProfileCustomizer()`. The helper owns the Appearance settings presentation only; theme persistence and customization behavior remain in their existing owners.

The harness is static and documentation-only. It does not open a modal, alter themes, or persist settings.

## Harness coverage

`docs/settings-appearance-contract-harness.js` validates the function signature, modal title, modal body rendering, four-row layout, exact delegate counts, visible labels, and scope boundaries.

## References

1. [`settings-appearance.js`](../src/features/settings-appearance.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

