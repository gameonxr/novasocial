// Isolated chat input helpers extracted from index.html.
function toggleSendBtn(){
  const txt = document.getElementById('minp')?.value.trim();
  const cam = document.getElementById('cam-icon');
  const mic = document.getElementById('mic-btn');
  const send = document.getElementById('send-icon');
  const pill = document.querySelector('.chat-pill');

  if(!cam || !mic || !send || !pill) return;

  if(txt) {
    cam.classList.add('icon-hidden');
    mic.classList.add('icon-hidden');
    send.classList.remove('icon-hidden');
    pill.classList.add('expanded'); // Expand when typing
  } else {
    cam.classList.remove('icon-hidden');
    mic.classList.remove('icon-hidden');
    send.classList.add('icon-hidden');
    // Shrink only if not focused
    if(document.activeElement !== document.getElementById('minp')) pill.classList.remove('expanded');
  }
}

// Auto-grow Textarea
function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
  if(el.scrollHeight > 100) el.style.overflowY = 'auto';
  else el.style.overflowY = 'hidden';
}
