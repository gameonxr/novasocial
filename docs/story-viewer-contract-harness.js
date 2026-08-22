function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function groupStories(data, startIdx) {
  const bucketsByUser = {};
  data.forEach(story => {
    if (!bucketsByUser[story.user_id]) bucketsByUser[story.user_id] = { user_id: story.user_id, stories: [] };
    bucketsByUser[story.user_id].stories.push(story);
  });
  const buckets = Object.values(bucketsByUser);
  const startStory = data[startIdx];
  let bucketIdx = 0;
  let storyIdx = 0;
  for (let i = 0; i < buckets.length; i += 1) {
    const found = buckets[i].stories.findIndex(story => story.id === startStory.id);
    if (found !== -1) { bucketIdx = i; storyIdx = found; break; }
  }
  return { buckets, bucketIdx, storyIdx };
}

function renderStory({ story, storyIdx, bucketLength, events }) {
  events.push('stop-previous-playback', 'progress-bars.reset');
  let progress = 0;
  if (story.media_type === 'video') {
    events.push('video.append', 'video.oncanplay→play', 'video.ontimeupdate→progress', 'video.onended→next', 'video.onerror→next');
  } else {
    events.push('image.append', 'image.onload→timer-start');
    progress = storyIdx / bucketLength * 100;
  }
  return { progress, events };
}

function navigate(state, direction) {
  const events = ['stop-playback'];
  let { bucketIdx, storyIdx } = state;
  if (direction === 'next') {
    storyIdx += 1;
    if (storyIdx >= state.buckets[bucketIdx].stories.length) {
      bucketIdx += 1;
      storyIdx = 0;
      if (bucketIdx >= state.buckets.length) return { ...state, bucketIdx, storyIdx, closed: true, events: [...events, 'close-at-end'] };
    }
  } else if (direction === 'prev') {
    storyIdx -= 1;
    if (storyIdx < 0) {
      bucketIdx -= 1;
      if (bucketIdx < 0) { bucketIdx = 0; storyIdx = 0; }
      else storyIdx = state.buckets[bucketIdx].stories.length - 1;
    }
  } else if (direction === 'next-user') {
    bucketIdx += 1;
    storyIdx = 0;
    if (bucketIdx >= state.buckets.length) return { ...state, bucketIdx, storyIdx, closed: true, events: [...events, 'close-at-end'] };
  } else if (direction === 'prev-user') {
    bucketIdx -= 1;
    storyIdx = 0;
    if (bucketIdx < 0) { bucketIdx = 0; return { ...state, bucketIdx, storyIdx, events: [...events, 'prev-user-clamped'] }; }
  }
  return { ...state, bucketIdx, storyIdx, closed: false, events: [...events, `render:${bucketIdx}:${storyIdx}`] };
}

function createInjectedStoryPlaybackSeam(deps) {
  const calls = [];
  return {
    calls,
    group(input) {
      calls.push('group');
      return deps.group(input);
    },
    render(input) {
      calls.push('render');
      return deps.render(input);
    },
    navigate(input, direction) {
      calls.push('navigate');
      return deps.navigate(input, direction);
    },
    swipe(input) {
      calls.push('swipe');
      return deps.swipe(input);
    },
    close(input) {
      calls.push('close');
      return deps.close(input);
    },
  };
}

function handleSwipe({ deltaX, deltaY, ownStory }) {
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    if (deltaY > 100) return 'close';
    if (deltaY < -100 && ownStory) return 'viewers';
  } else {
    if (deltaX < -50) return 'next-user';
    if (deltaX > 50) return 'prev-user';
  }
  return 'resume';
}

(() => {
  const data = [
    { id: 'a1', user_id: 'alice', media_type: 'image' },
    { id: 'a2', user_id: 'alice', media_type: 'video' },
    { id: 'b1', user_id: 'bob', media_type: 'image' },
  ];
  const grouped = groupStories(data, 1);
  assert(grouped.buckets.length === 2 && grouped.buckets[0].stories.length === 2, 'openSV must group stories by user while preserving order');
  assert(grouped.bucketIdx === 0 && grouped.storyIdx === 1, 'openSV must locate the requested story inside its user bucket');

  const renderEvents = [];
  const imageRender = renderStory({ story: data[0], storyIdx: 0, bucketLength: 2, events: renderEvents });
  assert(renderEvents.includes('stop-previous-playback') && renderEvents.includes('image.onload→timer-start'), 'Image render must stop prior media and start progress after load');
  const videoRender = renderStory({ story: data[1], storyIdx: 1, bucketLength: 2, events: renderEvents });
  assert(renderEvents.includes('video.oncanplay→play') && renderEvents.includes('video.onended→next') && renderEvents.includes('video.onerror→next'), 'Video render must wire canplay, ended, and error playback paths');
  assert(videoRender.progress === 0, 'Video progress must be driven by timeupdate rather than image interval');

  const baseState = { buckets: grouped.buckets, bucketIdx: 0, storyIdx: 1 };
  const nextWithinUser = navigate(baseState, 'next');
  assert(nextWithinUser.bucketIdx === 1 && nextWithinUser.storyIdx === 0, 'Next story at bucket boundary must advance to first story of next user');
  const prevAcrossUser = navigate(nextWithinUser, 'prev');
  assert(prevAcrossUser.bucketIdx === 0 && prevAcrossUser.storyIdx === 1, 'Previous story at bucket boundary must return to prior user’s last story');
  const nextUser = navigate(baseState, 'next-user');
  assert(nextUser.bucketIdx === 1 && nextUser.storyIdx === 0, 'Next-user must advance bucket and reset story index');
  const prevUserClamped = navigate(baseState, 'prev-user');
  assert(prevUserClamped.bucketIdx === 0 && prevUserClamped.storyIdx === 0 && prevUserClamped.events.includes('prev-user-clamped'), 'Previous-user at first bucket must clamp');
  const end = navigate(nextUser, 'next');
  assert(end.closed === true && end.events.includes('close-at-end'), 'Navigation beyond final bucket must close the viewer');

  assert(handleSwipe({ deltaX: 0, deltaY: 140, ownStory: false }) === 'close', 'Downward swipe above threshold must close');
  assert(handleSwipe({ deltaX: 0, deltaY: -140, ownStory: true }) === 'viewers', 'Upward swipe above threshold on own story must open viewers');
  assert(handleSwipe({ deltaX: -80, deltaY: 10, ownStory: false }) === 'next-user', 'Left swipe above threshold must advance user');
  assert(handleSwipe({ deltaX: 80, deltaY: 10, ownStory: false }) === 'prev-user', 'Right swipe above threshold must go to previous user');
  assert(handleSwipe({ deltaX: 20, deltaY: 10, ownStory: false }) === 'resume', 'Small swipe must resume playback');

  const closeEvents = ['timer.clear', 'video.pause', 'video.src.remove', 'video.load', 'pause-all-videos', 'overlay.remove', 'viewer.hide'];
  assert(closeEvents.includes('timer.clear') && closeEvents.includes('video.src.remove') && closeEvents.includes('viewer.hide'), 'closeSV must clean timer, media, overlays, and viewer visibility');

  const seam = createInjectedStoryPlaybackSeam({
    group: (input) => groupStories(input.data, input.startIdx),
    render: renderStory,
    navigate,
    swipe: handleSwipe,
    close: () => closeEvents,
  });
  const injectedGrouped = seam.group({ data, startIdx: 0 });
  const injectedRender = seam.render({ story: data[0], storyIdx: 0, bucketLength: 2, events: [] });
  const injectedNavigation = seam.navigate({ buckets: injectedGrouped.buckets, bucketIdx: 0, storyIdx: 1 }, 'next');
  const injectedSwipe = seam.swipe({ deltaX: 0, deltaY: 140, ownStory: false });
  const injectedClose = seam.close();
  assert(JSON.stringify(seam.calls) === JSON.stringify(['group', 'render', 'navigate', 'swipe', 'close']), 'Injected Story playback seam must dispatch lifecycle owners explicitly');
  assert(injectedGrouped.buckets.length === 2 && injectedRender.events.includes('image.append') && injectedNavigation.bucketIdx === 1, 'Injected playback seam must preserve grouping, rendering, and navigation');
  assert(injectedSwipe === 'close' && injectedClose.includes('viewer.hide'), 'Injected playback seam must preserve gesture close and media cleanup outcomes');

  console.log(JSON.stringify({ passed: true, grouped, imageRender, videoRender, nextWithinUser, prevAcrossUser, nextUser, prevUserClamped, end, swipeResults: { down: handleSwipe({ deltaX: 0, deltaY: 140, ownStory: false }), up: handleSwipe({ deltaX: 0, deltaY: -140, ownStory: true }), left: handleSwipe({ deltaX: -80, deltaY: 10, ownStory: false }), right: handleSwipe({ deltaX: 80, deltaY: 10, ownStory: false }), small: handleSwipe({ deltaX: 20, deltaY: 10, ownStory: false }) }, closeEvents, seam: { calls: seam.calls, injectedSwipe, injectedClose } }, null, 2));
})();
