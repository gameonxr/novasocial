'use strict';

const assert = require('assert');
const fs = require('fs');

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

    timers.forEach(timer => timer.callback());
    assert(particles.every(p => p.removeCalled), 'all cleanup callbacks remove their particle');

    console.log('SPAWN_LIKE_PARTICLES_HARNESS=PASS');
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
