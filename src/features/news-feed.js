// News Feed feature extracted from index.html.
// 📰 News Feed — shows trending posts as news
async function showNewsFeed(){
  const m = modal('📰 News Feed');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:40px;display:flex;justify-content:center"><div class="spin" style="width:28px;height:28px;border:3px solid rgba(0,229,255,0.2);border-top-color:#00E5FF;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>`;

  try {
    // Fetch trending posts (most liked in last 24h)
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { data: posts, error } = await db.from('posts')
      .select('id,caption,media_url,media_type,user_id,created_at,likes_count,comments_count,views_count,profiles!posts_user_id_fkey(username,avatar_url,is_verified)')
      .gt('created_at', yesterday)
      .order('likes_count', { ascending: false })
      .limit(20);

    if(error) throw error;

    if(!posts || posts.length === 0){
      body.innerHTML = `<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No trending news right now. Check back later!</div>`;
      return;
    }

    body.innerHTML = `<div style="padding:0">
      <div style="padding:14px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="font-weight:800;font-size:16px;color:#fff">📰 Trending Now</div>
        <div style="font-size:11px;color:#8A8A8A">Top posts from last 24 hours</div>
      </div>
      <div style="max-height:60vh;overflow-y:auto">
        ${posts.map((p, i) => {
          const prof = p.profiles || {};
          return `<div onclick="closeModal();viewPost('${p.id}')" style="display:flex;gap:12px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer">
            <div style="font-size:24px;font-weight:900;color:${i<3?'#FF2D7A':'#555'};min-width:30px">${i+1}</div>
            ${p.media_url ? `<img src="${p.media_url}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">` : ''}
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;color:#fff;font-weight:600;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${esc(p.caption || '[Media post]')}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                ${av(prof.avatar_url, prof.username, 16)}
                <span style="font-size:11px;color:#8A8A8A">@${esc(prof.username || 'unknown')}</span>
                ${prof.is_verified ? ico('verified','#3897f0',12) : ''}
                <span style="font-size:10px;color:#555;margin-left:auto">❤️ ${p.likes_count||0}</span>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  } catch(e) {
    body.innerHTML = `<div style="padding:30px;text-align:center;color:#FF2D7A;font-size:13px">Failed to load: ${e.message||'error'}</div>`;
  }
}
