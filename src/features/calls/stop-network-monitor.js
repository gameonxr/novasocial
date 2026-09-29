// stopNetworkMonitor — extracted from index.html
// Owner SHA-256: d03fbecad3341c8fa8479ada72e7a1e028b9d3127651bbfbff8cc4f4be1d2509
// Classic script — exposes window.stopNetworkMonitor

window.stopNetworkMonitor = function stopNetworkMonitor(){
  if(window._networkMonitorInterval){ clearInterval(window._networkMonitorInterval); window._networkMonitorInterval = null; }
};
