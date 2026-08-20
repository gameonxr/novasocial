const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const compress = fs.readFileSync(path.join(repo, 'src', 'features', 'compress-video.js'), 'utf8');
const trim = fs.readFileSync(path.join(repo, 'src', 'features', 'trim-video.js'), 'utf8');

function assertFrameLoop(source, label) {
  assert(source.includes('let drawing=true') || source.includes('let drawing = true'), `${label} must retain a drawing guard`);
  assert(source.includes('if(!drawing)return') || source.includes('if(!drawing) return') || source.includes('if(!drawing)return;') || source.includes('if (!drawing) return'), `${label} must stop the frame loop when drawing is false`);
  assert(source.includes('requestAnimationFrame(draw)'), `${label} must retain the guarded animation-frame loop`);
  assert(source.includes('drawing=false') || source.includes('drawing = false'), `${label} stop path must disable drawing`);
  assert(source.includes('video.pause()'), `${label} stop path must pause video`);
  assert(source.includes('recorder.stop()'), `${label} stop path must stop recorder`);
}

assertFrameLoop(compress, 'compression');
assertFrameLoop(trim, 'trimming');
const compressStop = compress.indexOf('drawing = false');
const compressPause = compress.indexOf('video.pause()', compressStop);
const compressRecorderStop = compress.indexOf('recorder.stop()', compressPause);
assert(compressStop >= 0 && compressPause > compressStop && compressRecorderStop > compressPause, 'compression stop order must be drawing false, pause, recorder stop');
const trimStop = trim.indexOf('drawing=false');
const trimPause = trim.indexOf('video.pause()', trimStop);
const trimRecorderStop = trim.indexOf('recorder.stop()', trimPause);
assert(trimStop >= 0 && trimPause > trimStop && trimRecorderStop > trimPause, 'trim stop order must be drawing false, pause, recorder stop');
assert(compress.includes('URL.revokeObjectURL(url)'), 'compression must retain object URL cleanup');
assert(compress.includes('recorder.onerror'), 'compression must retain recorder error fallback');
assert(trim.includes('video.onerror=reject'), 'trim must retain video error rejection');

console.log('MEDIA_FRAME_LOOP_HARNESS=PASS');
console.log('COMPRESSION_LOOP=PASS');
console.log('TRIM_LOOP=PASS');
console.log('STOP_ORDER=PASS');
console.log('FAILURE_CLEANUP_MARKERS=PASS');
