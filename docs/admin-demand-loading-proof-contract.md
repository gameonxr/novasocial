# Admin Demand-Loading Proof Contract

**Harness**: `admin-demand-loading-proof-contract-harness.js`
**Feature area**: admin feature family (`src/features/admin/`)
**Added**: 2026-09-29 (feature-based architecture migration — pilot family)

## Contract

The admin feature family is the first fully demand-loaded feature. The harness
proves the complete demand-loading loop against the live repository:

1. **P1 Startup exclusion** — `index.html` contains zero admin script tags; no
   admin code evaluates during initial startup.
2. **P2 Manifest linkage** — all 54 admin files are listed exactly once in
   `window.FEATURE_MANIFESTS.admin`, preserving the exact relative script order
   the family had in `index.html`.
3. **P3 On-demand load** — `loadFeature('admin')` sequentially injects all 54
   scripts in manifest order.
4. **P4 Second-visit cache** — a repeat call resolves with zero new injections.
5. **P5 Rapid double navigation** — concurrent calls share one promise and load
   exactly one chunk (no duplicate initialization).
6. **P6 Failed chunk** — a network failure rejects the promise; the pending
   entry is cleared; a retry reloads the chunk.
7. **P7 Stub entry** — `feature-stubs.js` provides the `showAdminPanel`
   load-then-dispatch stub.
8. **P8 Content preservation** — every moved file is syntax-valid and the
   `showAdminPanel` global owner remains intact.

## Entry path

User opens the admin panel → `showAdminPanel` stub → `loadFeature('admin')`
(sequential classic-script injection) → real `showAdminPanel` definition
overwrites the stub → dispatch proceeds. Users see the existing loading UI
(`Verifying access...`) while the chunk downloads.
