/**
 * NovaSocial Explore and Search feature.
 *
 * Extracted as a classic script so discovery rendering and inline search
 * handlers remain window-global; Follow List/profile code stays inline.
 */
// ── EXPLORE ──────────────────────────────────────
async function renderExplore(){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  const scr=document.getElementById('screen');
  let posts = [];
  try {
    const res = await db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url)').eq('is_reel',false).order('likes_count',{ascending:false}).limit(30);
    if(res.error){
      console.error('Explore query error:', res.error);
      // Fallback without join
      const fb = await db.from('posts').select('*').eq('is_reel',false).order('likes_count',{ascending:false}).limit(30);
      if(!fb.error){
        const userIds = [...new Set((fb.data || []).map(p => p.user_id))];
        if(userIds.length){
          const { data: profData } = await db.from('profiles').select('id,username,avatar_url').in('id', userIds);
          const profMap = {};
          (profData || []).forEach(p => { profMap[p.id] = p; });
          posts = (fb.data || []).map(p => ({ ...p, profiles: profMap[p.user_id] || { username: 'user' } }));
        }
      }
    } else {
      posts = res.data || [];
    }
  } catch(e) { console.error('Explore error:', e); }

  // ── BIDIRECTIONAL BLOCK FILTER (was missing entirely) ──
  // Hide posts from users I blocked OR who blocked me — matches feed behavior.
  try {
    const blockedIds = await getBlockedBothWaysSet();
    posts = (posts || []).filter(p => !blockedIds.has(p.user_id));
  } catch(e) { console.warn('Explore block-filter failed (non-critical):', e); }

  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return; // extra safety
  scr.innerHTML=`
  <div class="topbar">
    <div class="sbar2">${ico('search','#666',18)}<input placeholder="Try: 'funny gaming videos from India'" id="sq" oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter')handleSmartSearch(this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>
    <div onclick="showTrendingPage()" style="cursor:pointer;font-size:22px;margin-left:10px" title="Trending">🔥</div>
  </div>

  <!-- AI Search Suggestions -->
  <div style="padding:8px 14px;background:rgba(122,253,255,0.05);border-bottom:1px solid #1a1a1a">
    <div style="font-size:10px;color:#7afdff;font-weight:700;margin-bottom:6px">🤖 AI SEARCH SUGGESTIONS:</div>
    <div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none">
      ${[
        'funny gaming videos',
        'people interested in Flutter',
        'food posts from India',
        'travel reels',
        'fitness motivation',
        'music covers'
      ].map(q=>`<div onclick="document.getElementById('sq').value='${q}';handleSmartSearch('${q}')" style="flex-shrink:0;padding:6px 12px;background:rgba(122,253,255,0.08);border:1px solid rgba(122,253,255,0.2);border-radius:14px;font-size:11px;color:#7afdff;cursor:pointer">${q}</div>`).join('')}
    </div>
  </div>

  <div class="pills" id="explore-pills">
    ${['All','People','Photos','Videos','Travel','Food','Art','Tech'].map((c,i)=>`<div class="pill" style="background:${i===0?'#fff':'#1a1a1a'};color:${i===0?'#000':'#777'}" onclick="exPill(this,'${c}')">${c}</div>`).join('')}
  </div>
  <div style="height:10px"></div>
  <div class="egrid" id="egrid">
    ${(posts||[]).map(p=>`
      <div class="eitem" onclick="viewPost('${p.id}')">
        ${p.media_url?(p.media_type==='video'?(p.thumbnail_url?`<img src="${cldUrl(p.thumbnail_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy">`:`<video src="${p.media_url}" muted></video>`):`<img src="${cldUrl(p.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy">`):`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:32px">📷</div>`}
        ${p.is_reel?`<div style="position:absolute;top:6px;right:6px">${ico('film','#fff',16)}</div>`:''}
      </div>`).join('')}
  </div>
  <div style="height:80px"></div>`;
}

function exPill(el,c){
  document.querySelectorAll('.pill').forEach(p=>{p.style.background='#1a1a1a';p.style.color='#777';});
  el.style.background='#fff';el.style.color='#000';
}

function onSearchInput(q){
  clearTimeout(searchDebounceT);
  if(!q.trim())return;
  searchDebounceT=setTimeout(()=>doSearch(q),350);
}

// Smart search — uses AI for natural language, regular search for short queries
function handleSmartSearch(q){
  if(!q.trim()) return;
  const words = q.trim().split(/\s+/);
  // If query has 3+ words OR contains natural language keywords, use AI search
  const naturalLangPatterns = ['funny','people interested','from india','videos about','posts about','gaming videos','fitness motivation','music covers','who like','who are'];
  const isNatural = words.length >= 3 || naturalLangPatterns.some(p => q.toLowerCase().includes(p));

  if(isNatural){
    universalAISearch(q);
  } else {
    doSearch(q);
  }
}

async function doSearch(q){
  if(!q.trim())return;
  const qq=q.trim();
  const[{data:users},{data:posts}]=await Promise.all([
    db.from('profiles').select('*').ilike('username',`%${qq}%`).limit(15),
    db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url)').ilike('caption',`%${qq}%`).limit(20)
  ]);

  // ── BIDIRECTIONAL BLOCK FILTER ──
  // Hide both users AND posts from users I blocked OR who blocked me.
  let filteredUsers = users || [];
  let filteredPosts = posts || [];
  try {
    const blockedIds = await getBlockedBothWaysSet();
    filteredUsers = filteredUsers.filter(u => !blockedIds.has(u.id));
    filteredPosts = filteredPosts.filter(p => !blockedIds.has(p.user_id));
  } catch(e) {
    console.warn('Search block-filter failed (non-critical):', e);
  }

  const g=document.getElementById('egrid');if(!g)return;
  let h='';
  if(filteredUsers?.length){
    h+=`<div style="grid-column:1/-1;padding:12px 16px;font-weight:700;font-size:12px;color:#666;letter-spacing:1px">PEOPLE (${filteredUsers.length})</div>`;
    h+=filteredUsers.map(u=>`<div style="grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #0d0d0d;cursor:pointer" onclick="showUserProfile('${u.id}')">
      ${av(u.avatar_url,u.username,46,false,isOnline(u.last_seen))}
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:5px"><span style="font-weight:700;font-size:14px">${u.username}</span>${u.is_verified?ico('verified','',13):''}</div>
        <div style="color:#666;font-size:13px">${u.full_name||''}</div>
      </div>
      ${ico('back','#444',18)}
    </div>`).join('');
  }
  if(filteredPosts?.length){
    h+=`<div style="grid-column:1/-1;padding:12px 16px;font-weight:700;font-size:12px;color:#666;letter-spacing:1px">POSTS (${filteredPosts.length})</div>`;
    h+=filteredPosts.map(p=>`<div class="eitem" onclick="viewPost('${p.id}')">${p.media_url?`<img src="${cldUrl(p.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy">`:'<div style="display:flex;align-items:center;justify-content:center;font-size:32px;width:100%;height:100%;color:#333">📷</div>'}</div>`).join('');
  }
  g.innerHTML=h||`<div style="grid-column:1/-1;text-align:center;padding:48px;color:#444">"${esc(qq)}" ke liye koi result nahi mila 😕</div>`;
}
