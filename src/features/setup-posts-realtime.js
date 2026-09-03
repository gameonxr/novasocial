// setupPostsRealtime — extracted from index.html
// Owner SHA-256: 7f4683c5cee74e7b7cd083ca59a29cd02b08829aa11e0ba075b410734c64e4f6
// Classic script — exposes window.setupPostsRealtime

window.setupPostsRealtime = function setupPostsRealtime(){
  // No-op: global posts realtime subscription intentionally removed (Part 6 Fix 1).
  // Cleanup any leftover channel from older app versions still running in this tab.
  if(window.postsSub){
    try { db.removeChannel(window.postsSub); } catch(_) {}
    window.postsSub = null;
  }
};
