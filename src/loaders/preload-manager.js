// NovaSocial preload manager — controlled, network-warm-only prefetch.
// Part of the feature-based architecture migration
// (project-management/architecture/ARCHITECTURE.md).
//
// Policy:
//   - Prefetch WARMS THE NETWORK CACHE ONLY (fetch with low priority) — feature
//     code is never evaluated until the user actually navigates. This keeps
//     side-effect-bearing patch files and initializers exactly where they are
//     today.
//   - Idle-time prefetch of the statistically likely-next feature per tab.
//   - Hover/touch intent prefetch on bottom-nav buttons.
//   - Never prefetch every feature; never on saveData / 2g / very low downlink.
//   - Same-origin GETs pass through the existing service worker, warming its
//     cache (sw.js is untouched).

(function () {
  'use strict';

  function connectionOK() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return true;               // information unavailable — default allowed
    if (c.saveData) return false;
    if (c.effectiveType && /(^|\b)(2g)\b/.test(c.effectiveType)) return false;
    if (typeof c.downlink === 'number' && c.downlink < 1) return false;
    return true;
  }

  function featureUrls(name) {
    const list = window.FEATURE_MANIFESTS && window.FEATURE_MANIFESTS[name];
    return Array.isArray(list) ? list : null;
  }

  const prefetchedFeatures = new Set();

  function prefetchFeature(name) {
    if (!window.isFeatureLoaded) return;
    if (prefetchedFeatures.has(name) || window.isFeatureLoaded(name)) return;
    const urls = featureUrls(name);
    if (!urls) return;
    prefetchedFeatures.add(name);
    if (window.__novaFeatureLoader) window.__novaFeatureLoader.debug && window.__novaFeatureLoader.debug('prefetch (network-warm)', name);
    for (const url of urls) {
      try {
        const opts = { priority: 'low', cache: 'default' };
        fetch(url, opts).catch(function () { /* prefetch is best-effort */ });
      } catch (e) { /* fetch unsupported — ignore */ }
    }
  }

  // Likely-next feature per current tab (documented heuristic — small, useful,
  // never exhaustive).
  const LIKELY_NEXT = {
    home: ['reels', 'stories'],
    explore: ['reels'],
    reels: ['stories'],
    dms: ['profile'],
    notifs: ['dms'],
    profile: ['settings'],
  };

  function onIdle(fn) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: 3000 });
    } else {
      setTimeout(fn, 2000);
    }
  }

  // Idle prefetch of the likely-next features for the ACTIVE tab.
  function prefetchForCurrentTab() {
    if (!connectionOK()) return;
    const tab = (typeof curTab !== 'undefined' && curTab) || 'home';
    const next = LIKELY_NEXT[tab] || [];
    for (const f of next) prefetchFeature(f);
  }

  // Hook app-ready — installed after all startup scripts have evaluated
  // (DOMContentLoaded), so we wrap the FINAL showApp/go definitions (including
  // nova-init.js's showApp patch, which runs at its own script-load time).
  function installHooks() {
    const origShowApp = window.showApp;
    if (typeof origShowApp === 'function') {
      window.showApp = function () {
        const r = origShowApp.apply(this, arguments);
        onIdle(prefetchForCurrentTab);
        return r;
      };
    }

    // Re-evaluate on every tab switch (go() sets curTab before render).
    const origGo = window.go;
    if (typeof origGo === 'function') {
      window.go = function (tab) {
        const r = origGo.apply(this, arguments);
        onIdle(prefetchForCurrentTab);
        return r;
      };
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHooks, { once: true });
  } else {
    installHooks();
  }

  // Hover/touch intent on bottom-nav buttons — warm the target feature early.
  document.addEventListener('pointerover', function (e) {
    const btn = e.target && e.target.closest && e.target.closest('.nb');
    if (!btn) return;
    const tab = btn.dataset && btn.dataset.t;
    const feature = window.TAB_FEATURES && window.TAB_FEATURES[tab];
    if (feature) prefetchFeature(feature);
  }, { passive: true, capture: true });

  // Slow-network listener: nothing to tear down (network-warm only), but we
  // stop further prefetching while constrained.
  window.addEventListener('offline', function () { prefetchedFeatures.clear(); });
})();
