// refreshPollResults — extracted from index.html
// Owner SHA-256: ddb2b93f950db23fda568f892910976b1d22b8d36517d22c1dec7de62626e2e1
// Classic script — exposes window.refreshPollResults

window.refreshPollResults = async function refreshPollResults(storyId, pollIdx, options, cardEl, pickedIdxs){
  pickedIdxs = pickedIdxs || [];
  let voteCounts = options.map(() => 0);
  let totalVotes = 0;
  try {
    const { data: votes } = await db.from('story_poll_votes')
      .select('option_idx')
      .eq('story_id', storyId)
      .eq('poll_idx', pollIdx);
    (votes || []).forEach(v => {
      if(v.option_idx >= 0 && v.option_idx < options.length){
        voteCounts[v.option_idx]++;
        totalVotes++;
      }
    });
  } catch(e) {
    // Fallback: simulate just the current user's vote(s)
    pickedIdxs.forEach(i => { voteCounts[i] = 1; });
    totalVotes = pickedIdxs.length;
  }

  // Animate result bars
  const optEls = cardEl.querySelectorAll('.sv-poll-opt');
  optEls.forEach((el, i) => {
    const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
    const bar = el.querySelector('.sv-poll-bar');
    const pctText = el.querySelector('.sv-poll-opt-pct');
    if(bar){
      bar.style.opacity = '0.4';
      setTimeout(() => { bar.style.width = pct + '%'; }, 50);
    }
    if(pctText){
      pctText.textContent = pct + '%';
      pctText.style.opacity = '1';
    }
    // Highlight user's choice
    if(pickedIdxs.includes(i)){
      el.style.border = '1px solid #FF2D7A';
      el.style.background = 'rgba(255,45,122,0.22)';
      el.style.boxShadow = '0 0 0 1px #FF2D7A';
    } else {
      el.style.opacity = '0.75';
      el.style.border = '1px solid rgba(255,255,255,0.15)';
      el.style.background = 'rgba(255,255,255,0.12)';
      el.style.boxShadow = 'none';
    }
  });

  // Update meta
  const meta = cardEl.querySelector('.sv-poll-meta');
  if(meta){
    const isMulti = cardEl.dataset.multiVote === '1';
    const txt = totalVotes + ' vote' + (totalVotes === 1 ? '' : 's');
    meta.textContent = isMulti ? (pickedIdxs.length > 0 ? txt + ' · You picked ' + pickedIdxs.length : txt + ' · Tap to vote') : txt;
  }
};
