function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockVote({ options, multi = false, voted = false, picked = [], optIdx, persistenceFails = false }) {
  const state = { voted: voted ? '1' : '0', picked: [...picked] };
  const events = [];
  if (!multi && state.voted === '1') return { state, events: ['vote.ignored.single'] };
  if (multi) {
    const pos = state.picked.indexOf(optIdx);
    if (pos >= 0) {
      state.picked.splice(pos, 1);
      events.push(`db.delete:${optIdx}`);
    } else {
      state.picked.push(optIdx);
      events.push(persistenceFails ? 'db.upsert.failed.silent' : `db.upsert:${optIdx}:${options[optIdx]}`);
    }
    state.voted = state.picked.length > 0 ? '1' : '0';
    events.push(`refresh:${state.picked.join(',')}`);
    return { state, events };
  }
  state.voted = '1';
  state.picked = [optIdx];
  events.push(persistenceFails ? 'db.upsert.failed.silent' : `db.upsert:${optIdx}:${options[optIdx]}`, `refresh:${optIdx}`);
  return { state, events };
}

function mockResults({ options, votes = null, picked = [], multi = false }) {
  let counts = options.map(() => 0);
  let total = 0;
  if (votes === null) {
    picked.forEach(index => { counts[index] = 1; });
    total = picked.length;
  } else {
    votes.forEach(vote => {
      if (vote.option_idx >= 0 && vote.option_idx < options.length) {
        counts[vote.option_idx] += 1;
        total += 1;
      }
    });
  }
  const percentages = counts.map(count => total > 0 ? Math.round((count / total) * 100) : 0);
  const meta = multi ? (picked.length > 0 ? `${total} vote${total === 1 ? '' : 's'} · You picked ${picked.length}` : `${total} vote${total === 1 ? '' : 's'} · Tap to vote`) : `${total} vote${total === 1 ? '' : 's'}`;
  return { counts, total, percentages, meta };
}

function createInjectedStoryPollSeam(deps) {
  const calls = [];
  return {
    calls,
    vote(input) {
      calls.push('vote');
      return deps.vote(input);
    },
    results(input) {
      calls.push('results');
      return deps.results(input);
    },
    loadState(input) {
      calls.push('load-state');
      return deps.loadState(input);
    },
  };
}

function mockLoadState({ options, myVotes = null, dbFails = false }) {
  if (dbFails || !myVotes || myVotes.length === 0) return { voted: '0', picked: [], events: dbFails ? ['state.load.failed.silent'] : [] };
  const picked = myVotes.map(vote => vote.option_idx).filter(index => index >= 0 && index < options.length);
  if (!picked.length) return { voted: '0', picked: [], events: ['state.load.no-valid-votes'] };
  return { voted: '1', picked, events: [`refresh:${picked.join(',')}`] };
}

(() => {
  const options = ['A', 'B', 'C'];
  const single = mockVote({ options, optIdx: 1 });
  const singleRepeat = mockVote({ options, voted: true, picked: [1], optIdx: 2 });
  assert(single.state.voted === '1' && single.state.picked.join(',') === '1' && single.events.includes('db.upsert:1:B'), 'Single vote must select one option, persist it, and refresh results');
  assert(singleRepeat.events.includes('vote.ignored.single') && singleRepeat.state.picked.join(',') === '1', 'Single-vote poll must ignore re-voting');

  const multiAdd = mockVote({ options, multi: true, picked: [0], optIdx: 2 });
  const multiRemove = mockVote({ options, multi: true, picked: [0, 2], optIdx: 2 });
  const multiClear = mockVote({ options, multi: true, picked: [2], optIdx: 2 });
  assert(multiAdd.state.picked.join(',') === '0,2' && multiAdd.state.voted === '1', 'Multi-vote must add a new option and retain picked state');
  assert(multiRemove.state.picked.join(',') === '0' && multiRemove.events.includes('db.delete:2'), 'Multi-vote must toggle off selected option and delete its row');
  assert(multiClear.state.picked.length === 0 && multiClear.state.voted === '0', 'Removing the final multi-vote must clear voted state');

  const failedPersist = mockVote({ options, optIdx: 0, persistenceFails: true });
  assert(failedPersist.state.voted === '1' && failedPersist.events.includes('db.upsert.failed.silent'), 'Persistence failure must preserve local result state and fail silently');

  const results = mockResults({ options, votes: [{ option_idx: 0 }, { option_idx: 0 }, { option_idx: 2 }, { option_idx: 9 }], picked: [0] });
  assert(results.total === 3 && results.percentages.join(',') === '67,0,33' && results.meta === '3 votes', 'Results must ignore invalid indexes and calculate rounded percentages');
  const fallback = mockResults({ options, votes: null, picked: [0, 2], multi: true });
  assert(fallback.total === 2 && fallback.percentages.join(',') === '50,0,50' && fallback.meta === '2 votes · You picked 2', 'DB failure fallback must simulate current picked options');
  const emptyResults = mockResults({ options, votes: [], picked: [], multi: true });
  assert(emptyResults.percentages.join(',') === '0,0,0' && emptyResults.meta === '0 votes · Tap to vote', 'Empty results must show zero percentages and multi-vote prompt');

  const restored = mockLoadState({ options, myVotes: [{ option_idx: 2 }, { option_idx: 8 }, { option_idx: -1 }] });
  const noState = mockLoadState({ options, myVotes: [] });
  const failedState = mockLoadState({ options, dbFails: true });
  assert(restored.voted === '1' && restored.picked.join(',') === '2' && restored.events.includes('refresh:2'), 'Prior valid vote state must restore and refresh results');
  assert(noState.voted === '0' && noState.picked.length === 0, 'No prior votes must leave card unvoted');
  assert(failedState.voted === '0' && failedState.events.includes('state.load.failed.silent'), 'State-load table failure must be silent');

  const seam = createInjectedStoryPollSeam({
    vote: mockVote,
    results: mockResults,
    loadState: mockLoadState,
  });
  const injectedVote = seam.vote({ options, optIdx: 1 });
  const injectedResults = seam.results({ options, votes: [{ option_idx: 1 }], picked: [1] });
  const injectedState = seam.loadState({ options, myVotes: [{ option_idx: 1 }] });
  assert(JSON.stringify(seam.calls) === JSON.stringify(['vote', 'results', 'load-state']), 'Injected Story poll seam must dispatch vote, results, and state-load owners explicitly');
  assert(injectedVote.state.picked.join(',') === '1' && injectedResults.total === 1 && injectedState.picked.join(',') === '1', 'Injected Story poll seam must preserve state, result, and restoration outcomes');

  console.log(JSON.stringify({ passed: true, single, singleRepeat, multiAdd, multiRemove, multiClear, failedPersist, results, fallback, emptyResults, restored, noState, failedState, seam: { calls: seam.calls, injectedVote, injectedResults, injectedState } }, null, 2));
})();
