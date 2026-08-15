/**
 * NovaSocial Memories feature.
 *
 * Extracted as a classic script; AI Journal and later Nova Ultra features
 * remain inline until their own guarded checkpoints.
 */
// ── MEMORIES (1 year ago) ──────────────────────────────────────
async function showMemories(){
  const scr = document.getElementById('screen');
  scr.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoEnd = new Date(oneYearAgo);
    oneYearAgoEnd.setDate(oneYearAgoEnd.getDate() + 7);

    const { data: memories } = await db.from('posts')
      .select('*,profiles!posts_user_id_fkey(username,avatar_url)')
      .eq('user_id', ME.id)
      .gte('created_at', oneYearAgo.toISOString())
      .lt('created_at', oneYearAgoEnd.toISOString())
      .order('created_at', {ascending:false})
      .limit(10);

    // Also check this week last year
    const thisWeekLastYear = (memories || []).filter(p => {
      const d = new Date(p.created_at);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    });

    scr.innerHTML = `
      <div class="topbar">
        <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
        <span style="font-weight:700;font-size:18px;flex:1">📸 Memories</span>
        <div onclick="showMoodTimeline()" style="cursor:pointer;font-size:12px;color:#7afdff">🎭 Mood</div>
      </div>

      <div style="padding:16px;background:linear-gradient(135deg,rgba(225,48,108,0.1),rgba(131,58,180,0.1));border-bottom:1px solid #1a1a1a">
        <div style="font-weight:800;font-size:16px;margin-bottom:4px">✨ On This Day</div>
        <div style="font-size:12px;color:#aaa">Purani yaadein taza karo — AI curated memories</div>
      </div>

      ${!memories?.length ? `
        <div style="padding:60px 20px;text-align:center;color:#555">
          <div style="font-size:60px;margin-bottom:16px">📸</div>
          <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:6px">Koi memory nahi</div>
          <div style="font-size:13px">Aaj ke din 1 saal pehle koi post nahi ki tumne. Kal wapas aana!</div>
        </div>
      ` : `
        <div style="padding:12px">
          ${memories.map(p=>`
            <div class="post fade" onclick="viewPost('${p.id}')" style="cursor:pointer">
              <div class="post-hdr">
                <div style="display:flex;align-items:center;gap:10px">
                  ${av(p.profiles?.avatar_url, p.profiles?.username, 36)}
                  <div>
                    <div style="font-weight:700;font-size:13px">@${p.profiles?.username||''}</div>
                    <div style="color:#888;font-size:11px">📅 ${new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
                  </div>
                </div>
                <div style="font-size:10px;background:linear-gradient(135deg,#833AB4,#E1306C);padding:4px 10px;border-radius:10px;color:#fff;font-weight:700">1 YEAR AGO</div>
              </div>
              ${p.media_url ? `<div style="aspect-ratio:1/1;background:#111;overflow:hidden">${p.media_type==='video'?(p.thumbnail_url?`<img src="${cldUrl(p.thumbnail_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">`:`<video src="${p.media_url}" style="width:100%;height:100%;object-fit:cover" muted></video>`):`<img src="${cldUrl(p.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">`}</div>` : ''}
              ${p.caption?`<div style="padding:12px 14px;font-size:13px;color:#ccc;line-height:1.5">${p.caption.substring(0,100)}${p.caption.length>100?'...':''}</div>`:''}
            </div>
          `).join('')}
        </div>
      `}

      <div style="padding:16px">
        <div style="background:rgba(122,253,255,0.05);border:1px solid rgba(122,253,255,0.15);border-radius:14px;padding:14px">
          <div style="font-weight:700;font-size:13px;color:#7afdff;margin-bottom:8px">🤖 AI Memory Timeline</div>
          <div style="font-size:12px;color:#aaa;line-height:1.6">AI tumhari har post ko organize karta hai. Mood, location, aur people ke hisaab se memories categorize hoti hain. Future me "Smart Memory Videos" bhi aayenge — AI tumhare saare photos combine karke short video banayega!</div>
        </div>
      </div>

      <div style="height:80px"></div>
    `;
  } catch(e) {
    scr.innerHTML = `<div class="topbar"><div onclick="goBack()" style="cursor:pointer">${ico('back')}</div><span style="font-weight:700">Memories</span></div><div style="padding:30px;text-align:center;color:#666">Memories load nahi ho payi. ${e.message}</div>`;
  }
}
