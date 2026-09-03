// loadNotesFeed — extracted from index.html
// Owner SHA-256: d945a0c2b9ce3b9fef2d980dcae7b574f22a394716f5a884e0267b3f8369dbb8
// Classic script — exposes window.loadNotesFeed

window.loadNotesFeed = async function loadNotesFeed(offset) {
  if (window._notesFeedLoading) return;
  window._notesFeedLoading = true;

  const container = document.getElementById('notes-feed-container');
  if (!container) { window._notesFeedLoading = false; return; }

  // Show loading indicator at bottom (if not first page)
  if (offset > 0) {
    const loader = document.createElement('div');
    loader.id = 'notes-feed-loader';
    loader.style.cssText = 'display:flex;justify-content:center;padding:20px';
    loader.innerHTML = '<div class="spin" style="width:22px;height:22px;border:2px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div>';
    container.appendChild(loader);
  }

  try {
    const PAGE_SIZE = 20;
    const { data: notes, error } = await db.from('quick_notes')
      .select('*,profiles(username,avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    // Remove loader
    const loader = document.getElementById('notes-feed-loader');
    if (loader) loader.remove();

    if (error) throw error;
    if (!notes || notes.length === 0) {
      window._notesFeedHasMore = false;
      if (offset === 0) {
        // Empty state — first page has nothing
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;text-align:center;padding:20px">
            <div style="font-size:52px">📝</div>
            <div style="font-weight:700;font-size:17px;color:#fff">No notes yet</div>
            <div style="font-size:14px;color:#666;max-width:280px">When people you follow share notes, they'll appear here. Follow more people to see their notes!</div>
          </div>`;
      }
      window._notesFeedLoading = false;
      return;
    }

    // Dedup: only newest note per user (seenUsers persists across pages)
    const seenUsers = window._notesFeedSeenUsers;
    const newNotes = notes.filter(n => {
      if (n.user_id === ME.id) return false; // skip own notes
      if (seenUsers.has(n.user_id)) return false;
      seenUsers.add(n.user_id);
      return true;
    });

    // Check if we've reached the end
    if (notes.length < PAGE_SIZE) {
      window._notesFeedHasMore = false;
    }
    window._notesFeedOffset = offset + notes.length;

    // If first page, replace loading spinner with content
    if (offset === 0) {
      container.innerHTML = '';
    }

    // Render note cards
    const notesHtml = newNotes.map(n => {
      const text = n.text || '';
      const musicIcon = n.music_title ? '<div style="display:flex;align-items:center;gap:4px;font-size:12px;color:#1DB954;margin-top:6px"><span>🎵</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(n.music_title) + '</span></div>' : '';
      return `
        <div onclick="viewNote('${n.id}')" style="display:flex;gap:14px;padding:16px;margin:0 12px 8px;background:#0c0c0c;border:1px solid rgba(255,255,255,0.04);border-radius:16px;cursor:pointer;transition:0.2s">
          ${av(n.profiles?.avatar_url, n.profiles?.username, 48, true)}
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:14px;color:#fff">${esc(n.profiles?.username) || 'User'}</div>
            <div style="font-size:14px;color:#ddd;margin-top:4px;overflow-wrap:break-word;word-break:break-word">${esc(text)}</div>
            ${musicIcon}
            <div style="font-size:11px;color:#555;margin-top:6px">${ago(n.created_at)}</div>
          </div>
        </div>`;
    }).join('');

    container.insertAdjacentHTML('beforeend', notesHtml);

    // If no new notes after dedup but there are more pages, auto-fetch next page
    if (newNotes.length === 0 && window._notesFeedHasMore) {
      window._notesFeedLoading = false;
      loadNotesFeed(window._notesFeedOffset);
      return;
    }

  } catch(e) {
    console.error('[NotesFeed] Load failed:', e);
    const loader = document.getElementById('notes-feed-loader');
    if (loader) loader.remove();
    if (offset === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Notes load nahi hue. Dobara try karo.</div>';
    }
  } finally {
    window._notesFeedLoading = false;
  }
};
