// showDeleteZone — extracted from index.html
// Owner SHA-256: 863a304b5e11ba5aa4e496501adc89c73ffa655cf1c955e15b67b2dba2d2cee2
// Classic script — exposes window.showDeleteZone

window.showDeleteZone = function showDeleteZone(){
  if(document.getElementById('se-delete-zone')) return;
  const zone = document.createElement('div');
  zone.id = 'se-delete-zone';
  zone.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:25;transition:0.2s;border:2px solid rgba(255,45,122,0.3)';
  zone.innerHTML = ico('trash','#FF2D7A',24);
  document.body.appendChild(zone);
};
