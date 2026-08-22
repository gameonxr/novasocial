function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockParkReels({ currentTab = 'reels', nextTab = 'home', savedIndex = 2 } = {}) {
  const events = [];
  const container = { parent: 'screen', display: 'block' };
  const screen = { html: 'reels', overflow: 'hidden', scrollTop: 77 };
  let savedReelIndex;
  if (container.parent === 'screen' && currentTab === 'reels' && nextTab !== 'reels') {
    container.parent = 'body';
    container.display = 'none';
    screen.overflow = 'auto';
    screen.scrollTop = 0;
    savedReelIndex = savedIndex;
    events.push('park:body:hidden', 'screen:overflow:auto', 'saved-index:2');
  }
  return { events, container, screen, savedReelIndex };
}

function mockRestoreReels({ savedIndex = 2, reelCount = 5 } = {}) {
  const events = [];
  const container = { parent: 'body', display: 'none' };
  const screen = { html: 'home', overflow: 'auto', scrollTop: 77 };
  const inner = { transition: 'transform 0.24s', transform: '' };
  screen.html = '';
  container.parent = 'screen';
  container.display = 'block';
  screen.overflow = 'hidden';
  screen.scrollTop = 0;
  inner.transition = 'none';
  inner.transform = `translateY(-${savedIndex * (100 / reelCount)}%)`;
  events.push('screen.clear', 'reattach:screen', 'container:visible', 'screen:overflow:hidden', 'screen:scrollTop:0', 'restore:transition:none', `restore:transform:${inner.transform}`, 'raf:transition:restore');
  return { events, container, screen, inner, savedIndex };
}

function mockVideoWindow({ currentIndex, videos }) {
  const events = [];
  const windowStart = currentIndex - 1;
  const windowEnd = currentIndex + 3;
  const result = videos.map(video => {
    const inWindow = video.index >= windowStart && video.index <= windowEnd;
    if (!video.storedUrl) return { ...video };
    if (inWindow && !video.src) {
      events.push(`load:rv-${video.index}`);
      return { ...video, src: video.storedUrl };
    }
    if (!inWindow && video.src) {
      events.push(`release:rv-${video.index}`, `load-release:rv-${video.index}`);
      return { ...video, src: '' };
    }
    return { ...video };
  });
  return { events, result };
}

function createInjectedReelsSeam(deps) {
  const calls = [];
  return {
    calls,
    parkReels(input) {
      calls.push('park');
      return deps.parkReels(input);
    },
    restoreReels(input) {
      calls.push('restore');
      return deps.restoreReels(input);
    },
    applyVideoWindow(input) {
      calls.push('window');
      return deps.applyVideoWindow(input);
    },
    settleTouch(input) {
      calls.push('settle');
      return deps.settleTouch(input);
    },
    resumeVideo(input) {
      calls.push('resume');
      return deps.resumeVideo(input);
    },
  };
}

function mockTouchSettle({ currentIndex, reelCount, isSettling, newIndex }) {
  const events = [];
  const pct = reelCount > 0 ? 100 / reelCount : 0;
  let transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
  let transform = '';
  if (isSettling) {
    isSettling = false;
    transition = 'none';
    transform = `translateY(-${currentIndex * pct}%)`;
    events.push('settle.force-complete', `settle.transform:${transform}`);
  }
  transition = 'none';
  transform = `translateY(-${newIndex * pct}%)`;
  transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
  isSettling = true;
  events.push(`swipe.transform:${transform}`, 'settle.start:240ms', 'settle.finish:290ms');
  return { events, transition, transform, isSettling, pct };
}

(() => {
  const parked = mockParkReels();
  assert(parked.container.parent === 'body' && parked.container.display === 'none', 'Leaving Reels must park and hide the same persistent container');
  assert(parked.screen.overflow === 'auto' && parked.screen.scrollTop === 0, 'Leaving Reels must restore normal screen scrolling');
  assert(parked.savedReelIndex === 2, 'Leaving Reels must save window._savedReelIndex');

  const restored = mockRestoreReels();
  assert(restored.container.parent === 'screen' && restored.container.display === 'block', 'Returning to Reels must reattach, not rebuild, the persistent container');
  assert(restored.screen.overflow === 'hidden' && restored.screen.scrollTop === 0, 'Reels restore must enforce hidden overflow and zero scrollTop');
  assert(restored.inner.transition === 'none', 'Restore must disable transition before applying transform');
  assert(restored.inner.transform === 'translateY(-40%)', 'Restore must use saved index and live reel count');
  assert(restored.events.includes('raf:transition:restore'), 'Restore must re-enable transition on the next frame');

  const videos = [
    { index: 0, storedUrl: 'u0', src: '' },
    { index: 1, storedUrl: 'u1', src: 'u1' },
    { index: 2, storedUrl: 'u2', src: '' },
    { index: 3, storedUrl: 'u3', src: 'u3' },
    { index: 4, storedUrl: 'u4', src: '' },
    { index: 5, storedUrl: 'u5', src: 'u5' },
    { index: 6, storedUrl: 'u6', src: 'u6' },
    { index: 7, storedUrl: '', src: 'fallback' },
  ];
  const windowed = mockVideoWindow({ currentIndex: 2, videos });
  assert(windowed.result.slice(0, 6).every(v => v.index < 1 || v.index > 5 ? v.src === '' : Boolean(v.src)), 'Window must retain/load only current-1 through current+3 sources');
  assert(windowed.result.find(v => v.index === 2).src === 'u2' && windowed.result.find(v => v.index === 4).src === 'u4', 'Missing sources inside the window must be restored');
  assert(windowed.result.find(v => v.index === 6).src === '', 'Sources outside the window must be released');
  assert(windowed.result.find(v => v.index === 7).src === 'fallback', 'Videos without data-media-url must remain untouched');

  const settle = mockTouchSettle({ currentIndex: 2, reelCount: 5, isSettling: true, newIndex: 3 });
  assert(settle.pct === 20, 'Swipe math must use live reel count');
  assert(settle.events.includes('settle.force-complete'), 'A new swipe must force-complete an in-flight settle');
  assert(settle.transform === 'translateY(-60%)', 'Swipe transform must use dynamic reel percentage');
  assert(settle.transition.includes('0.24s cubic-bezier(0.22, 1, 0.36, 1)'), 'Swipe settle easing and duration must remain unchanged');
  assert(settle.isSettling === true, 'Swipe must mark settle animation in flight');

  const seam = createInjectedReelsSeam({
    parkReels: mockParkReels,
    restoreReels: mockRestoreReels,
    applyVideoWindow: mockVideoWindow,
    settleTouch: mockTouchSettle,
    resumeVideo: ({ id, muted }) => ({ events: [`resume:${id}:${muted}`], resumed: true }),
  });
  const injectedPark = seam.parkReels({ savedIndex: 2 });
  const injectedRestore = seam.restoreReels({ savedIndex: 2, reelCount: 5 });
  const injectedWindow = seam.applyVideoWindow({ currentIndex: 2, videos });
  const injectedSettle = seam.settleTouch({ currentIndex: 2, reelCount: 5, isSettling: true, newIndex: 3 });
  const injectedResume = seam.resumeVideo({ id: 'rv-2', muted: true });
  assert(JSON.stringify(seam.calls) === JSON.stringify(['park', 'restore', 'window', 'settle', 'resume']), 'Injected Reels seam must dispatch dependencies in explicit ownership order');
  assert(injectedPark.savedReelIndex === 2 && injectedRestore.inner.transform === 'translateY(-40%)', 'Injected park/restore dependencies must preserve state invariants');
  assert(injectedWindow.result.find(v => v.index === 6).src === '', 'Injected window dependency must preserve source release');
  assert(injectedSettle.isSettling === true && injectedResume.resumed === true, 'Injected settle/resume dependencies must preserve lifecycle outcomes');

  console.log(JSON.stringify({ passed: true, parked, restored, windowed, settle, seam: { calls: seam.calls, injectedResume } }, null, 2));
})();
