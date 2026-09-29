// loadStoryPollState — extracted from index.html
// Owner SHA-256: f900a16198e0b1d65e40045425bf66d22d0c7ab08a48f97e043dc5606ec1a1f1
// Classic script — exposes window.loadStoryPollState

window.loadStoryPollState = async function loadStoryPollState(storyId, pollIdx, options, cardEl){
  try {
    const isMultiVote = cardEl.dataset.multiVote === '1';
    const { data: myVotes } = await db.from('story_poll_votes')
      .select('option_idx')
      .eq('story_id', storyId)
      .eq('poll_idx', pollIdx)
      .eq('voter_id', ME.id);

    if(myVotes && myVotes.length > 0){
      const picked = myVotes.map(v => v.option_idx).filter(i => i >= 0 && i < options.length);
      cardEl.dataset.voted = '1';
      cardEl.dataset.picked = picked.join(',');
      await refreshPollResults(storyId, pollIdx, options, cardEl, picked);
    }
  } catch(e) {
    // Table may not exist yet — silently ignore
  }
};
