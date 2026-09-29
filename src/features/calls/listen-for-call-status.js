// listenForCallStatus — extracted from index.html
// Owner SHA-256: a66a59a6337d67b865f0a14f3e08bbe84b4721f27829a761dd4c0ab3a440cad4
// Classic script — exposes window.listenForCallStatus

window.listenForCallStatus = function listenForCallStatus(callId) {
  if (window._callStatusSub) db.removeChannel(window._callStatusSub);
  window._callStatusSub = db.channel('call-status-' + callId)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: 'id=eq.' + callId },
      (payload) => {
        console.log('%c[CALL] Status update received from DB: ' + payload.new.status, 'color:cyan;font-weight:bold');
        const status = payload.new.status;
        if (status === 'rejected') { toast(_callState.remoteUserName + ' ne call reject kiya'); endCall(false); }
        else if (status === 'missed') { toast('Call missed'); endCall(false); }
        else if (status === 'ended') { endCall(false); }
      }
    ).subscribe();
};
