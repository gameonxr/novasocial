const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const observerSource = fs.readFileSync(path.join(repo, 'src', 'features', 'init-video-observer.js'), 'utf8');
const homeSource = fs.readFileSync(path.join(repo, 'src', 'features', 'home.js'), 'utf8');
const videos = [
  { id: 'visible', paused: false, pause() { this.paused = true; } },
  { id: 'hidden', paused: false, pause() { this.paused = true; } },
];
let callback = null;
const observed = [];
const context = {
  document: { querySelectorAll(selector) { assert.strictEqual(selector, 'video'); return videos; } },
  IntersectionObserver: class {
    constructor(fn) { callback = fn; }
    observe(video) { observed.push(video); }
  },
};
vm.createContext(context);
vm.runInContext(observerSource, context, { filename: 'init-video-observer.js' });
context.initVideoObserver();

assert.strictEqual(observed.length, videos.length, 'every current video must be observed');
assert.deepStrictEqual(observed.map((video) => video.id), ['visible', 'hidden'], 'videos must be observed in document order');
assert.strictEqual(typeof callback, 'function', 'IntersectionObserver callback must be registered');
callback([
  { target: videos[0], isIntersecting: true },
  { target: videos[1], isIntersecting: false },
]);
assert.strictEqual(videos[0].paused, false, 'visible video must not be paused');
assert.strictEqual(videos[1].paused, true, 'non-intersecting video must be paused');
assert(homeSource.includes('initVideoObserver()'), 'Home rendering must retain the video observer integration');

console.log('VIDEO_OBSERVER_HARNESS=PASS');
console.log('VIDEOS_OBSERVED=2');
console.log('VISIBLE_VIDEO_PAUSED=0');
console.log('OFFSCREEN_VIDEO_PAUSED=1');
console.log('HOME_INTEGRATION=PASS');
