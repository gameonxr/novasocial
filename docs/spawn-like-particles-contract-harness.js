'use strict';

const assert = require('assert');
const fs = require('fs');

function createTestOnlyParticleAdapter(deps) {
  return function testOnlySpawnLikeParticles(target) {
    if (!target) return;
    const rect = deps.geometry(target);
    const colors = ['#E1306C', '#833AB4', '#F77737', '#7afdff', '#fc007c', '#ffd700'];
    for (let i = 0; i < 12; i += 1) {
      const particle = deps.createElement('div');
      particle.className = 'particle';
      particle.style.left = (rect.left + rect.width / 2 - 4) + 'px';
      particle.style.top = (rect.top + rect.height / 2 - 4) + 'px';
      particle.style.background = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 40 + deps.random() * 30;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      deps.appendToBody(particle);
      deps.setTimeout(() => deps.remove(particle), 800);
    }
  };
}

async function runHarness() {
  const originalDocument = global.document;
  const originalSetTimeout = global.setTimeout;
  const originalMathRandom = Math.random;
  const originalWindow = global.window;
  const originalSpawnLikeParticles = global.spawnLikeParticles;

  const particles = [];
  const timers = [];
  const body = { appendChild(node) { particles.push(node); } };
  global.document = {
    body,
    createElement(tag) {
      assert.strictEqual(tag, 'div');
      return {
        className: '', style: { setProperty(name, value) { this[name] = value; } },
        removeCalled: false,
        remove() { this.removeCalled = true; }
      };
    }
  };
  global.setTimeout = (callback, delay) => { timers.push({ callback, delay }); return timers.length; };
  Math.random = () => 0.5;

  try {
    const html = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const moduleSource = fs.readFileSync('/home/z/my-project/novasocial/src/features/spawn-like-particles.js', 'utf8');
    assert(!html.includes('function spawnLikeParticles(el){'), 'inline particle owner must be removed after production split');
    assert(moduleSource.includes('window.spawnLikeParticles = function(el){'), 'production particle module must assign the global owner');
    global.window = global;
    eval(moduleSource);
    assert.strictEqual(typeof global.spawnLikeParticles, 'function', 'window-assigned production owner must be available globally');

    // Null target is a safe no-op.
    global.spawnLikeParticles(null);
    assert.strictEqual(particles.length, 0, 'null target does not create particles');

    const target = { getBoundingClientRect() { return { left: 100, top: 200, width: 20, height: 40 }; } };
    global.spawnLikeParticles(target);
    assert.strictEqual(particles.length, 12, 'exactly twelve particles are created');
    assert.strictEqual(timers.length, 12, 'each particle receives a cleanup timer');
    assert(particles.every(p => p.className === 'particle'), 'all particles use the particle class');
    assert(particles.every(p => p.style.left === '106px'), 'particles center horizontally on the target');
    assert(particles.every(p => p.style.top === '216px'), 'particles center vertically on the target');
    assert.deepStrictEqual(timers.map(t => t.delay), Array(12).fill(800), 'all particles clean up after 800 ms');
    assert.strictEqual(particles[0].style.background, '#E1306C', 'first particle uses the first palette color');
    assert.strictEqual(particles[6].style.background, '#E1306C', 'palette repeats deterministically');
    assert(particles.every(p => typeof p.style['--tx'] === 'string' && typeof p.style['--ty'] === 'string'), 'each particle receives transform vectors');

    const productionSnapshot = particles.map(p => ({
      className: p.className,
      left: p.style.left,
      top: p.style.top,
      background: p.style.background,
      tx: p.style['--tx'],
      ty: p.style['--ty']
    }));
    const productionDelays = timers.map(timer => timer.delay);
    timers.forEach(timer => timer.callback());
    assert(particles.every(p => p.removeCalled), 'all cleanup callbacks remove their particle');

    // Test-only injected adapter comparison against the loaded production module.
    const adapterParticles = [];
    const adapterTimers = [];
    const adapter = createTestOnlyParticleAdapter({
      geometry: target => target.getBoundingClientRect(),
      createElement: tag => {
        assert.strictEqual(tag, 'div');
        return {
          className: '',
          style: { setProperty(name, value) { this[name] = value; } },
          removeCalled: false,
          remove() { this.removeCalled = true; }
        };
      },
      appendToBody: particle => adapterParticles.push(particle),
      random: () => 0.5,
      setTimeout: (callback, delay) => { adapterTimers.push({ callback, delay }); return adapterTimers.length; },
      remove: particle => particle.remove()
    });
    adapter(null);
    assert.strictEqual(adapterParticles.length, 0, 'test-only adapter preserves null-target no-op');
    adapter(target);
    assert.deepStrictEqual(adapterParticles.map(p => ({
      className: p.className,
      left: p.style.left,
      top: p.style.top,
      background: p.style.background,
      tx: p.style['--tx'],
      ty: p.style['--ty']
    })), productionSnapshot, 'test-only adapter observations match production owner');
    assert.deepStrictEqual(adapterTimers.map(timer => timer.delay), productionDelays, 'test-only adapter cleanup delays match production owner');
    adapterTimers.forEach(timer => timer.callback());
    assert(adapterParticles.every(p => p.removeCalled), 'test-only adapter cleanup removes every particle');
    adapterTimers.forEach(timer => timer.callback());
    assert(adapterParticles.every(p => p.removeCalled), 'cleanup callback replay remains harmless');

    // Test-only injected failure branch; production globals and owner remain untouched.
    const failureParticles = [];
    const failureAdapter = createTestOnlyParticleAdapter({
      geometry: target => target.getBoundingClientRect(),
      createElement: () => ({
        className: '',
        style: { setProperty() {} },
        remove() {}
      }),
      appendToBody: particle => {
        failureParticles.push(particle);
        throw new Error('append-boundary-failure');
      },
      random: () => 0.5,
      setTimeout: () => { throw new Error('timer-must-not-run-after-append-failure'); },
      remove: particle => particle.remove()
    });
    assert.throws(() => failureAdapter(target), /append-boundary-failure/, 'test-only failure boundary must surface the injected append error');
    assert.strictEqual(failureParticles.length, 1, 'failure branch stops at the injected append boundary');
    assert.strictEqual(typeof global.spawnLikeParticles, 'function', 'window-assigned production owner remains available under test');
    const likeEffects = fs.readFileSync('/home/z/my-project/novasocial/src/features/like-effects.js', 'utf8');
    assert(likeEffects.includes('spawnLikeParticles(el);'), 'like-effects caller must preserve the global particle handoff');
    assert(!likeEffects.includes('particle-adapter'), 'like-effects caller must not import a second particle owner');

    console.log('SPAWN_LIKE_PARTICLES_HARNESS=PASS');
    console.log('TEST_ONLY_ADAPTER_COMPARISON=PASS');
    console.log('CLEANUP_REPLAY=PASS');
    console.log('FAILURE_BOUNDARY=PASS');
    console.log('WINDOW_CALLER_COMPATIBILITY=PASS');
  } finally {
    global.document = originalDocument;
    global.setTimeout = originalSetTimeout;
    Math.random = originalMathRandom;
    global.window = originalWindow;
    if (typeof originalSpawnLikeParticles === 'undefined') delete global.spawnLikeParticles;
    else global.spawnLikeParticles = originalSpawnLikeParticles;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
