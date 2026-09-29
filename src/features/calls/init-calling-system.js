// initCallingSystem — extracted from index.html
// Owner SHA-256: 54171f61bc34ced59ccf024fb6fbc5bd6fe57ec7f059ce360fd7ff031370d894
// Classic script — exposes window.initCallingSystem

window.initCallingSystem = async function initCallingSystem() {
  if (!ME?.id) return;
  if (window._callIncomingSubscription) db.removeChannel(window._callIncomingSubscription);
  window._callIncomingSubscription = db
    .channel('incoming-calls-' + ME.id)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: 'callee_id=eq.' + ME.id },
      (payload) => { if (payload.new.status === 'ringing') handleIncomingCall(payload.new); }
    ).subscribe();
};
