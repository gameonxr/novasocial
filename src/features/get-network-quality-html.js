// Network indicator HTML builder for the Call UI.
function getNetworkQualityHTML(){
  // navigator.connection agar available hai to real network type dikhao
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let bars = 3; // default medium
  if(conn){
    if(conn.effectiveType === '4g') bars = 4;
    else if(conn.effectiveType === '3g') bars = 2;
    else if(conn.effectiveType === '2g') bars = 1;
  }
  let html = '<div style="display:flex;align-items:flex-end;gap:2px;height:12px">';
  for(let i=1;i<=4;i++){
    const active = i <= bars;
    html += `<div class="${active?'network-bar-active':''}" style="width:3px;height:${i*3}px;background:${active?'#3db83d':'rgba(255,255,255,0.25)'};border-radius:1px"></div>`;
  }
  html += '</div>';
  return html;
}
