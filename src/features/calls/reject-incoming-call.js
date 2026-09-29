// rejectIncomingCall — extracted from index.html
// Owner SHA-256: 06a934a7fd0b512088499fb9d3cc8e4370cf614063d5f71873e5d29ee736f226
// Classic script — exposes window.rejectIncomingCall

window.rejectIncomingCall = async function rejectIncomingCall(callId) {
  stopRingtone(); dismissIncomingCallBanner();
  if (window._incomingCallTimeout) clearTimeout(window._incomingCallTimeout);
  try { await db.from('calls').update({ status: 'rejected' }).eq('id', callId); } catch(e) {}
  toast('Call rejected');
};
