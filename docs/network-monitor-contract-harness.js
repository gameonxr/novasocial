'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  const originalCallState = global._callState;

  const intervals = [];
  const cleared = [];
  let activeInterval = null;
  const span = { textContent: '', style: {} };
  const indicator = { querySelector(selector) { assert.strictEqual(selector, 'span'); return span; } };
  global.window = { _networkMonitorInterval: 'old-interval' };
  global._callState = { peer: null, active: false };
  global.document = { getElementById(id) { assert.strictEqual(id, 'nova-call-network-indicator'); return indicator; } };
  global.setInterval = (callback, delay) => { const handle = { callback, delay }; intervals.push(handle); activeInterval = handle; return handle; };
  global.clearInterval = handle => { cleared.push(handle); if (activeInterval === handle) activeInterval = null; };

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const start = source.indexOf('function startNetworkMonitor(){');
    const end = source.indexOf('\nfunction showCallScreen()', start);
    assert(start >= 0 && end > start, 'network-monitor boundary must remain present and ordered');
    const fnSource = source.slice(start, end);
    // Evaluate the exact declarations in a lexical scope that exposes the functions globally.
    eval(`${fnSource}; global.startNetworkMonitor = startNetworkMonitor; global.stopNetworkMonitor = stopNetworkMonitor;`);

    global.startNetworkMonitor();
    assert(cleared.includes('old-interval'), 'starting monitor clears an existing interval');
    assert.strictEqual(intervals.at(-1).delay, 3000, 'monitor interval is three seconds');
    const monitor = intervals.at(-1);

    // Inactive calls are a no-op.
    global._callState = { peer: null, active: false };
    await monitor.callback();
    assert.strictEqual(span.textContent, '', 'inactive call does not update quality');

    // Excellent quality: loss below two percent.
    global._callState = { active: true, peer: { async getStats() { return new Map([['in', { type: 'inbound-rtp', packetsLost: 1, packetsReceived: 99 }]]); } } };
    await monitor.callback();
    assert.strictEqual(span.textContent, 'Excellent', 'low packet loss is excellent');
    assert.strictEqual(span.style.color, '#3db83d', 'excellent quality is green');

    // Good quality: loss between two and eight percent.
    global._callState.peer = { async getStats() { return [{ type: 'inbound-rtp', packetsLost: 5, packetsReceived: 95 }]; } };
    await monitor.callback();
    assert.strictEqual(span.textContent, 'Good', 'moderate packet loss is good');
    assert.strictEqual(span.style.color, '#ffaa00', 'good quality is yellow');

    // Poor quality: loss at or above eight percent.
    global._callState.peer = { async getStats() { return [{ type: 'inbound-rtp', packetsLost: 20, packetsReceived: 80 }]; } };
    await monitor.callback();
    assert.strictEqual(span.textContent, 'Poor', 'high packet loss is poor');
    assert.strictEqual(span.style.color, '#E1306C', 'poor quality is pink/red');

    // Stats errors are swallowed and teardown clears the handle.
    global._callState.peer = { async getStats() { throw new Error('stats unavailable'); } };
    await monitor.callback();
    global.stopNetworkMonitor();
    assert(cleared.includes(monitor), 'stop clears the active monitor interval');
    assert.strictEqual(global.window._networkMonitorInterval, null, 'stop resets the stored interval handle');

    console.log('NETWORK_MONITOR_HARNESS=PASS');
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    global._callState = originalCallState;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
