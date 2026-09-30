// NovaSocial Feature Loader — demand loading for classic scripts.
// Part of the feature-based architecture migration
// (project-management/architecture/ARCHITECTURE.md).
//
// Design contract:
//   1. loadFeature(name) returns a cached Promise — duplicate concurrent calls
//      share one load; a completed feature resolves immediately.
//   2. Chunk scripts are injected sequentially in manifest order (preserves the
//      classic-script execution-order contract of index.html).
//   3. Per-URL dedup: a file shared by two chunks is only ever evaluated once.
//   4. Failures clear the pending entry so a later call retries (network-chunk
//      retry); the rejection propagates to the caller for error UI.
//   5. Transitional backward compatibility: while a feature's scripts are still
//      present as <script> tags in the document (pre-migration state), the
//      feature counts as already loaded — this keeps every intermediate
//      migration state behavior-identical to today.
//   6. Debug logging only when explicitly enabled.
//
// ── FAILURE HARDENING (post-migration repair) ────────────────────────
//   6a. Per-script LOAD TIMEOUT: a request that neither resolves nor errors
//       within FEATURE_LOAD_TIMEOUT_MS rejects and removes the tag — the chain
//       can never hang forever on a stalled request.
//   6b. Script-eval-error detection: uncaught errors during a chunk file's
//       evaluation (window error events whose filename matches the injected
//       URL) reject that file's load — a chunk that throws half its way through
//       is treated as a failed load, not a silent success.
//   6c. On chunk failure the stub layer is notified
//       (window.__novaFeatureStubs.onFeatureFailure) so stubs the partial
//       execution overwrote are re-installed — the demand-loading boundary
//       survives partial failures and the next call retries cleanly.
//
// No globals are created beyond the loader API itself.

window.__novaFeatureLoader = (function () {
  'use strict';

  const FEATURE_LOAD_TIMEOUT_MS = 20000;

  const loadedFeatures = new Set();
  const pendingFeatures = new Map();
  const loadedScriptUrls = new Set();

  // uncaught-error ring buffer — consulted by el.onload to detect eval-time
  // script errors in injected chunk files (see 6b above)
  window.__novaScriptErrors = [];
  window.addEventListener('error', function (ev) {
    try {
      if (ev && ev.filename && window.__novaScriptErrors.length < 50) {
        window.__novaScriptErrors.push({ filename: ev.filename, message: ev.message, ts: Date.now() });
      }
    } catch (e) {}
  });

  function notifyStubsOnFailure(name) {
    try {
      if (window.__novaFeatureStubs && typeof window.__novaFeatureStubs.onFeatureFailure === 'function') {
        window.__novaFeatureStubs.onFeatureFailure(name);
      }
    } catch (e) { /* hardening must never break the failure path itself */ }
  }

  function debug() {
    if (window.__NOVA_FEATURE_DEBUG || (window.localStorage && localStorage.getItem('nova-feature-debug') === '1')) {
      console.log('%c[FeatureLoader]', 'color:#00ff88;font-weight:bold', ...arguments);
    }
  }

  function manifestFor(name) {
    const manifests = window.FEATURE_MANIFESTS || {};
    const list = manifests[name];
    if (!Array.isArray(list) || !list.length) {
      return null;
    }
    return list;
  }

  // ── Transitional state detection ─────────────────────────────────────
  // If the feature's first manifest URL is present as a <script src> tag in the
  // document, the feature was loaded eagerly at page build (pre-migration state).
  // Loader-injected tags (marker property __novaInjected) are EXCLUDED: a partial
  // chunk load that failed mid-chain leaves its successfully-injected tags in the
  // document, and treating those as the transitional eager state made loadFeature
  // resolve without loading the remaining files — every stub after the failure
  // point then hit "loaded but did not define" ("Something went wrong — please
  // try again") for the rest of the page session. Real eager tags from the page
  // HTML carry no marker and keep the transitional behavior unchanged.
  function featurePresentInDocument(name) {
    const list = manifestFor(name);
    if (!list) return false;
    const first = list[0];
    const tags = document.querySelectorAll('script[src]');
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].__novaInjected) continue; // demand-load injected tag, not an eager document tag
      const src = tags[i].getAttribute('src');
      if (src === first || (src && src.indexOf(first) >= 0 && src.slice(-first.length) === first)) {
        return true;
      }
    }
    return false;
  }

  function isFeatureLoaded(name) {
    return loadedFeatures.has(name) || featurePresentInDocument(name);
  }

  // ── Sequential classic-script injection ──────────────────────────────
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      if (loadedScriptUrls.has(url)) { resolve(); return; }
      // skip a URL already present in the document (transitional shared files)
      const existing = document.querySelector('script[src="' + url + '"]');
      if (existing) {
        loadedScriptUrls.add(url);
        resolve();
        return;
      }
      let settled = false;
      const el = document.createElement('script');
      el.src = url;
      el.async = false;           // preserve ordering relative to other injected scripts
      el.__novaInjected = true;   // demand-load marker — see featurePresentInDocument
      // hardening 6a: a request that neither resolves nor errors within the
      // timeout rejects and removes the tag — the chain can never hang forever
      const timeoutId = setTimeout(function () {
        if (settled) return;
        settled = true;
        el.remove();
        debug('TIMEOUT', url);
        reject(new Error('FeatureLoader: timeout loading ' + url));
      }, FEATURE_LOAD_TIMEOUT_MS);
      el.onload = function () {
        if (settled) return;
        // hardening 6b: did this file throw while evaluating? An uncaught
        // error whose source matches this URL means partial definitions only —
        // treat as failure so the chunk is retried instead of half-loaded.
        const errs = window.__novaScriptErrors || [];
        for (let i = 0; i < errs.length; i++) {
          if (errs[i].filename && errs[i].filename.length >= url.length &&
              errs[i].filename.slice(-url.length) === url) {
            settled = true;
            clearTimeout(timeoutId);
            el.remove();
            debug('EVAL ERROR', url, errs[i].message);
            reject(new Error('FeatureLoader: script error in ' + url + ' — ' + errs[i].message));
            return;
          }
        }
        settled = true;
        clearTimeout(timeoutId);
        loadedScriptUrls.add(url);
        debug('loaded', url);
        resolve();
      };
      el.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        el.remove();
        debug('FAILED', url);
        reject(new Error('FeatureLoader: failed to load ' + url));
      };
      document.head.appendChild(el);
    });
  }

  async function loadScriptsSequentially(urls) {
    for (let i = 0; i < urls.length; i++) {
      await loadScript(urls[i]);
    }
  }

  function loadFeature(name) {
    const list = manifestFor(name);
    if (!list) {
      return Promise.reject(new Error('FeatureLoader: unknown feature "' + name + '"'));
    }
    if (loadedFeatures.has(name)) {
      return Promise.resolve();
    }
    if (featurePresentInDocument(name)) {
      loadedFeatures.add(name);
      list.forEach(function (u) { loadedScriptUrls.add(u); });
      debug(name, 'already present in document (transitional eager state)');
      return Promise.resolve();
    }
    if (pendingFeatures.has(name)) {
      return pendingFeatures.get(name);
    }
    debug('loading feature', name, '(' + list.length + ' scripts)');
    var p = loadScriptsSequentially(list).then(function () {
      loadedFeatures.add(name);
      pendingFeatures.delete(name);
      debug('feature ready', name);
    }, function (err) {
      // failure → clear pending so the next call retries + restore any stubs
      // the partial execution overwrote (boundary preservation — 6c)
      pendingFeatures.delete(name);
      notifyStubsOnFailure(name);
      debug('feature failed', name, err.message);
      throw err;
    });
    pendingFeatures.set(name, p);
    return p;
  }

  return {
    loadFeature: loadFeature,
    isFeatureLoaded: isFeatureLoaded,
    _loadedFeatures: loadedFeatures,
    _loadedScriptUrls: loadedScriptUrls,
  };
})();

// Public API (stable names, used by go()/stubs/silent-refresh)
window.loadFeature = window.__novaFeatureLoader.loadFeature;
window.isFeatureLoaded = window.__novaFeatureLoader.isFeatureLoaded;
