// prevSV — extracted from index.html
// Owner SHA-256: 9cb60d062e28849d3f27f1aa057629500592138ce49291551a45e29798fc83e8
// Classic script — exposes window.prevSV

window.prevSV = function prevSV(){
  stopSVPlayback();
  svStoryIdx--;
  if(svStoryIdx < 0) {
    svBucketIdx--;
    if(svBucketIdx < 0) { svBucketIdx = 0; svStoryIdx = 0; }
    else { svStoryIdx = svBuckets[svBucketIdx].stories.length - 1; }
  }
  renderSV();
};
