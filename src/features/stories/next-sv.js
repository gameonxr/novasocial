// nextSV — extracted from index.html
// Owner SHA-256: 19a36118632f370da70ce9621f4f8053f8001e1e7be7541292e844dae70ffdce
// Classic script — exposes window.nextSV

window.nextSV = function nextSV(){
  stopSVPlayback();
  svStoryIdx++;
  if(svStoryIdx >= svBuckets[svBucketIdx].stories.length) {
    svBucketIdx++;
    svStoryIdx = 0;
    if(svBucketIdx >= svBuckets.length) return closeSV();
  }
  renderSV();
};
