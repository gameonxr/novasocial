// openSV — extracted from index.html
// Owner SHA-256: c8103e965b415bcc6e206f4687aeaa21511afec71bb25a64d37cadf73732decd
// Classic script — exposes window.openSV

window.openSV = function openSV(startIdx){
  if(!svData.length) return;
  // NAV-STACK: push story viewer entry
  pushNavState('story', 'sv', closeSV);

  const grouped = {};
  svData.forEach(s => {
    if(!grouped[s.user_id]) grouped[s.user_id] = { user_id: s.user_id, username: s.profiles?.username, avatar_url: s.profiles?.avatar_url, stories: [] };
    grouped[s.user_id].stories.push(s);
  });
  svBuckets = Object.values(grouped);

  const startStory = svData[startIdx];
  for(let i=0; i<svBuckets.length; i++) {
    const storyIdx = svBuckets[i].stories.findIndex(s => s.id === startStory.id);
    if(storyIdx !== -1) {
      svBucketIdx = i;
      svStoryIdx = storyIdx;
      break;
    }
  }

  document.getElementById('sv').classList.add('show');
  renderSV();
};
