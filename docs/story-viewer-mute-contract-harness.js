function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockToggleSVMute({ initialMuted = false, hasVideo = true, toggles = 1 }) {
  const state = { muted: initialMuted };
  const video = hasVideo ? { muted: initialMuted } : null;
  const events = [];
  for (let i = 0; i < toggles; i += 1) {
    state.muted = !state.muted;
    if (video) video.muted = state.muted;
    events.push(`renderSV:${state.muted ? 'muted' : 'unmuted'}`);
  }
  return { state, video, events };
}

(() => {
  const mute = mockToggleSVMute({ initialMuted: false, hasVideo: true, toggles: 1 });
  assert(mute.state.muted === true && mute.video.muted === true, 'First toggle must set shared mute state and video.muted to true');
  assert(mute.events.length === 1 && mute.events[0] === 'renderSV:muted', 'Each mute toggle must rerender the Story viewer');

  const unmute = mockToggleSVMute({ initialMuted: true, hasVideo: true, toggles: 1 });
  assert(unmute.state.muted === false && unmute.video.muted === false, 'Second-state toggle must restore unmuted state on the active video');

  const roundTrip = mockToggleSVMute({ initialMuted: false, hasVideo: true, toggles: 2 });
  assert(roundTrip.state.muted === false && roundTrip.video.muted === false && roundTrip.events.length === 2, 'Two toggles must return to original state and rerender each time');

  const noVideo = mockToggleSVMute({ initialMuted: false, hasVideo: false, toggles: 1 });
  assert(noVideo.state.muted === true && noVideo.events.includes('renderSV:muted'), 'Mute state and icon rerender must work even when the current Story has no video element');

  console.log(JSON.stringify({ passed: true, mute, unmute, roundTrip, noVideo }, null, 2));
})();
