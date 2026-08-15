// ═══════════════════════════════════════════════════════════════
// NOVAENGINE X — PHASE 1: CORE ENGINE + EVENT BUS
// Purely additive — does not modify any existing function.
// ═══════════════════════════════════════════════════════════════

const NovaEvents = (() => {
  const listeners = {};
  function on(event, cb) {
    (listeners[event] ||= []).push(cb);
    return () => off(event, cb); // returns unsubscribe fn
  }
  function off(event, cb) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(fn => fn !== cb);
  }
  function emit(event, payload) {
    (listeners[event] || []).forEach(cb => {
      try { cb(payload); } catch (e) { console.error(`[NovaEvents] handler error for "${event}":`, e); }
    });
  }
  return { on, off, emit };
})();

const NovaEngine = (() => {
  let booted = false;
  const state = { deviceTier: 'high', bootTime: 0 };

  function detectDevice() {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connType = navigator.connection?.effectiveType || '4g';
    const isLow = mem <= 2 || cores <= 2 || connType === '2g' || connType === 'slow-2g';
    state.deviceTier = isLow ? 'low' : 'high';
    return state.deviceTier;
  }

  async function boot() {
    if (booted) return;
    const t0 = performance.now();
    detectDevice();
    NovaEvents.emit('APP_STARTED', { tier: state.deviceTier });
    booted = true;
    state.bootTime = performance.now() - t0;
    console.log(`⚡ NovaEngine booted in ${state.bootTime.toFixed(1)}ms (device tier: ${state.deviceTier})`);
  }

  return {
    boot,
    detectDevice,
    get tier() { return state.deviceTier; },
    get bootTime() { return state.bootTime; }
  };
})();

// ── LAZY PRIORITY LOADER ──
// Registry for deferred initialization of low/cold priority screens
// (per NovaEngine X doc's own priority tiers: Settings/Help/About/Privacy = Low/Cold)
const NovaLazy = (() => {
  const registry = {};
  const loaded = {};
  function register(name, initFn, priority = 'medium') {
    registry[name] = { initFn, priority };
  }
  async function load(name) {
    if (loaded[name]) return loaded[name];
    const entry = registry[name];
    if (!entry) { console.warn(`[NovaLazy] "${name}" not registered`); return null; }
    const result = await entry.initFn();
    loaded[name] = result || true;
    NovaEvents.emit('LAZY_MODULE_LOADED', { name });
    return loaded[name];
  }
  function isLoaded(name) { return !!loaded[name]; }
  return { register, load, isLoaded };
})();
