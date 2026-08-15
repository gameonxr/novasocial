/**
 * NovaSocial Universal AI Search feature.
 *
 * Extracted as a classic script while Nova Universe Hub and later Nova Ultra
 * features remain inline for independent guarded checkpoints.
 */
// ── UNIVERSAL AI SEARCH ──────────────────────────────────────
async function universalAISearch(query){
  const scr = document.getElementById('screen');
  scr.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  // Parse natural language query
  const q = query.toLowerCase();
  let filters = {type:'all', location:null, category:null};

  if(q.includes('gaming') || q.includes('game')) filters.category = 'gaming';
  if(q.includes('funny') || q.includes('comedy')) filters.category = 'funny';
  if(q.includes('food') || q.includes('recipe')) filters.category = 'food';
  if(q.includes('travel') || q.includes('trip')) filters.category = 'travel';
  if(q.includes('music') || q.includes('song')) filters.category = 'music';
  if(q.includes('fitness') || q.includes('workout')) filters.category = 'fitness';
  if(q.includes('tech') || q.includes('coding')) filters.category = 'tech';
  if(q.includes('art') || q.includes('design')) filters.category = 'art';

  if(q.includes('video') || q.includes('reel')) filters.type = 'video';
  if(q.includes('photo') || q.includes('image')) filters.type = 'image';
  if(q.includes('people') || q.includes('user') || q.includes('profile')) filters.type = 'people';

  // Extract location
  const locMatch = q.match(/from\s+(\w+)/);
  if(locMatch) filters.location = locMatch[1];

  try {
    let users = [], posts = [];

    if(filters.type !== 'video' && filters.type !== 'image'){
      const { data } = await db.from('profiles').select('id, username, avatar_url, full_name, bio, followers_count').ilike('bio', `%${query.substring(0,20)}%`).limit(10);
      users = data || [];
    }

    if(filters.type !== 'people'){
      let postsQuery = db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url,is_verified)').eq('is_archived', false);
      if(filters.type === 'video') postsQuery = postsQuery.eq('media_type','video');
      if(filters.type === 'image') postsQuery = postsQuery.eq('media_type','image');

      // Add category filter via caption
      if(filters.category){
        const categoryKeywords = {
          gaming: ['game','gaming','gamer','pubg','valorant','minecraft'],
          funny: ['funny','lol','meme','comedy','haha'],
          food: ['food','foodie','recipe','cooking','restaurant'],
          travel: ['travel','trip','wanderlust','explore','adventure'],
          music: ['music','song','singing','guitar','rap'],
          fitness: ['gym','fitness','workout','health','training'],
          tech: ['tech','code','coding','programming','ai','developer'],
          art: ['art','drawing','painting','sketch','design'],
        };
        const kws = categoryKeywords[filters.category] || [];
        // Just fetch top posts, we'll filter client-side
      }

      const { data } = await postsQuery.order('likes_count',{ascending:false}).limit(30);
      posts = data || [];

      // Client-side filter by category
      if(filters.category){
        const categoryKeywords = {
          gaming: ['game','gaming','gamer','pubg','valorant','minecraft','freefire'],
          funny: ['funny','lol','meme','comedy','haha','joke'],
          food: ['food','foodie','recipe','cooking','restaurant','tasty'],
          travel: ['travel','trip','wanderlust','explore','adventure','vacation'],
          music: ['music','song','singing','guitar','rap','musician'],
          fitness: ['gym','fitness','workout','health','training','muscle'],
          tech: ['tech','code','coding','programming','ai','developer','flutter','python'],
          art: ['art','drawing','painting','sketch','design','creative'],
        };
        const kws = categoryKeywords[filters.category] || [];
        posts = posts.filter(p => {
          const cap = (p.caption || '').toLowerCase();
          return kws.some(kw => cap.includes(kw));
        });
      }
    }

    // ── BIDIRECTIONAL BLOCK FILTER ──
    // Hide both users AND posts from users I blocked OR who blocked me.
    try {
      const blockedIds = await getBlockedBothWaysSet();
      users = (users || []).filter(u => !blockedIds.has(u.id));
      posts = (posts || []).filter(p => !blockedIds.has(p.user_id));
    } catch(e) {
      console.warn('AI search block-filter failed (non-critical):', e);
    }

    scr.innerHTML = `
      <div class="topbar">
        <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
        <div style="flex:1">
          <div class="sbar2">${ico('search','#666',18)}<input value="${query.replace(/"/g,'&quot;')}" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>
        </div>
      </div>

      <div style="padding:10px 16px;background:rgba(122,253,255,0.05);border-bottom:1px solid #1a1a1a;font-size:11px;color:#7afdff">
        🤖 AI Search • ${users.length} users + ${posts.length} posts found ${filters.category?`• Category: ${filters.category}`:''} ${filters.location?`• Location: ${filters.location}`:''}
      </div>

      ${users.length ? `
        <div style="padding:12px 16px;font-weight:700;font-size:12px;color:#666;letter-spacing:1px">PEOPLE (${users.length})</div>
        ${users.map(u=>`
          <div onclick="closeModal();showUserProfile('${u.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #0d0d0d;cursor:pointer">
            ${av(u.avatar_url, u.username, 46)}
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:5px"><span style="font-weight:700;font-size:14px">${u.username}</span>${u.is_verified?ico('verified','#3897f0',13):''}</div>
              <div style="color:#666;font-size:12px">${u.full_name||''} • ${fmt(u.followers_count||0)} followers</div>
              ${u.bio?`<div style="color:#888;font-size:11px;margin-top:2px">${u.bio.substring(0,60)}${u.bio.length>60?'...':''}</div>`:''}
            </div>
          </div>
        `).join('')}
      ` : ''}

      ${posts.length ? `
        <div style="padding:12px 16px;font-weight:700;font-size:12px;color:#666;letter-spacing:1px">POSTS (${posts.length})</div>
        <div class="egrid">
          ${posts.map(p=>`
            <div class="eitem" onclick="viewPost('${p.id}')">
              ${p.media_url?(p.media_type==='video'?(p.thumbnail_url?`<img src="${cldUrl(p.thumbnail_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy">`:`<video src="${p.media_url}" muted></video>`):`<img src="${cldUrl(p.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy">`):`<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">📷</div>`}
              ${p.media_type==='video'?`<div style="position:absolute;top:6px;right:6px">${ico('film','#fff',14)}</div>`:''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${!users.length && !posts.length ? `
        <div style="padding:60px 20px;text-align:center;color:#555">
          <div style="font-size:60px;margin-bottom:16px">🔍</div>
          <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:6px">Kuch nahi mila</div>
          <div style="font-size:13px">Try: "funny gaming videos" or "people interested in Flutter"</div>
        </div>
      ` : ''}

      <div style="height:80px"></div>
    `;
  } catch(e) {
    scr.innerHTML = `<div class="topbar"><div onclick="goBack()" style="cursor:pointer">${ico('back')}</div><span>Search</span></div><div style="padding:30px;text-align:center;color:#666">Search failed: ${e.message}</div>`;
  }
}
