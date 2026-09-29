# Feature Loader Contract

**Harness**: `feature-loader-contract-harness.js`
**Feature area**: demand-loading infrastructure (`src/loaders/*`)
**Added**: 2026-09-29 (feature-based architecture + demand loading migration — see
`project-management/architecture/ARCHITECTURE.md`)

## Contract

NovaSocial loads feature JavaScript on demand through a classic-script injection
loader. The infrastructure must uphold all of the following invariants, which the
harness verifies against the live repository files:

1. **Manifest completeness (L1)** — every path in `window.FEATURE_MANIFESTS`
   (`src/loaders/feature-manifest.js`) exists on disk, uses the
   `src/features/**.js` shape, and no path is listed twice.
2. **Transitional eager state (L2)** — while a feature's first manifest script is
   still present as a `<script src>` tag in the document, `loadFeature(name)`
   resolves without injecting anything. This keeps every intermediate migration
   state behavior-identical to the pre-migration eager load.
3. **Promise dedup + caching (L3)** — concurrent calls share one promise; a
   completed feature resolves immediately without re-injection.
4. **Sequential order (L4)** — chunk scripts inject in exact manifest order,
   preserving the classic-script execution-order contract of `index.html`.
5. **Per-URL dedup (L5)** — a URL already evaluated is never re-injected (shared
   files across chunks load exactly once).
6. **Failure + retry (L6)** — a failed script rejects the feature promise, the
   pending entry is cleared, and a subsequent call retries.
7. **Stub boundary (L7)** — `feature-stubs.js` installs stubs only for names
   undefined at install time; after the chunk loads, the real definition wins;
   a chunk that fails to define a stubbed name surfaces a clear rejection (no
   silent recursion).
8. **Tab gate map (L8)** — every `TAB_FEATURES` entry resolves to a feature that
   is either lazily manifested or in the documented eager set.
9. **Stub table coverage (L9)** — every stubbed feature name exists in the
   manifest registry.

## Loading model

The loader never converts files to ES modules and never introduces a bundler.
Demand loading is achieved by sequential `<script>` injection, preserving
global-function semantics, execution order within a chunk, and the existing
service-worker cache-first behavior for same-origin GETs.
