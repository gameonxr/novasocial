// Notes Bar fetch/render helpers extracted from index.html.
// ═══════════════════════════════════════════════════════════════
// 📝 NOTES BAR — split into fetch + render for parallel loading
// (renderDMs() now fetches notes data in parallel with conversation list,
//  so the bar renders instantly alongside the chat list — no stagger.)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch + process all data needed for the DM notes bar.
 * Pure data function — does NOT touch the DOM.
 * Returns { myNote, othersNotes, myReactionsMap } ready for _renderNotesBarHtml().
 */
async function _fetchNotesBarData(){
  const{data:notes} = await db.from('quick_notes')
    .select('*,profiles(username,avatar_url)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at',{ascending:false})
    .limit(30);

  const{data:myNote} = await db.from('quick_notes').select('*').eq('user_id',ME.id).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
  _myActiveNote = myNote || null;

  // 📊 Fetch my reactions on all visible notes (for corner badges)
  const noteIds = (notes||[]).map(n=>n.id);
  let myReactionsMap = {};
  if(noteIds.length){
    const{data:myReacts} = await db.from('quick_note_reactions').select('note_id,emoji').eq('user_id',ME.id).in('note_id',noteIds);
    (myReacts||[]).forEach(r=>{ myReactionsMap[r.note_id]=r.emoji; });
  }

  // ── DM Notes Bar: Restrict to mutual follows (close_friends notes unaffected) ──
  // Fetch my followers (who follows me) + my following (who I follow) in parallel
  const [followersRes, followingRes] = await Promise.all([
    db.from('follows').select('follower_id').eq('following_id', ME.id),
    db.from('follows').select('following_id').eq('follower_id', ME.id)
  ]);
  const myFollowersSet = new Set((followersRes.data || []).map(f => f.follower_id));
  const myFollowingSet = new Set((followingRes.data || []).map(f => f.following_id));

  // Filter notes: keep if close_friends visibility OR mutual follow for everyone/followers
  const mutualFilteredNotes = (notes || []).filter(n => {
    if (n.user_id === ME.id) return false; // skip own (handled separately)
    if (n.visibility === 'close_friends') return true; // close_friends always shows
    // For 'everyone' and 'followers': require mutual follow
    return myFollowersSet.has(n.user_id) && myFollowingSet.has(n.user_id);
  });

  // 🔒 PERMANENT DEDUPE GUARD: per-user sirf sabse naya note rakho (query already created_at desc sorted)
  const seenUsers = new Set();
  const othersNotes = mutualFilteredNotes.filter(n=>{
    if(seenUsers.has(n.user_id)) return false; // is user ka pehle se ek note aa chuka
    seenUsers.add(n.user_id);
    return true;
  });

  return { myNote, othersNotes, myReactionsMap };
}

/**
 * Render the notes bar HTML using already-fetched data.
 * Pure DOM function — does NOT fetch anything.
 * @param {Object} notesData - { myNote, othersNotes, myReactionsMap } from _fetchNotesBarData()
 */
function _renderNotesBarHtml(notesData){
  const bar = document.getElementById('notes-bar');
  if(!bar) return;

  const { myNote, othersNotes, myReactionsMap } = notesData || {};
  // _myActiveNote is set globally by _fetchNotesBarData() — keep using it for consistency
  // with other places in the app that read it (e.g., openNoteCreator checks _myActiveNote).
  const activeNote = _myActiveNote || myNote;

  let html = `<div class="note-bubble-wrap" onclick="${activeNote ? `viewNote('${activeNote.id}')` : 'openNoteCreator()'}">
    <div class="note-bubble">
      ${av(PROF?.avatar_url,PROF?.username,58,true)}
      ${activeNote ? `<div class="note-text-pill">${(activeNote.text||'').slice(0,16)}</div>` : `<div class="note-add-plus">+</div>`}
      ${activeNote?.music_title ? `<div class="note-music-note">🎵</div>` : ''}
    </div>
    <span style="font-size:11px;color:#999;font-weight:500">${activeNote?'Your note':'Your note'}</span>
  </div>`;

  html += (othersNotes || []).map(n => `
    <div class="note-bubble-wrap" onclick="viewNote('${n.id}')">
      <div class="note-bubble">
        ${av(n.profiles?.avatar_url,n.profiles?.username,52,true)}
        <div class="note-text-pill">${(n.text||'').slice(0,18)}</div>
        ${n.music_title ? `<div class="note-music-note">🎵</div>` : ''}
        ${myReactionsMap[n.id] ? `<div style="position:absolute;bottom:-4px;left:-4px;background:#1a1a1a;border:2px solid #000;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px">${myReactionsMap[n.id]}</div>` : ''}
      </div>
      <span style="font-size:11px;color:#bbb">${n.profiles?.username||''}</span>
    </div>`).join('');

  bar.innerHTML = html;
}

/**
 * Thin wrapper — fetch then render. Kept for backward compat with other callers
 * (e.g., after creating/deleting a note, notes-realtime subscription, etc.) that
 * don't need parallelization.
 */
async function loadNotesBar(){
  const notesData = await _fetchNotesBarData();
  _renderNotesBarHtml(notesData);
}
