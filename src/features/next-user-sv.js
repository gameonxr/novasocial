// nextUserSV — extracted from index.html
// Owner SHA-256: 117963d73601f6a70ab3b28357a7f1b2b354d9d2ddc3f04a7624d8835aa19847
// Classic script — exposes window.nextUserSV

window.nextUserSV = function nextUserSV(){
  stopSVPlayback();
  window._svSlideDir = 'next';
  svBucketIdx++;
  svStoryIdx = 0;
  if(svBucketIdx >= svBuckets.length) return closeSV();
  renderSV();
};
