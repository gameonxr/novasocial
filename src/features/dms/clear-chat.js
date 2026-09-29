// clearChat — extracted from index.html
// Owner SHA-256: aeb106f94b285e218756894b81795519f6c7209154947989d71662ca2cbab2e5
// Classic script — exposes window.clearChat

window.clearChat = async function clearChat(cid) {
  if(!confirm('Clear all messages? This cannot be undone.')) return;
  await db.from('messages').delete().eq('conversation_id', cid);
  toast('Chat cleared');
  closeModal();
  loadMsgs(cid, window._curIsGrp);
};
