// Classic-script Notes reactor-list owner.
window.loadNoteReactorsList = async function(noteId){
  const{data:reactions} = await db.from('quick_note_reactions')
    .select('emoji,user_id,profiles(username,avatar_url)')
    .eq('note_id', noteId)
    .order('created_at',{ascending:false});

  const container = document.getElementById('note-reactors-list');
  if(!container) return;

  if(!reactions?.length){
    container.innerHTML = `<div style="text-align:center;color:#555;font-size:13px;padding:12px 0">Abhi koi reaction nahi hai</div>`;
    return;
  }

  container.innerHTML = `<div style="color:#555;font-size:11px;font-weight:700;letter-spacing:0.5px;margin-bottom:10px;text-align:center">${reactions.length} REACTION${reactions.length>1?'S':''}</div>` +
    reactions.map(r=>`
      <div onclick="closeNoteViewer();goToProfile('${r.user_id}')" style="display:flex;align-items:center;gap:12px;padding:8px 4px;cursor:pointer">
        ${av(r.profiles?.avatar_url, r.profiles?.username, 38)}
        <div style="flex:1;font-weight:600;font-size:13px;color:#fff">${r.profiles?.username||'User'}</div>
        <div style="font-size:22px">${r.emoji}</div>
      </div>`).join('');
}
