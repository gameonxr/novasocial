// showStoryViewers — extracted from index.html
// Owner SHA-256: acbd22025b22a97aa95d4703091f17425a6369ae30323bbf34048ff2ef13cf16
// Classic script — exposes window.showStoryViewers

window.showStoryViewers = async function showStoryViewers(storyId) {
  // Pause Story
  svIsPaused = true;
  clearInterval(svTimer);
  pauseAllVideos();

  // Create high priority premium modal
  const m = document.createElement('div');
  m.className = 'mbg';
  m.style.zIndex = '10000';
  m.style.background = 'rgba(0,0,0,0.6)';
  m.style.backdropFilter = 'blur(10px)';

  let sheetHtml = '<div class="msheet" style="max-height:75vh;overflow-y:auto;border-radius:24px 24px 0 0;">';
  sheetHtml += '<div class="mhdr" style="background:#1a1a1a;position:sticky;top:0;border-bottom:1px solid #222;">';
  sheetHtml += '<span style="font-weight:700;font-size:16px;color:#fff">Story Views</span>';
  sheetHtml += '<div onclick="this.closest(\'.mbg\').remove(); svIsPaused=false;" style="cursor:pointer;padding:4px">'+ico('close','#fff')+'</div>';
  sheetHtml += '</div>';
  sheetHtml += '<div id="sv-viewers-body" style="padding:8px 16px;background:#0d0d0d;min-height:200px;"></div>';
  sheetHtml += '</div>';

  m.innerHTML = sheetHtml;
  m.onclick = e => { if(e.target === m) { m.remove(); svIsPaused = false; } };
  document.body.appendChild(m);

  const body = m.querySelector('#sv-viewers-body');
  body.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';

  const { data } = await db.from('story_views').select('profiles!story_views_viewer_id_fkey(username, avatar_url, id)').eq('story_id', storyId);
  const viewers = (data || []).map(d => d.profiles).filter(Boolean);

  if(!viewers.length) {
    body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#555;font-size:14px;">No views yet.</div>';
    return;
  }

  body.innerHTML = viewers.map(u =>
    '<div onclick="closeSV(); this.closest(\'.mbg\').remove(); showUserProfile(\''+u.id+'\')" style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #111;cursor:pointer;transition:0.2s;">' +
    av(u.avatar_url, u.username, 44) +
    '<div style="flex:1"><div style="font-weight:600;font-size:15px;color:#fff">'+u.username+'</div></div>' +
    '<div style="color:#555;font-size:20px;">›</div>' +
    '</div>'
  ).join('');
};
