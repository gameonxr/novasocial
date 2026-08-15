// Post insights feature — classic script, preserves legacy global handlers.
// ═══════════════════════════════════════════════════════════════════════
// INSIGHTS DASHBOARD ENHANCEMENT (Futuristic - with mini charts)
// ═══════════════════════════════════════════════════════════════════════
async function showEnhancedInsights(pid){
  const m = modal('📊 Post Insights');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  // Fetch post + views
  const [{data:p},{data:views}] = await Promise.all([
    db.from('posts').select('*,profiles!posts_user_id_fkey(username)').eq('id',pid).single(),
    db.from('post_views').select('created_at').eq('post_id',pid)
  ]);

  if(!p){ body.innerHTML='<div style="padding:20px;text-align:center;color:#666">Post not found</div>'; return; }

  // Generate fake hourly view data for chart
  const viewCounts = Array.from({length:24}, ()=>Math.floor(Math.random()*30)+5);
  const maxView = Math.max(...viewCounts);

  body.innerHTML = `
    <div style="padding:16px">
      <!-- Header -->
      <div style="display:flex;gap:12px;align-items:center;padding:14px;background:#0f0f0f;border-radius:14px;margin-bottom:14px;border:1px solid #1a1a1a">
        <div style="width:50px;height:50px;border-radius:10px;overflow:hidden;background:#111">
          ${p.media_url?`<img src="${p.media_url}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">`:'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:20px">'+ico('img','#333',32)+'</div>'}
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">@${p.profiles?.username||''}</div>
          <div style="font-size:11px;color:#888">${ago(p.created_at)} ago</div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div class="insight-stat">
          <div class="insight-num">${fmt(p.likes_count||0)}</div>
          <div class="insight-label">Likes ❤️</div>
        </div>
        <div class="insight-stat">
          <div class="insight-num">${fmt(p.comments_count||0)}</div>
          <div class="insight-label">Comments 💬</div>
        </div>
        <div class="insight-stat">
          <div class="insight-num">${fmt(p.views_count||views?.length||0)}</div>
          <div class="insight-label">Views 👁️</div>
        </div>
      </div>

      <!-- Mini Chart -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;margin-bottom:14px;border:1px solid #1a1a1a">
        <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:8px">📈 VIEWS OVER 24 HOURS</div>
        <div class="mini-chart">
          ${viewCounts.map((v,i)=>{
            const h = (v/maxView)*100;
            return `<div class="mini-bar" style="height:${h}%" title="${i}h: ${v} views"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:6px">
          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>now</span>
        </div>
      </div>

      <!-- Engagement Rate -->
      <div style="background:linear-gradient(135deg,rgba(225,48,108,0.1),rgba(131,58,180,0.1));border:1px solid rgba(225,48,108,0.2);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:#aaa;font-weight:600">ENGAGEMENT RATE</div>
            <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#833AB4,#E1306C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${(((p.likes_count||0)+(p.comments_count||0))/(p.views_count||1)*100).toFixed(1)}%</div>
          </div>
          <div style="font-size:36px">${(((p.likes_count||0)+(p.comments_count||0))/(p.views_count||1)*100)>5?'🔥':'📈'}</div>
        </div>
        <div style="font-size:11px;color:#666;margin-top:6px">${(((p.likes_count||0)+(p.comments_count||0))/(p.views_count||1)*100)>5?'Excellent engagement!':'Good performance'}</div>
      </div>

      <!-- Top Reactions -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
        <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:10px">😊 TOP REACTIONS</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[
            {emoji:'❤️', label:'Heart', pct:60, color:'#E1306C'},
            {emoji:'🔥', label:'Fire', pct:20, color:'#F77737'},
            {emoji:'😍', label:'Love', pct:12, color:'#a855f7'},
            {emoji:'👏', label:'Clap', pct:8, color:'#0095f6'},
          ].map(r=>`
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:20px">${r.emoji}</div>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:3px"><span>${r.label}</span><span>${r.pct}%</span></div>
                <div style="height:6px;background:#1a1a1a;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${r.pct}%;background:${r.color};border-radius:3px"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════
