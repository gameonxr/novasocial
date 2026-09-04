// hideDeleteZone — extracted from index.html
// Owner SHA-256: e37367072eb62e1e14ea34fe2e986cf8143428b9ca6e94947f3b2fa503a47a6d
// Classic script — exposes window.hideDeleteZone

window.hideDeleteZone = function hideDeleteZone(){
  const zone = document.getElementById('se-delete-zone');
  if(zone) zone.remove();
};
