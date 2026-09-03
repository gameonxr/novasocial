// addRemoteTileToGrid — extracted from index.html
// Owner SHA-256: 00589cad685611ea4e6f04965ae46db046cdcee5d7fa6768b53388ab816d8a6f
// Classic script — exposes window.addRemoteTileToGrid

window.addRemoteTileToGrid = function addRemoteTileToGrid(userId, profile, stream) {
  const grid = document.getElementById('group-call-grid');
  if (!grid) return;
  let tile = document.getElementById('gc-tile-' + userId);
  if (!tile) {
    tile = document.createElement('div');
    tile.id = 'gc-tile-' + userId;
    tile.className = 'gc-tile';
    grid.appendChild(tile);
  }
  const isVideo = _groupCallState.callType === 'video' && stream.getVideoTracks().length > 0;
  tile.innerHTML = isVideo
    ? `<video autoplay playsinline style="width:100%;height:100%;object-fit:cover" id="gc-video-${userId}"></video><div class="gc-name-tag">${profile?.username || 'User'}</div>`
    : `<div class="gc-avatar-tile">${av(profile?.avatar_url, profile?.username, 64)}</div><div class="gc-name-tag">${profile?.username || 'User'}</div><audio autoplay playsinline id="gc-audio-${userId}"></audio>`;
  if (isVideo) document.getElementById('gc-video-'+userId).srcObject = stream;
  else { const a = document.getElementById('gc-audio-'+userId); if(a) a.srcObject = stream; }
  updateParticipantCount();
};
