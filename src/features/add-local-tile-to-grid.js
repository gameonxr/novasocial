// addLocalTileToGrid — extracted from index.html
// Owner SHA-256: d45626df60a604f03372f42cd9a9d5bd134a3725d81978e79db4ebb792f4931f
// Classic script — exposes window.addLocalTileToGrid

window.addLocalTileToGrid = function addLocalTileToGrid() {
  const grid = document.getElementById('group-call-grid');
  if (!grid) return;
  const tile = document.createElement('div');
  tile.id = 'gc-tile-me';
  tile.className = 'gc-tile';
  tile.innerHTML = _groupCallState.callType === 'video'
    ? `<video autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)" id="gc-video-me"></video><div class="gc-name-tag">You</div>`
    : `<div class="gc-avatar-tile">${av(PROF?.avatar_url, PROF?.username, 64)}</div><div class="gc-name-tag">You</div>`;
  grid.appendChild(tile);
  if (_groupCallState.callType === 'video') {
    document.getElementById('gc-video-me').srcObject = _groupCallState.localStream;
  }
  updateParticipantCount();
};
