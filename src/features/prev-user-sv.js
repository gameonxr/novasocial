// prevUserSV — extracted from index.html
// Owner SHA-256: d9a88c1e8fda8b636b1238346b708af313694be4da1b19eaa91f61081ca87a79
// Classic script — exposes window.prevUserSV

window.prevUserSV = function prevUserSV(){
  stopSVPlayback();
  window._svSlideDir = 'prev';
  svBucketIdx--;
  svStoryIdx = 0;
  if(svBucketIdx < 0) { svBucketIdx = 0; return; }
  renderSV();
};
