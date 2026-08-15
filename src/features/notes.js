/**
 * NovaSocial Functional Notes feature.
 *
 * Extracted as a classic script so localStorage-backed myNotes and inline note
 * handlers remain window-global while Marketplace stays inline.
 */
// ── FUNCTIONAL NOTES ──────────────────────────────────────
try { myNotes = JSON.parse(localStorage.getItem('nova-notes') || '[]'); } catch(e) {}

// 📅 Add Calendar Event — functional
function addCalendarEvent(){
  const title = prompt('Event title:');
  if(!title || !title.trim()) return;
  const date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if(!date) return;
  const time = prompt('Time (HH:MM):', '12:00');

  try {
    const events = JSON.parse(localStorage.getItem('nova-calendar-events') || '[]');
    events.push({ id: Date.now(), title: title.trim(), date, time: time || '12:00', created_at: new Date().toISOString() });
    events.sort((a,b) => new Date(a.date+' '+a.time) - new Date(b.date+' '+b.time));
    localStorage.setItem('nova-calendar-events', JSON.stringify(events));
    toast('✅ Event added!');
    closeModal();
    setTimeout(() => showCalendar(), 300);
  } catch(e) {
    toast('❌ Failed to add event');
  }
}

function showNotes(){
  const m = modal('📝 Notes');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:15px">📝 My Notes</div>
          <div style="font-size:11px;color:#666">${myNotes.length} notes saved</div>
        </div>
        <button onclick="createNote()" class="bgrd" style="padding:8px 14px;font-size:12px;width:auto;border-radius:10px">+ New</button>
      </div>

      ${myNotes.length === 0 ? `
        <div style="padding:40px 20px;text-align:center;color:#666">
          <div style="font-size:48px;margin-bottom:12px">📝</div>
          <div style="font-weight:700;color:#fff;margin-bottom:6px">No notes yet</div>
          <div style="font-size:12px;margin-bottom:14px">Personal notes, ideas, todos — sab kuch yahan</div>
          <button onclick="createNote()" class="bgrd" style="padding:10px 24px">Create Note</button>
        </div>
      ` : `
        ${myNotes.map((n,i) => `
          <div onclick="editNote(${i})" style="padding:14px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a;border-left:3px solid ${n.color || '#E1306C'}">
            <div style="font-weight:600;font-size:13px;color:#fff;margin-bottom:4px">${n.title}</div>
            <div style="font-size:12px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.content}</div>
            <div style="font-size:10px;color:#666;margin-top:6px">${new Date(n.date).toLocaleString('en-IN')}</div>
          </div>
        `).join('')}
      `}
    </div>
  `;
}

function createNote(){
  const m = modal('📝 New Note');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <input id="note-title" class="inp" placeholder="Note title...">
      <textarea id="note-content" class="inp" rows="6" placeholder="Write your note..." style="resize:none;line-height:1.6"></textarea>
      <div style="display:flex;gap:8px">
        ${['#E1306C','#0095f6','#3db83d','#f7931e','#a855f7'].map(c => `<div onclick="document.querySelectorAll('.note-color').forEach(d=>d.style.outline='none');this.style.outline='2px solid #fff';window._noteColor='${c}'" class="note-color" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;outline:none"></div>`).join('')}
      </div>
      <button class="bgrd" onclick="saveNote()" style="padding:14px">💾 Save Note</button>
    </div>
  `;
  window._noteColor = '#E1306C';
}

function saveNote(){
  const title = document.getElementById('note-title')?.value.trim();
  const content = document.getElementById('note-content')?.value.trim();
  if(!title || !content){
    toast('Title aur content dono chahiye');
    return;
  }
  myNotes.unshift({
    title, content,
    color: window._noteColor || '#E1306C',
    date: new Date().toISOString()
  });
  try { localStorage.setItem('nova-notes', JSON.stringify(myNotes)); } catch(e) {}
  toast('📝 Note saved!');
  closeModal();
  showNotes();
}

function editNote(idx){
  const n = myNotes[idx];
  if(!n) return;
  const action = confirm(`Note: ${n.title}\n\nOK = Edit\nCancel = Delete`);
  if(action){
    // Edit
    const newTitle = prompt('Title:', n.title);
    if(newTitle !== null){
      const newContent = prompt('Content:', n.content);
      if(newContent !== null){
        n.title = newTitle;
        n.content = newContent;
        n.date = new Date().toISOString();
        try { localStorage.setItem('nova-notes', JSON.stringify(myNotes)); } catch(e) {}
        toast('📝 Note updated!');
        closeModal();
        showNotes();
      }
    }
  } else {
    // Delete
    myNotes.splice(idx, 1);
    try { localStorage.setItem('nova-notes', JSON.stringify(myNotes)); } catch(e) {}
    toast('🗑️ Note deleted');
    closeModal();
    showNotes();
  }
}
