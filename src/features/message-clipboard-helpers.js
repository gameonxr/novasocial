// Isolated message clipboard helpers extracted from index.html.
async function copyMsg(id, text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Message copied! 📋');
  } catch(e) { toast('Could not copy'); }
}


function copyMsgFromEnc(encText) {
  const text = decodeURIComponent(encText || '');
  navigator.clipboard.writeText(text).then(() => toast('Message copied! 📋'));
  closeModal();
}
