// pinMsgFromEnc — extracted from index.html
// Owner SHA-256: 342db37e49d43404667c30b0e9821335c4c6dc4ef71ab97c96effe886cf5b351
// Classic script — exposes window.pinMsgFromEnc

window.pinMsgFromEnc = async function pinMsgFromEnc(id, encText) {
  const text = decodeURIComponent(encText || '');
  await db.from('conversations').update({pinned_message_id: id, pinned_message_text: text}).eq('id', window._curChatId);
  toast('Message pinned 📌');
  const pinBar=document.getElementById('pin-bar');
  if(pinBar){ pinBar.innerHTML='📌 ' + esc(text); pinBar.style.display='block'; } // XSS H8b: escape decoded pinned text (transport stays encodeURIComponent; DB keeps raw text)
  closeModal();
};
