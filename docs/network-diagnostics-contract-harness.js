function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockConnectionQuality(connection) {
  const conn = connection || null;
  if (!conn || !conn.effectiveType) return 'good';
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 'low';
  if (conn.effectiveType === '3g') return 'eco';
  return 'good';
}

function mockPacketLoss({ packetsLost = 0, packetsReceived = 0 }) {
  const lossRate = packetsReceived > 0 ? packetsLost / (packetsLost + packetsReceived) : 0;
  if (lossRate < 0.02) return { lossRate, label: 'Excellent', color: '#3db83d' };
  if (lossRate < 0.08) return { lossRate, label: 'Good', color: '#ffaa00' };
  return { lossRate, label: 'Poor', color: '#E1306C' };
}

function mockMonitorTick({ peer, active, stats = [] }) {
  const events = [];
  if (!peer || !active) return { events, indicator: null };
  let packetsLost = 0;
  let packetsReceived = 0;
  stats.forEach(report => {
    if (report.type === 'inbound-rtp') {
      packetsLost += report.packetsLost || 0;
      packetsReceived += report.packetsReceived || 0;
    }
  });
  const indicator = mockPacketLoss({ packetsLost, packetsReceived });
  events.push(`indicator:${indicator.label}:${indicator.color}`);
  return { events, indicator };
}

function mockStopMonitor({ interval = 'monitor-id' } = {}) {
  return interval ? { cleared: true, interval: null, events: ['monitor.clear'] } : { cleared: false, interval: null, events: [] };
}

(() => {
  assert(mockConnectionQuality(null) === 'good', 'Unsupported connection must default to good');
  assert(mockConnectionQuality({ effectiveType: 'slow-2g' }) === 'low', 'slow-2g must map to low');
  assert(mockConnectionQuality({ effectiveType: '2g' }) === 'low', '2g must map to low');
  assert(mockConnectionQuality({ effectiveType: '3g' }) === 'eco', '3g must map to eco');
  assert(mockConnectionQuality({ effectiveType: '4g' }) === 'good', '4g must map to good');
  assert(mockConnectionQuality({ effectiveType: 'unknown' }) === 'good', 'Unknown effective type must default to good');

  const excellent = mockPacketLoss({ packetsLost: 1, packetsReceived: 99 });
  const good = mockPacketLoss({ packetsLost: 5, packetsReceived: 95 });
  const poor = mockPacketLoss({ packetsLost: 20, packetsReceived: 80 });
  const noPackets = mockPacketLoss({ packetsLost: 4, packetsReceived: 0 });
  assert(excellent.label === 'Excellent' && excellent.color === '#3db83d', 'Loss below 2% must be Excellent/green');
  assert(good.label === 'Good' && good.color === '#ffaa00', 'Loss from 2% to below 8% must be Good/amber');
  assert(poor.label === 'Poor' && poor.color === '#E1306C', 'Loss at or above 8% must be Poor/red');
  assert(noPackets.label === 'Excellent', 'No received packets must use zero-loss default');

  const inactive = mockMonitorTick({ peer: null, active: false, stats: [{ type: 'inbound-rtp', packetsLost: 20, packetsReceived: 80 }] });
  const active = mockMonitorTick({ peer: 'peer', active: true, stats: [{ type: 'inbound-rtp', packetsLost: 5, packetsReceived: 95 }, { type: 'candidate-pair' }] });
  assert(inactive.events.length === 0 && inactive.indicator === null, 'Inactive call or missing peer must be a monitor no-op');
  assert(active.indicator.label === 'Good' && active.events.includes('indicator:Good:#ffaa00'), 'Active monitor must aggregate inbound RTP and update indicator');

  const stopped = mockStopMonitor({ interval: 'monitor-id' });
  const alreadyStopped = mockStopMonitor({ interval: null });
  assert(stopped.cleared && stopped.interval === null && stopped.events.includes('monitor.clear'), 'Stop must clear active monitor interval');
  assert(!alreadyStopped.cleared && alreadyStopped.events.length === 0, 'Stop with no interval must be idempotent');

  console.log(JSON.stringify({ passed: true, qualities: { unsupported: mockConnectionQuality(null), slow2g: mockConnectionQuality({ effectiveType: 'slow-2g' }), twoG: mockConnectionQuality({ effectiveType: '2g' }), threeG: mockConnectionQuality({ effectiveType: '3g' }), fourG: mockConnectionQuality({ effectiveType: '4g' }), unknown: mockConnectionQuality({ effectiveType: 'unknown' }) }, packetLoss: { excellent, good, poor, noPackets }, inactive, active, stopped, alreadyStopped }, null, 2));
})();
