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
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('function spawnLikeParticles(el){');
    const end = source.indexOf('\n// Override toggleLike', start);
    assert(start >= 0 && end > start, 'particle-effect boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    eval(`${fnSource}; global.spawnLikeParticles = spawnLikeParticles;`);

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

    const inlineSnapshot = particles.map(p => ({
      className: p.className,
      left: p.style.left,
      top: p.style.top,
      background: p.style.background,
      tx: p.style['--tx'],
      ty: p.style['--ty']
    }));
    const inlineDelays = timers.map(timer => timer.delay);
    timers.forEach(timer => timer.callback());
    assert(particles.every(p => p.removeCalled), 'all cleanup callbacks remove their particle');

    // Test-only injected adapter comparison; no production module is imported or assigned to window.
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
    })), inlineSnapshot, 'test-only adapter observations match inline owner');
    assert.deepStrictEqual(adapterTimers.map(timer => timer.delay), inlineDelays, 'test-only adapter cleanup delays match inline owner');
    adapterTimers.forEach(timer => timer.callback());
    assert(adapterParticles.every(p => p.removeCalled), 'test-only adapter cleanup removes every particle');
    adapterTimers.forEach(timer => timer.callback());
    assert(adapterParticles.every(p => p.removeCalled), 'cleanup callback replay remains harmless');
    assert.strictEqual(typeof global.spawnLikeParticles, 'function', 'inline owner remains the only runtime owner under test');

    console.log('SPAWN_LIKE_PARTICLES_HARNESS=PASS');
    console.log('TEST_ONLY_ADAPTER_COMPARISON=PASS');
    console.log('CLEANUP_REPLAY=PASS');
  } finally {
    global.document = originalDocument;
    global.setTimeout = originalSetTimeout;
    Math.random = originalMathRandom;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
