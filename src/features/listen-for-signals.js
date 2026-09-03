// listenForSignals — extracted from index.html
// Owner SHA-256: fee5c27d22331414b55e63672c477561dd9f3a41e55326b4663b446244953355
// Classic script — exposes window.listenForSignals

window.listenForSignals = function listenForSignals(callId) {
  if (_callState.signalSub) db.removeChannel(_callState.signalSub);
  _callState.signalSub = db.channel('call-signals-' + callId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals', filter: 'call_id=eq.' + callId },
      async (payload) => {
        if (payload.new.sender_id === ME.id) return;
        const { signal_type, signal_data } = payload.new; const peer = _callState.peer; if (!peer) return;
        try {
          const data = JSON.parse(signal_data);

          if (signal_type === 'offer') {
            await peer.setRemoteDescription(new RTCSessionDescription(data));
            // ── CRITICAL FIX: remoteDescription set hote hi pending ICE candidates process karo ──
            await _flushPendingIceCandidates(peer);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            await db.from('call_signals').insert({ call_id: callId, sender_id: ME.id, signal_type: 'answer', signal_data: JSON.stringify(answer) });
          }
          else if (signal_type === 'answer') {
            if (peer.signalingState === 'have-local-offer') {
              await peer.setRemoteDescription(new RTCSessionDescription(data));
              // ── CRITICAL FIX: yahan bhi flush karo ──
              await _flushPendingIceCandidates(peer);
            }
          }
          else if (signal_type === 'ice-candidate') {
            if (peer.remoteDescription) {
              await peer.addIceCandidate(new RTCIceCandidate(data));
            } else {
              if (!window._pendingIceCandidates) window._pendingIceCandidates = [];
              window._pendingIceCandidates.push(data);
              console.log('[CALL] ICE candidate queued (remoteDescription not ready yet)');
            }
          }
          else if (signal_type === 'end') { endCall(false); }
        } catch(e) { console.log('Signal processing error:', e.message); }
      }
    ).subscribe();
};
