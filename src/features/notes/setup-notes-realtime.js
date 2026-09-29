// Quick-note realtime subscription setup.
function setupNotesRealtime(){
  if(window._notesSub) db.removeChannel(window._notesSub);
  window._notesSub = db.channel('notes-realtime')
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'quick_notes'},()=>{
      if(curTab==='dms') loadNotesBar();
    }).subscribe();
}
