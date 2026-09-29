// startTypingWatcher — extracted from index.html
// Owner SHA-256: 23dc483a3e4d748921caddf478f4afc493f737a59196f42f8c2ba8278fc5cb31
// Classic script — exposes window.startTypingWatcher

window.startTypingWatcher = function startTypingWatcher(cid){
  const inp=document.getElementById('minp');
  if(inp){
    let typingTimer;
    let _isCurrentlyTyping = false; // Part 9 Fix 1: debounce flag — prevents setTyping(true) on every keystroke
    inp.addEventListener('input',()=>{
      // Part 9 Fix 1: Only fire setTyping(true) ONCE per typing burst (not per keystroke)
      if(!_isCurrentlyTyping){
        _isCurrentlyTyping = true;
        setTyping(cid,true);
      }
      // Always reset the stop-typing timer on every keystroke (stays as-is)
      clearTimeout(typingTimer);
      typingTimer=setTimeout(()=>{
        setTyping(cid,false);
        _isCurrentlyTyping = false; // Reset flag so next typing burst triggers a fresh setTyping(true)
      },1500);
    });
  }
  if(window.typingSub){ db.removeChannel(window.typingSub); }
  window.typingSub=db.channel('typing-'+cid).on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles'},(payload)=>{
    if(payload.new.id===ME.id) return;
    const box=document.getElementById('typing-indicator');
    if(!box) return;
          if(payload.new.typing_in===cid){
        box.style.display='block';
        box.innerHTML='<span style="color:#aaa">'+esc(payload.new.username)+' is typing <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
      }else{
      box.style.display='none';
    }
  }).subscribe();
};
