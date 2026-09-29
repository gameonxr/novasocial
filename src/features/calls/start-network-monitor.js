// startNetworkMonitor — extracted from index.html
// Owner SHA-256: b1b0ca7dc28f378e9985ce0afda141eebc94f260a03443120b6098bb1ac4955b
// Classic script — exposes window.startNetworkMonitor

window.startNetworkMonitor = function startNetworkMonitor(){
  if(window._networkMonitorInterval) clearInterval(window._networkMonitorInterval);
  window._networkMonitorInterval = setInterval(async () => {
    if(!_callState.peer || !_callState.active) return;
    try{
      const stats = await _callState.peer.getStats();
      let packetsLost = 0, packetsReceived = 0;
      stats.forEach(report => {
        if(report.type === 'inbound-rtp'){
          packetsLost += report.packetsLost || 0;
          packetsReceived += report.packetsReceived || 0;
        }
      });
      const lossRate = packetsReceived > 0 ? (packetsLost/(packetsLost+packetsReceived)) : 0;
      const indicator = document.getElementById('nova-call-network-indicator');
      if(indicator){
        const label = lossRate < 0.02 ? 'Excellent' : lossRate < 0.08 ? 'Good' : 'Poor';
        const color = lossRate < 0.02 ? '#3db83d' : lossRate < 0.08 ? '#ffaa00' : '#E1306C';
        indicator.querySelector('span').textContent = label;
        indicator.querySelector('span').style.color = color;
      }
    }catch(e){}
  }, 3000);
};
