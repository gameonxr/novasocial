# NovaSocial Show Edit Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Lock the static behavior of the extracted settings hub renderer without changing production code.

## Contract

`showEdit()` opens the existing `Settings` modal, selects `#mbody`, and replaces its contents with the settings hub. The hub preserves the profile header derived from `PROF` and `ME`, six navigation cards for Account, Privacy, Appearance, Features, Notifications, and Support, and the existing icon/label/description layout.

The admin/moderator card is conditional on `PROF?.is_admin === true || PROF?.is_moderator === true`; its label and description vary by super-admin, admin, or moderator status and route to `showAdminPanel()`. The hub retains a full-width `logout()` button and the NovaSocial version footer.

This audit is documentation-only. It does not open a modal, navigate settings, log out, invoke an admin panel, or modify profile state.

## Harness coverage

`docs/show-edit-contract-harness.js` validates the modal/body boundary, profile dependencies, all six settings routes, role-gated admin routing, logout routing, and required display markers.

## References

1. [`show-edit.js`](../src/features/show-edit.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

