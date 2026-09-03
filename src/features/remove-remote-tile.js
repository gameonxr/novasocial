// removeRemoteTile — extracted from index.html
// Owner SHA-256: d4ba29e2b9575e17d426d61d1ac6cbf2ac9ec796eed29eccc778372a36f1b6df
// Classic script — exposes window.removeRemoteTile

window.removeRemoteTile = function removeRemoteTile(userId) {
  const tile = document.getElementById('gc-tile-' + userId);
  if (tile) tile.remove();
  if (_groupCallState.audioAnalysers[userId]) delete _groupCallState.audioAnalysers[userId];
  updateParticipantCount();
};
