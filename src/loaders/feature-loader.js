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
// No globals are created beyond the loader API itself.

window.__novaFeatureLoader = (function () {
  'use strict';

  const loadedFeatures = new Set();
  const pendingFeatures = new Map();
  const loadedScriptUrls = new Set();

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
      const el = document.createElement('script');
      el.src = url;
      el.async = false;           // preserve ordering relative to other injected scripts
      el.__novaInjected = true;   // demand-load marker — see featurePresentInDocument
      el.onload = function () {
        loadedScriptUrls.add(url);
        debug('loaded', url);
        resolve();
      };
      el.onerror = function () {
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
      // failure → clear pending so the next call retries
      pendingFeatures.delete(name);
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
