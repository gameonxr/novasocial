window.reactToNote = function reactToNote(noteId, emoji, clickedEl){
  // 🚀 INSTANT feedback — turant, bina kisi wait ke
  document.querySelectorAll('.note-react-emoji').forEach(el=>el.style.background='transparent');
  if(clickedEl) clickedEl.style.background='rgba(225,48,108,0.25)';
  if(clickedEl){ clickedEl.style.transform='scale(1.3)'; setTimeout(()=>clickedEl.style.transform='scale(1)', 200); }
  try{ navigator.vibrate?.(15); }catch(e){}

  const burst = document.createElement('div');
  burst.textContent = emoji;
  burst.style.cssText = 'position:fixed;left:50%;top:50%;font-size:64px;z-index:999999;pointer-events:none;transform:translate(-50%,-50%) scale(0.2) rotate(-15deg);opacity:1;transition:transform 0.45s cubic-bezier(0.17,0.89,0.32,1.49),opacity 0.4s ease-out 0.25s';
  document.body.appendChild(burst);
  requestAnimationFrame(()=>{ burst.style.transform='translate(-50%,-50%) scale(1.5) rotate(0deg)'; burst.style.opacity='0'; });
  setTimeout(()=>burst.remove(), 700);

  toast(emoji+' Reaction sent');

  db.from('quick_note_reactions').upsert({note_id:noteId, user_id:ME.id, emoji},{onConflict:'note_id,user_id'})
    .then(({error})=>{
      if(error){ console.error('Reaction save failed:', error); toast('Reaction save nahi hua'); return; }
      // 🆕 LIVE UPDATE: notes-bar ka corner-badge turant refresh karo
      loadNotesBar();
    });
};
