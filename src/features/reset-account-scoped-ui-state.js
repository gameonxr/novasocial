// resetAccountScopedUiState — extracted from index.html
// Owner SHA-256: a83a4b6195fb9d5994b376ae3b84b5da24ac8669223d0c0dde2a141660c0fec1
// Classic script — exposes window.resetAccountScopedUiState

window.resetAccountScopedUiState = function resetAccountScopedUiState(nextUserId){
  const normalizedUserId = nextUserId || null;
  if(_uiAccountUserId === normalizedUserId) return;

  _renderGeneration++;
  Object.keys(_tabCache).forEach(k => delete _tabCache[k]);
  Object.keys(_tabScrollPos).forEach(k => delete _tabScrollPos[k]);
  window._lastKnownFeedTimestamp = null;

  svData = [];
  svBuckets = [];
  svBucketIdx = 0;
  svStoryIdx = 0;
  svProg = 0;
  svIsPaused = false;
  if(typeof _myActiveNote !== 'undefined') _myActiveNote = null;
  if(typeof destroyReelsPersistentContainer === 'function') destroyReelsPersistentContainer();

  const scr = document.getElementById('screen');
  if(scr){
    scr.innerHTML = '';
    scr.onscroll = null;
    scr.scrollTop = 0;
  }
  _uiAccountUserId = normalizedUserId;
};
