// voteStoryPoll — extracted from index.html
// Owner SHA-256: a397ae7a04ece8a995aa694896b98b03e56802cb675803876d1db001ee31bac5
// Classic script — exposes window.voteStoryPoll

window.voteStoryPoll = async function voteStoryPoll(storyId, pollIdx, options, optIdx, cardEl){
  if(!cardEl) return;
  const isMultiVote = cardEl.dataset.multiVote === '1';

  // For single-vote: prevent re-voting
  if(!isMultiVote && cardEl.dataset.voted === '1') return;

  // For multi-vote: track which options user picked (comma-separated)
  if(isMultiVote){
    const picked = cardEl.dataset.picked ? cardEl.dataset.picked.split(',').map(Number) : [];
    const pos = picked.indexOf(optIdx);
    if(pos >= 0){
      // Un-toggle this option
      picked.splice(pos, 1);
      // Remove from DB
      try {
        await db.from('story_poll_votes')
          .delete()
          .eq('story_id', storyId)
          .eq('poll_idx', pollIdx)
          .eq('voter_id', ME.id)
          .eq('option_idx', optIdx);
      } catch(e) {}
    } else {
      picked.push(optIdx);
      // Save to DB
      try {
        await db.from('story_poll_votes').upsert({
          story_id: storyId,
          poll_idx: pollIdx,
          voter_id: ME.id,
          option_idx: optIdx,
          option_text: options[optIdx]
        });
      } catch(e) {
        console.log('Poll vote save skipped:', e.message);
      }
    }
    cardEl.dataset.picked = picked.join(',');
    if(picked.length > 0) cardEl.dataset.voted = '1';
    else cardEl.dataset.voted = '0';

    await refreshPollResults(storyId, pollIdx, options, cardEl, picked);
    return;
  }

  // Single-vote flow
  cardEl.dataset.voted = '1';
  cardEl.dataset.picked = String(optIdx);

  // Save vote to DB (best-effort; if table missing, just show local results)
  try {
    await db.from('story_poll_votes').upsert({
      story_id: storyId,
      poll_idx: pollIdx,
      voter_id: ME.id,
      option_idx: optIdx,
      option_text: options[optIdx]
    });
  } catch(e) {
    console.log('Poll vote save skipped (table may not exist):', e.message);
  }

  await refreshPollResults(storyId, pollIdx, options, cardEl, [optIdx]);
};
