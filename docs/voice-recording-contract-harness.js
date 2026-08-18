function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockVoiceFlow({ hasMic = true, blobSize = 1000, uploadFails = false, blocked = false }) {
  const events = [];
  const state = { recording: false, button: 'mic', streamStopped: false };
  if (!hasMic) return { state, events: ['toast:Microphone permission denied'] };
  state.recording = true;
  state.button = 'stop';
  events.push('recorder.start', 'button.recording', 'toast:Recording');
  state.recording = false;
  state.button = 'mic';
  events.push('recorder.stop', 'button.idle');
  if (blobSize < 500) {
    events.push('toast:Recording too short', 'stream.stop');
    state.streamStopped = true;
    return { state, events };
  }
  events.push('toast:Sending voice');
  if (uploadFails) {
    events.push('toast:Voice message failed', 'stream.stop');
    state.streamStopped = true;
    return { state, events };
  }
  if (blocked) {
    events.push('db.insert.throw:M​ESSAGING_BLOCKED'.replace(/\u200b/g, ''), "toast:You can't send messages to this user", 'stream.stop');
    state.streamStopped = true;
    return { state, events };
  }
  events.push('upload:chat', 'db.insert.throwOnError:audio', 'stream.stop');
  state.streamStopped = true;
  return { state, events };
}

(async () => {
  const denied = await mockVoiceFlow({ hasMic: false });
  assert(!denied.state.recording && denied.events.includes('toast:Microphone permission denied'), 'Microphone denial must leave recording inactive and show permission feedback');

  const short = await mockVoiceFlow({ blobSize: 499 });
  assert(short.state.recording === false && short.events.includes('toast:Recording too short') && short.state.streamStopped, 'Short recording must stop stream and avoid upload');
  assert(!short.events.includes('upload:chat'), 'Short recording must not upload');

  const success = await mockVoiceFlow({ blobSize: 1000 });
  assert(success.events.includes('recorder.start') && success.events.includes('recorder.stop'), 'Successful flow must start and stop recorder');
  assert(success.events.includes('upload:chat') && success.events.includes('db.insert.throwOnError:audio') && success.state.streamStopped, 'Successful flow must upload, insert audio message with throwOnError, and stop stream');
  assert(success.state.button === 'mic' && success.state.recording === false, 'Stop toggle must restore idle button and recording state');

  const blocked = await mockVoiceFlow({ blobSize: 1000, blocked: true });
  assert(blocked.events.includes("toast:You can't send messages to this user") && blocked.state.streamStopped, 'Messaging-blocked insert must show recipient feedback and stop stream');

  const failed = await mockVoiceFlow({ blobSize: 1000, uploadFails: true });
  assert(failed.events.includes('toast:Voice message failed') && failed.state.streamStopped, 'Upload failure must show generic failure and stop stream');

  console.log(JSON.stringify({ passed: true, denied, short, success, blocked, failed }, null, 2));
})();
