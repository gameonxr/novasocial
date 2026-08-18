function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockMute({ action = 'mute', dbFails = false, hasButton = true }) {
  const events = [];
  const state = { label: action === 'mute' ? 'Mute User 🔇' : 'Unmute User 🔊', onclick: action === 'mute' ? 'mute' : 'unmute' };
  if (dbFails) {
    events.push(`db.${action}.throwOnError.failed`, 'toast:Could not update mute');
    return { events, state, changed: false };
  }
  events.push(`db.${action}.throwOnError`);
  if (action === 'mute') events.push('toast:User muted');
  else events.push('toast:User unmuted');
  if (hasButton) {
    state.label = action === 'mute' ? 'Unmute User 🔊' : 'Mute User 🔇';
    state.onclick = action === 'mute' ? 'unmute' : 'mute';
    events.push(`button.${state.onclick}`);
  }
  return { events, state, changed: true };
}

(async () => {
  const muted = await mockMute({ action: 'mute' });
  const unmuted = await mockMute({ action: 'unmute' });
  const muteFailed = await mockMute({ action: 'mute', dbFails: true });
  const unmuteFailed = await mockMute({ action: 'unmute', dbFails: true });
  const noButton = await mockMute({ action: 'mute', hasButton: false });

  assert(muted.changed && muted.events.includes('db.mute.throwOnError') && muted.state.label === 'Unmute User 🔊' && muted.state.onclick === 'unmute', 'Successful mute must use throwOnError and switch button to unmute');
  assert(unmuted.changed && unmuted.events.includes('db.unmute.throwOnError') && unmuted.state.label === 'Mute User 🔇' && unmuted.state.onclick === 'mute', 'Successful unmute must use throwOnError and switch button to mute');
  assert(!muteFailed.changed && muteFailed.state.label === 'Mute User 🔇' && muteFailed.state.onclick === 'mute', 'Mute failure must preserve button state and show failure feedback');
  assert(!unmuteFailed.changed && unmuteFailed.state.label === 'Unmute User 🔊' && unmuteFailed.state.onclick === 'unmute', 'Unmute failure must preserve button state and show failure feedback');
  assert(noButton.changed && noButton.events.includes('toast:User muted') && !noButton.events.includes('button.unmute'), 'Mute must still succeed when no button element exists');

  console.log(JSON.stringify({ passed: true, muted, unmuted, muteFailed, unmuteFailed, noButton }, null, 2));
})();
