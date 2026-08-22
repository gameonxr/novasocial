'use strict';

window.viewNote = async function(noteId){
  const{data:note} = await db.from('quick_notes').select('*,profiles(username,avatar_url)').eq('id',noteId).single();
  if(!note){ toast('Note expire ho chuki hai'); loadNotesBar(); return; }

  db.from('quick_note_views').upsert({note_id:noteId, viewer_id:ME.id},{onConflict:'note_id,viewer_id'}).then(()=>{});

  let viewCount = null;
  if(note.user_id === ME.id){
    const{count} = await db.from('quick_note_views').select('id',{count:'exact',head:true}).eq('note_id',noteId);
    viewCount = count;
  }

  const{data:myReaction} = await db.from('quick_note_reactions').select('emoji').eq('note_id',noteId).eq('user_id',ME.id).maybeSingle();
  const isOwnNote = note.user_id === ME.id;

  const overlay = document.createElement('div');
  overlay.className = 'mbg';
  overlay.id = 'note-view-overlay';
  overlay.innerHTML = `
    <div style="position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;background:radial-gradient(ellipse at center, #1a1a2e 0%, #000 100%)">
      <div onclick="closeNoteViewer()" style="position:absolute;top:20px;right:20px;cursor:pointer;padding:8px">${ico('close','#fff',22)}</div>

      <div onclick="closeNoteViewer();goToProfile('${note.user_id}')" style="cursor:pointer;margin-bottom:18px">
        ${av(note.profiles?.avatar_url,note.profiles?.username,80,true)}
      </div>
      <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:4px">${note.profiles?.username}</div>
      <div style="color:#777;font-size:12px;margin-bottom:20px">${ago(note.created_at)}${viewCount!==null?' · '+viewCount+' views':''}</div>

      ${note.text ? `<div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);padding:20px 24px;border-radius:24px;max-width:300px;text-align:center;font-size:18px;font-weight:600;color:#fff;line-height:1.4;box-shadow:0 8px 32px rgba(0,0,0,0.4);margin-bottom:16px">
        ${note.text}
      </div>` : ''}

      ${note.music_title ? `<div onclick='toggleNoteMusicManual(${JSON.stringify(note.music_preview_url||'')},${note.music_start_sec||0})' id="note-music-chip" class="note-music-chip-playing" style="display:flex;align-items:center;gap:10px;background:rgba(29,185,84,0.12);border:1px solid rgba(29,185,84,0.25);padding:8px 16px;border-radius:20px;margin-bottom:20px;cursor:pointer">
        ${note.music_artwork?`<img src="${note.music_artwork}" style="width:26px;height:26px;border-radius:6px">`:'🎵'}
        <div style="text-align:left;flex:1"><div style="font-weight:700;font-size:12px;color:#fff">${note.music_title}</div><div style="font-size:10px;color:#999">${note.music_artist||''}</div></div>
        <svg id="note-music-play-icon" width="18" height="18" viewBox="0 0 24 24" fill="#3db83d"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>` : '<div style="height:12px"></div>'}

      ${isOwnNote ? `<div id="note-reactors-list" style="width:100%;max-width:320px;margin-bottom:20px"></div>` : `
      <div style="display:flex;gap:12px;margin-bottom:24px;align-items:center">
        ${['❤️','😂','😮','🔥','👀'].map(e=>`<span onclick="reactToNote('${noteId}','${e}',this)" class="note-react-emoji" style="font-size:26px;cursor:pointer;padding:6px;border-radius:12px;transition:all 0.15s;${myReaction?.emoji===e?'background:rgba(225,48,108,0.25)':''}">${e}</span>`).join('')}
        <div onclick="openMoreEmojiPicker('${noteId}')" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      </div>`}

      ${!isOwnNote ? `
      <div style="width:100%;max-width:320px;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.08);border-radius:24px;padding:6px 6px 6px 18px">
        <input id="note-reply-inp" placeholder="Reply to note..." onkeydown="if(event.key==='Enter')sendNoteReply('${noteId}','${note.user_id}')" style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:14px">
        <div onclick="sendNoteReply('${noteId}','${note.user_id}')" style="width:36px;height:36px;border-radius:50%;background:${GRAD};display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${ico('send','#fff',16)}</div>
      </div>` : `
      <div style="display:flex;gap:20px;align-items:center">
        <div onclick="closeNoteViewer();refreshAndOpenNoteCreator()" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>
          </div>
          <span style="font-size:11px;color:#999">Edit</span>
        </div>
        <div onclick="removeMyNoteFromViewer('${noteId}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(225,48,108,0.1);border:1px solid rgba(225,48,108,0.2);display:flex;align-items:center;justify-content:center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </div>
          <span style="font-size:11px;color:#E1306C">Remove</span>
        </div>
      </div>`}
    </div>`;
  overlay.onclick = e=>{ if(e.target===overlay) closeNoteViewer(); };
  document.body.appendChild(overlay);

  if(isOwnNote){
    loadNoteReactorsList(noteId);
  }

  // 🎵 Auto-play music jaise hi note khule (agar attached hai)
  if(note.music_preview_url){
  autoPlayNoteMusic(note.music_preview_url, note.music_start_sec||0);
  }
}

window.removeMyNoteFromViewer = async function(noteId){
  if(_noteViewAudio){ _noteViewAudio.pause(); _noteViewAudio=null; }
  try {
    // Fetch note to get music_artwork URL for cleanup
    const { data: note } = await db.from('quick_notes')
      .select('music_artwork')
      .eq('id', noteId)
      .maybeSingle();
    await db.from('quick_notes').delete().eq('id', noteId);
    if(note?.music_artwork && note.music_artwork.includes('cloudinary.com')) {
      await deleteMediaProduction(note.music_artwork, 'note', 'user_delete');
    }
    toast('Note removed');
  } catch(e) {
    console.error('Note remove error:', e);
    toast('❌ Note remove failed');
  }
  closeNoteViewer();
  loadNotesBar();
}
