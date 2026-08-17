// Note-composer UI renderer; note persistence and music helpers remain inline.
function openNoteCreator(){
  const m = modal(_myActiveNote ? 'Edit Note' : 'New Note');
  const body = m.querySelector('#mbody');

  window._noteVisibility = _myActiveNote?.visibility || 'followers';
  window._noteMusic = _myActiveNote?.music_title ? {title:_myActiveNote.music_title, artist:_myActiveNote.music_artist, artwork:_myActiveNote.music_artwork, previewUrl:_myActiveNote.music_preview_url, startSec:_myActiveNote.music_start_sec||0} : null;
  window._noteTextDraft = _myActiveNote?.text || '';

  body.innerHTML = `
    <div style="padding:22px 18px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;align-items:flex-start;gap:12px">
        ${av(PROF?.avatar_url,PROF?.username,48,true)}
        <div style="flex:1">
          <textarea id="note-text-inp" maxlength="60" rows="2" placeholder="Share a thought..." style="width:100%;background:transparent;border:none;color:#fff;font-size:17px;font-weight:500;outline:none;resize:none;line-height:1.4;font-family:inherit">${window._noteTextDraft.replace(/</g,'&lt;')}</textarea>
          <div style="text-align:right;color:#555;font-size:11px;margin-top:2px" id="note-char-count">${60-window._noteTextDraft.length} left</div>
        </div>
      </div>

      <div id="note-music-section"></div>

      <div>
        <div style="color:#555;font-size:10px;font-weight:600;margin-bottom:8px;letter-spacing:0.5px">VISIBLE TO</div>
        <div style="display:flex;gap:6px">
          ${[['everyone','Everyone'],['followers','Followers'],['close_friends','Close Friends']].map(([v,l])=>`<div onclick="selectNoteVisibility('${v}')" id="note-vis-${v}" style="padding:7px 12px;border-radius:10px;cursor:pointer;font-size:11px;font-weight:500;transition:all 0.15s;background:${window._noteVisibility===v?'rgba(255,255,255,0.12)':'transparent'};color:${window._noteVisibility===v?'#fff':'#666'};border:1px solid ${window._noteVisibility===v?'rgba(255,255,255,0.18)':'#1a1a1a'}">${l}</div>`).join('')}
        </div>
      </div>

      <button class="bgrd" onclick="submitNote()">${_myActiveNote?'Update Note':'Share Note'}</button>
      ${_myActiveNote?`<button class="bout" onclick="deleteMyNote()" style="border-color:#E1306C;color:#E1306C">Remove Note</button>`:''}
    </div>`;

  document.getElementById('note-text-inp')?.addEventListener('input', function(){
    window._noteTextDraft = this.value;
    document.getElementById('note-char-count').textContent = (60-this.value.length)+' left';
  });

  renderNoteMusicSection();
}
