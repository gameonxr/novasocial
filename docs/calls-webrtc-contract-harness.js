function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function flushPendingIceCandidates(state, peer) {
  if (!state.pending.length) return;
  const candidates = [...state.pending];
  state.pending = [];
  for (const candidate of candidates) {
    try {
      await peer.addIceCandidate(candidate);
      state.events.push(`ice.add:${candidate.id}`);
    } catch (error) {
      state.events.push(`ice.error:${candidate.id}`);
    }
  }
}

function createMockPeer(state) {
  return {
    signalingState: 'stable',
    remoteDescription: null,
    connectionState: 'new',
    tracks: [],
    addedCandidates: [],
    closed: false,
    addTrack(track) { this.tracks.push(track); state.events.push(`track.add:${track}`); },
    async setRemoteDescription(description) { this.remoteDescription = description; this.signalingState = description.type === 'offer' ? 'have-remote-offer' : 'stable'; state.events.push(`remote:${description.type}`); },
    async createAnswer() { state.events.push('answer.create'); return { type: 'answer', sdp: 'answer-sdp' }; },
    async setLocalDescription(description) { this.signalingState = description.type === 'offer' ? 'have-local-offer' : 'stable'; state.events.push(`local:${description.type}`); },
    async addIceCandidate(candidate) { if (candidate.fail) throw new Error('candidate failed'); this.addedCandidates.push(candidate); },
    close() { this.closed = true; state.events.push('peer.close'); },
  };
}

function createPeerConnectionMock(state) {
  const peer = createMockPeer(state);
  state.peer = peer;
  state.pending = [];
  state.events.push('peer.create');
  for (const track of state.localTracks) peer.addTrack(track);
  peer.onicecandidate = async event => {
    if (!event.candidate) return;
    state.events.push(`ice.signal:${event.candidate.id}`);
  };
  peer.ontrack = event => {
    state.remoteStream = event.stream;
    state.events.push('remote-track.attach');
    state.events.push('call-timer.start');
    state.events.push('status:Connected');
  };
  peer.onconnectionstatechange = () => {
    if (peer.connectionState === 'connected') {
      state.reconnectTimeout = null;
      state.events.push('status:Connected');
    }
    if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
      state.events.push('status:Reconnecting');
      if (!state.reconnectTimeout) {
        state.reconnectTimeout = 'scheduled-8000';
        state.events.push('reconnect.schedule:8000');
      }
    }
    if (peer.connectionState === 'closed') state.events.push('end-call');
  };
  return peer;
}

async function handleSignal(state, peer, signal) {
  if (signal.senderId === state.meId || !peer) return;
  if (signal.type === 'offer') {
    await peer.setRemoteDescription(signal.data);
    await flushPendingIceCandidates(state, peer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    state.events.push('signal.answer');
  } else if (signal.type === 'answer') {
    if (peer.signalingState === 'have-local-offer') {
      await peer.setRemoteDescription(signal.data);
      await flushPendingIceCandidates(state, peer);
    }
  } else if (signal.type === 'ice-candidate') {
    if (peer.remoteDescription) {
      await peer.addIceCandidate(signal.data);
      state.events.push(`ice.add:${signal.data.id}`);
    } else {
      state.pending.push(signal.data);
      state.events.push(`ice.queue:${signal.data.id}`);
    }
  } else if (signal.type === 'end') {
    state.events.push('end-call:false');
  }
}

function createInjectedCallsSeam(deps) {
  const calls = [];
  return {
    calls,
    createPeer(state) {
      calls.push('peer-create');
      return deps.createPeer(state);
    },
    handleSignal(state, peer, signal) {
      calls.push(`signal:${signal.type}`);
      return deps.handleSignal(state, peer, signal);
    },
    end(state) {
      calls.push('end-call');
      return deps.end(state);
    },
  };
}

function endCall(state) {
  if (!state.active && !state.callId) return;
  if (state.timerInterval) { state.timerInterval = null; state.events.push('timer.clear'); }
  if (state.peer) { state.peer.close(); state.peer = null; }
  if (state.localTracks.length) { state.localTracks.forEach(track => state.events.push(`track.stop:${track}`)); state.localTracks = []; }
  if (state.signalSub) { state.signalSub = null; state.events.push('signal-channel.remove'); }
  if (state.statusSub) { state.statusSub = null; state.events.push('status-channel.remove'); }
  state.active = false;
  state.callId = null;
  state.remoteStream = null;
  state.pending = [];
  state.reconnectTimeout = null;
  state.events.push('call-screen.hide', 'ringtone.stop', 'network-monitor.stop');
}

(async () => {
  const state = {
    meId: 'me', active: true, callId: 'call-1', callType: 'video', localTracks: ['audio', 'video'],
    pending: [], remoteStream: null, peer: null, timerInterval: 'timer', reconnectTimeout: null,
    signalSub: 'signal-sub', statusSub: 'status-sub', events: [],
  };
  const peer = createPeerConnectionMock(state);
  assert(peer.tracks.length === 2 && state.events.includes('track.add:audio') && state.events.includes('track.add:video'), 'Peer must attach every local media track');

  await peer.onicecandidate({ candidate: { id: 'ice-local' } });
  assert(state.events.includes('ice.signal:ice-local'), 'Local ICE candidates must be signaled');
  await peer.onicecandidate({ candidate: null });
  assert(state.events.filter(event => event === 'ice.signal:ice-local').length === 1, 'Null ICE completion event must not be signaled');

  await handleSignal(state, peer, { senderId: 'remote', type: 'ice-candidate', data: { id: 'ice-early' } });
  assert(state.pending.length === 1 && state.events.includes('ice.queue:ice-early'), 'ICE before remote description must be queued');
  await handleSignal(state, peer, { senderId: 'remote', type: 'offer', data: { type: 'offer', sdp: 'offer-sdp' } });
  assert(peer.remoteDescription?.type === 'offer' && peer.addedCandidates[0].id === 'ice-early', 'Offer handling must set remote description then flush queued ICE');
  assert(state.events.includes('answer.create') && state.events.includes('signal.answer'), 'Offer handling must create, set, and signal an answer');

  peer.signalingState = 'have-local-offer';
  await handleSignal(state, peer, { senderId: 'remote', type: 'answer', data: { type: 'answer', sdp: 'answer-sdp' } });
  assert(peer.remoteDescription?.type === 'answer', 'Answer must be accepted only when local offer is pending');
  await handleSignal(state, peer, { senderId: 'me', type: 'ice-candidate', data: { id: 'ignored' } });
  assert(!state.events.includes('ice.queue:ignored') && !state.events.includes('ice.add:ignored'), 'Own signaling events must be ignored');

  peer.ontrack({ stream: 'remote-stream', track: { kind: 'audio' } });
  assert(state.remoteStream === 'remote-stream' && state.events.includes('call-timer.start') && state.events.includes('status:Connected'), 'Remote track must attach stream and mark call connected');
  peer.connectionState = 'failed'; peer.onconnectionstatechange();
  assert(state.events.includes('status:Reconnecting') && state.reconnectTimeout === 'scheduled-8000', 'Failed connection must enter reconnecting state and schedule 8-second timeout');
  peer.connectionState = 'connected'; peer.onconnectionstatechange();
  assert(state.reconnectTimeout === null, 'Connected state must clear reconnect timeout');

  endCall(state);
  assert(!state.active && state.callId === null && state.peer === null && state.remoteStream === null, 'endCall must reset call state');
  for (const event of ['timer.clear', 'peer.close', 'track.stop:audio', 'track.stop:video', 'signal-channel.remove', 'status-channel.remove', 'call-screen.hide', 'ringtone.stop', 'network-monitor.stop']) {
    assert(state.events.includes(event), `endCall cleanup missing: ${event}`);
  }

  const failedFlushState = { pending: [{ id: 'bad', fail: true }], events: [] };
  const failedFlushPeer = { async addIceCandidate() { throw new Error('bad candidate'); } };
  await flushPendingIceCandidates(failedFlushState, failedFlushPeer);
  assert(failedFlushState.pending.length === 0 && failedFlushState.events.includes('ice.error:bad'), 'ICE flush must drain queue even when a candidate fails');

  const seamState = {
    meId: 'me', active: true, callId: 'seam-call', callType: 'audio', localTracks: [],
    pending: [], remoteStream: null, peer: null, timerInterval: null, reconnectTimeout: null,
    signalSub: null, statusSub: null, events: [],
  };
  const seam = createInjectedCallsSeam({
    createPeer: createPeerConnectionMock,
    handleSignal,
    end: endCall,
  });
  const seamPeer = seam.createPeer(seamState);
  await seam.handleSignal(seamState, seamPeer, { senderId: 'me', type: 'ice-candidate', data: { id: 'ignored-seam' } });
  seam.end(seamState);
  assert(JSON.stringify(seam.calls) === JSON.stringify(['peer-create', 'signal:ice-candidate', 'end-call']), 'Injected Calls seam must dispatch peer, signal, and teardown owners explicitly');
  assert(seamState.active === false && seamState.callId === null, 'Injected teardown must preserve terminal call state');

  console.log(JSON.stringify({ passed: true, state, failedFlushState, seam: { calls: seam.calls, state: seamState } }, null, 2));
})();
