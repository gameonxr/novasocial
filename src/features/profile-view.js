// External profile view feature extracted from index.html.
// ── USER PROFILE VIEW ──────────────────────────────────────
async function showUserProfile(userId){
  _renderGeneration++; // 🛡️ Race condition fix
  if(userId===ME.id){go('profile');return;}

  // FIX: Show Instagram-style PREVIEW popup FIRST, not full profile
  showProfilePreview(userId);
}

// ── INSTAGRAM-STYLE PROFILE PREVIEW (small card before full profile) ──
async function showProfilePreview(userId){
  // Show loading popup
  const m = modal('');
  const body = m.querySelector('#mbody');
  body.style.padding = '0';
  body.innerHTML = `<div style="padding:30px;text-align:center"><div class="spin"></div></div>`;

  try {
    // ── BIDIRECTIONAL BLOCK CHECK (Instagram-style: no posts/counts/buttons if blocked either way) ──
    // Done BEFORE fetching profile so we don't waste a query when blocked — but we still
    // need the profile row for avatar/username, so the prof query happens below in both paths.
    let isBlockedEitherWay = false;
    try {
      const blockedSet = await getBlockedBothWaysSet();
      isBlockedEitherWay = blockedSet.has(userId);
    } catch(e) {}

    let prof = null, followCheck = null;

    if(isBlockedEitherWay) {
      // ── BLOCKED PATH: fetch ONLY minimal profile (avatar/username) — skip followCheck entirely ──
      try {
        const profRes = await db.from('profiles').select('username,avatar_url,full_name,is_verified,is_verified_plus,cover_url,profile_theme,last_seen').eq('id',userId).single();
        prof = profRes.data;
        if(profRes.error){ console.error('Profile query error (blocked path):', profRes.error); }
      } catch(e) { console.error('Profile fetch error (blocked path):', e); }
    } else {
      // ── NORMAL PATH: fetch full profile + followCheck (original behavior) ──
      try {
        const [profRes, followRes] = await Promise.all([
          db.from('profiles').select('*').eq('id',userId).single(),
          db.from('follows').select('id').eq('follower_id',ME.id).eq('following_id',userId).maybeSingle()
        ]);
        prof = profRes.data;
        followCheck = followRes.data;
        if(profRes.error){ console.error('Profile query error:', profRes.error); }
      } catch(e) { console.error('Profile fetch error:', e); }
    }

    if(!prof){
      body.innerHTML = `<div style="padding:30px;text-align:center;color:#666">User not found</div>`;
      return;
    }

    const online = isOnline(prof.last_seen);
    const themeIdx = prof.profile_theme || 0;
    const profileGrad = (typeof PROFILE_THEMES !== 'undefined' && PROFILE_THEMES[themeIdx]?.grad) || 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)';

    // ── COVER BACKGROUND for preview popup (agar available hai to use karo, else gradient) ──
    const previewCoverStyle = prof.cover_url
      ? `background:linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.85)),url('${prof.cover_url}');background-size:cover;background-position:center`
      : `background:linear-gradient(135deg,rgba(131,58,180,0.15),rgba(225,48,108,0.15))`;

    // ── BLOCKED-EITHER-WAY SHELL RENDER ──
    // Instagram never shows "you're blocked" text — just silently hides content/counts/buttons.
    // Avatar + name + username still visible. No Follow/Message, no Highlights, no stats,
    // no bio (could leak info). View Full Profile button still works (leads to same shell).
    if(isBlockedEitherWay) {
      body.innerHTML = `
        <!-- Preview Header with cover photo or gradient bg -->
        <div style="${previewCoverStyle};padding:20px 16px 14px;text-align:center">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div onclick="closeModal()" style="cursor:pointer;padding:4px">${ico('close','#888',22)}</div>
            <div style="font-weight:700;font-size:14px">Profile Preview</div>
            <div onclick="showUserProfileOptions('${userId}')" style="cursor:pointer;padding:4px">${ico('more_v','#888',22)}</div>
          </div>

          <!-- Avatar with theme ring -->
          <div style="display:inline-block;margin-bottom:10px">
            <div class="profile-theme-ring" style="background:${profileGrad};padding:3px;border-radius:50%">
              ${av(prof.avatar_url, prof.username, 80, false, false)}
            </div>
          </div>

          <!-- Name & username (kept visible — Instagram shows these) -->
          <div style="font-weight:800;font-size:17px;color:#fff;display:flex;align-items:center;justify-content:center;gap:5px">
            ${prof.full_name || prof.username}
            ${prof.is_verified?ico('verified','#3897f0',16):''}
            ${prof.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
          </div>
          <div style="color:#888;font-size:13px;margin-top:2px">@${prof.username}</div>
          <!-- No bio, no website, no last_seen — all hidden when blocked either way -->
        </div>

        <!-- Stats Row: replaced with em-dashes (Instagram shows nothing, but em-dash is visually cleaner than empty space) -->
        <div style="display:flex;padding:14px 0;border-bottom:1px solid #1a1a1a">
          <div style="flex:1;text-align:center">
            <div style="font-weight:800;font-size:16px;color:#444">—</div>
            <div style="font-size:11px;color:#444">Followers</div>
          </div>
          <div style="flex:1;text-align:center">
            <div style="font-weight:800;font-size:16px;color:#444">—</div>
            <div style="font-size:11px;color:#444">Following</div>
          </div>
          <div style="flex:1;text-align:center">
            <div style="font-weight:800;font-size:16px;color:#444">—</div>
            <div style="font-size:11px;color:#444">Posts</div>
          </div>
        </div>

        <!-- NO Follow/Message buttons when blocked either way -->
        <!-- NO Highlights section when blocked either way -->
        <!-- Share still allowed — it's just a profile link, doesn't leak blocked content -->
        <div style="display:flex;justify-content:space-around;padding:14px;border-bottom:1px solid #1a1a1a">
          <div onclick="closeModal();shareUserProfile('${userId}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:10px;flex:1">
            <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,45,122,0.1);display:flex;align-items:center;justify-content:center">${ico('share','#FF2D7A',18)}</div>
            <div style="font-size:10px;color:#888">Share</div>
          </div>
        </div>

        <!-- View Full Profile Button — still works, will lead to the same shell state in openFullProfile -->
        <div style="padding:14px">
          <button onclick="closeModal();openFullProfile('${userId}')" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
            ${ico('user','#fff',16)} View Full Profile
          </button>
        </div>

        <div style="height:8px"></div>
      `;
      return;  // skip the normal full-render path below
    }

    const isFollowing = !!followCheck;
    const safeBio = (prof.bio || '').replace(/</g,'&lt;').substring(0, 100);
    const safeWebsite = sanitizeUrl(prof.website);

    body.innerHTML = `
      <!-- Preview Header with cover photo or gradient bg -->
      <div style="${previewCoverStyle};padding:20px 16px 14px;text-align:center">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div onclick="closeModal()" style="cursor:pointer;padding:4px">${ico('close','#888',22)}</div>
          <div style="font-weight:700;font-size:14px">Profile Preview</div>
          <div onclick="showUserProfileOptions('${userId}')" style="cursor:pointer;padding:4px">${ico('more_v','#888',22)}</div>
        </div>

        <!-- Avatar with theme ring -->
        <div style="display:inline-block;margin-bottom:10px">
          <div class="profile-theme-ring" style="background:${profileGrad};padding:3px;border-radius:50%">
            ${av(prof.avatar_url, prof.username, 80, false, online)}
          </div>
        </div>

        <!-- Name & username -->
        <div style="font-weight:800;font-size:17px;color:#fff;display:flex;align-items:center;justify-content:center;gap:5px">
          ${prof.full_name || prof.username}
          ${prof.is_verified?ico('verified','#3897f0',16):''}
          ${prof.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
        </div>
        <div style="color:#888;font-size:13px;margin-top:2px">@${prof.username}</div>

        ${safeBio?`<div style="color:#ccc;font-size:13px;margin-top:10px;max-width:280px;margin-left:auto;margin-right:auto;line-height:1.5">${safeBio}${prof.bio?.length>100?'...':''}</div>`:''}

        ${safeWebsite?`<div style="color:#4a90d9;font-size:12px;margin-top:6px">${safeWebsite.replace(/^https?:\/\//,'')}</div>`:''}

        <div style="color:#666;font-size:11px;margin-top:6px">${online?'<span style="color:#3db83d">● Active now</span>':lastSeenText(prof.last_seen)}</div>
      </div>

      <!-- Stats Row -->
      <div style="display:flex;padding:14px 0;border-bottom:1px solid #1a1a1a">
        <div style="flex:1;text-align:center">
          <div style="font-weight:800;font-size:16px;color:#fff">${fmt(prof.followers_count||0)}</div>
          <div style="font-size:11px;color:#666">Followers</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="font-weight:800;font-size:16px;color:#fff">${fmt(prof.following_count||0)}</div>
          <div style="font-size:11px;color:#666">Following</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="font-weight:800;font-size:16px;color:#fff">${fmt(prof.posts_count||0)}</div>
          <div style="font-size:11px;color:#666">Posts</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:8px;padding:14px">
        <button id="follow-btn" class="${isFollowing?'bout':'bgrd'}" onclick="toggleFollowProfile('${userId}')" style="flex:1;padding:12px 0;font-size:14px;font-weight:700;border-radius:12px;letter-spacing:0.3px">${isFollowing?'Following':'Follow'}</button>
        <button class="bout" onclick="closeModal();startDM('${userId}')" style="flex:1;padding:12px 0;font-size:14px;font-weight:700;border-radius:12px;letter-spacing:0.3px">Message</button>
      </div>

      <!-- Quick Options (NO CALL - calls only in DM) -->
      <div style="display:flex;justify-content:space-around;padding:0 14px 14px;border-bottom:1px solid #1a1a1a">
        <div onclick="closeModal();showHighlights('${userId}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:10px;flex:1">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(247,147,46,0.1);display:flex;align-items:center;justify-content:center">${ico('star','#f7931e',20)}</div>
          <div style="font-size:10px;color:#888">Highlights</div>
        </div>
        <div onclick="closeModal();shareUserProfile('${userId}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:10px;flex:1">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,45,122,0.1);display:flex;align-items:center;justify-content:center">${ico('share','#FF2D7A',18)}</div>
          <div style="font-size:10px;color:#888">Share</div>
        </div>
      </div>

      <!-- View Full Profile Button -->
      <div style="padding:14px">
        <button onclick="closeModal();openFullProfile('${userId}')" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          ${ico('user','#fff',16)} View Full Profile
        </button>
      </div>

      <div style="height:8px"></div>
    `;
  } catch(e) {
    body.innerHTML = `<div style="padding:30px;text-align:center;color:#666">Error: ${e.message}</div>`;
  }
}

// Open full profile (after preview)
async function openFullProfile(userId){
  _renderGeneration++; // 🛡️ Race condition fix (full profile is also a render target)
  const myGeneration = _renderGeneration; // 🛡️ Capture generation for this call
  if(userId===ME.id){go('profile');return;}
  const scr=document.getElementById('screen');
  scr.style.overflow='auto';
  scr.innerHTML='<div class="ldiv"><div class="spin"></div></div>';

  let isBlocked = false;
  try { isBlocked = await getBlockedList().then(s => s.has(userId)); } catch(e) {}
  let isMuted = false;
  try {
    const { data: muteData } = await db.from('mutes').select('id').eq('muter_id', ME.id).eq('muted_id', userId).maybeSingle();
    isMuted = !!muteData;
  } catch(e) {}

  // ── BIDIRECTIONAL BLOCK CHECK (content gating) ──
  // isBlocked (above) is one-directional — drives the Block/Unblock BUTTON label only.
  // isBlockedEitherWay is bidirectional — gates whether we render the full profile or a shell.
  let isBlockedEitherWay = false;
  try {
    const blockedSet = await getBlockedBothWaysSet();
    isBlockedEitherWay = blockedSet.has(userId);
  } catch(e) {}

  // ── INSTAGRAM-STYLE SHELL PROFILE (when blocked either way) ──
  // Same visual structure as a normal profile (cover + avatar + name + stats row + tabs)
  // BUT with all interactive/content pieces stripped out — no real counts, no Follow/Message
  // button, no posts grid, no Highlights. Avatar + name + username still visible (Instagram
  // never reveals that a block exists — just silently shows an empty profile).
  // Skip posts/followCheck queries entirely to save bandwidth + avoid flashing real data.
  if(isBlockedEitherWay) {
    let gatedProf = null;
    try {
      const { data: gp } = await db.from('profiles').select('username,avatar_url,full_name,is_verified,is_verified_plus,cover_url,profile_theme,last_seen').eq('id', userId).single();
      gatedProf = gp;
    } catch(e) {}

    // 🛡️ Race condition guard
    if(myGeneration !== _renderGeneration) return;

    const themeIdx = gatedProf?.profile_theme || 0;
    const profileGrad = (typeof PROFILE_THEMES !== 'undefined' && PROFILE_THEMES[themeIdx]?.grad) || 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)';
    const otherUserCoverUrl = gatedProf?.cover_url || '';

    scr.innerHTML = `
      <!-- Cover Image Header (same structure as normal profile) -->
      <div style="position:relative;height:180px;overflow:hidden">
        ${otherUserCoverUrl
          ? `<img src="${cldUrl(otherUserCoverUrl, NOVA_MEDIA_CONFIG.cover.cloudTransform)}" style="width:100%;height:100%;object-fit:cover">`
          : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#0a0a0a,#1a0a2e,#16213e);display:flex;align-items:center;justify-content:center"><div style="font-size:40px;color:#222">${ico('img','#222',40)}</div></div>`
        }
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.05) 35%,rgba(0,0,0,0.55) 75%,rgba(0,0,0,0.9) 100%)"></div>

        <!-- Top bar overlay -->
        <div style="position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;z-index:5">
          <div onclick="goBack()" style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('back','#fff',18)}</div>
          <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);padding:6px 12px;border-radius:20px">
            <span style="font-weight:700;font-size:14px;color:#fff">${gatedProf?.username || 'User'}</span>
            ${gatedProf?.is_verified?`<span style="display:inline-flex;align-items:center;transform:translateY(1px)">${ico('verified','#3897f0',16)}</span>`:''}
          </div>
          <div onclick="showUserProfileOptions('${userId}')" style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('more_v','#fff',20)}</div>
        </div>
      </div>

      <!-- Profile Header - avatar + name only (no real stats) -->
      <div style="padding:16px 16px 10px;display:flex;align-items:center;gap:18px;margin-top:-40px;position:relative;z-index:3">
        <div class="profile-theme-ring" style="background:${profileGrad};border:3px solid #000;border-radius:50%;box-shadow:0 4px 16px rgba(0,0,0,0.4)">
          ${av(gatedProf?.avatar_url, gatedProf?.username || 'User', 82, false, false)}
        </div>
        <div style="display:flex;flex:1;justify-content:space-around;align-items:center">
          <div class="pstat"><div class="pstat-n" style="font-size:18px;color:#444">—</div><div class="pstat-l" style="font-size:11px;letter-spacing:0.3px">Posts</div></div>
          <div class="pstat"><div class="pstat-n" style="font-size:18px;color:#444">—</div><div class="pstat-l" style="font-size:11px;letter-spacing:0.3px">Followers</div></div>
          <div class="pstat"><div class="pstat-n" style="font-size:18px;color:#444">—</div><div class="pstat-l" style="font-size:11px;letter-spacing:0.3px">Following</div></div>
        </div>
      </div>

      <!-- Name + username -->
      <div style="padding:0 16px 12px">
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-weight:800;font-size:16px;color:#fff">${gatedProf?.full_name || gatedProf?.username || 'User'}</span>
          ${gatedProf?.is_verified?ico('verified','#3897f0',15):''}
          ${gatedProf?.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
        </div>
        <div style="color:#888;font-size:13px;margin-top:2px">@${gatedProf?.username || 'user'}</div>
        <!-- No bio, no website, no last_seen — all hidden when blocked either way -->
      </div>

      <!-- NO Follow/Message action buttons when blocked either way -->

      <!-- Empty tab bar (kept for visual structure — Instagram shows empty tabs) -->
      <div style="display:flex;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);margin-top:8px">
        <div style="flex:1;text-align:center;padding:12px;color:#666;font-size:12px;font-weight:600;letter-spacing:0.5px;border-bottom:1px solid #333">POSTS</div>
        <div style="flex:1;text-align:center;padding:12px;color:#666;font-size:12px;font-weight:600;letter-spacing:0.5px">REELS</div>
        <div style="flex:1;text-align:center;padding:12px;color:#666;font-size:12px;font-weight:600;letter-spacing:0.5px">TAGGED</div>
      </div>

      <!-- Empty posts grid (no posts fetched) -->
      <div style="padding:60px 20px;text-align:center;color:#444">
        <div style="font-size:40px;margin-bottom:12px;opacity:0.4">📷</div>
        <div style="font-size:13px;color:#555">No Posts</div>
      </div>
    `;
    return;  // skip the normal full-profile fetch + render path entirely
  }

  let prof=null, posts=null, followCheck=null;
  try {
    const [profRes, postsRes, followRes] = await Promise.all([
      db.from('profiles').select('*').eq('id',userId).single(),
      db.from('posts').select('*').eq('user_id',userId).eq('is_archived', false).order('created_at',{ascending:false}),
      db.from('follows').select('id').eq('follower_id',ME.id).eq('following_id',userId).maybeSingle()
    ]);
    prof = profRes.data;
    posts = postsRes.data;
    followCheck = followRes.data;
    if(profRes.error) console.error('Profile query error:', profRes.error);
    if(postsRes.error) console.error('Posts query error:', postsRes.error);
  } catch(e) { console.error('Profile/posts fetch error:', e); }

  // 📝 Check if this user has an active note (for profile ring)
  const profileActiveNote = await checkUserActiveNote(userId);

  if(!prof){scr.innerHTML='<div class="ldiv">User not found</div>';return;}
  const isFollowing=!!followCheck;
  const myPosts=(posts||[]).filter(p=>!p.is_reel);
  const myReels=(posts||[]).filter(p=>p.is_reel);
  const online=isOnline(prof.last_seen);
  const themeIdx = prof.profile_theme || 0;
  const profileGrad = (typeof PROFILE_THEMES !== 'undefined' && PROFILE_THEMES[themeIdx]?.grad) || 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)';
  const safeWebsite = sanitizeUrl(prof.website);

  const muteAction = isMuted ? `unmuteUser('${userId}',this)` : `muteUser('${userId}',this)`;
  const muteText = isMuted ? 'Unmute 🔊' : 'Mute 🔇';
  const blockAction = isBlocked ? `unblockUser('${userId}',this)` : `blockUser('${userId}',this)`;
  const blockText = isBlocked ? 'Unblock' : 'Block';

  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return;

  // ── COVER IMAGE (jo pehle missing thi — doosre users ke profile pe bhi cover dikhega) ──
  const otherUserCoverUrl = prof.cover_url || '';

  scr.innerHTML=`
  <!-- Cover Image Header -->
  <div style="position:relative;height:180px;overflow:hidden">
    ${otherUserCoverUrl
      ? `<img src="${cldUrl(otherUserCoverUrl, NOVA_MEDIA_CONFIG.cover.cloudTransform)}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#0a0a0a,#1a0a2e,#16213e);display:flex;align-items:center;justify-content:center"><div style="font-size:40px;color:#222">${ico('img','#222',40)}</div></div>`
    }
    <!-- Gradient overlay for contrast -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.05) 35%,rgba(0,0,0,0.55) 75%,rgba(0,0,0,0.9) 100%)"></div>

    <!-- Top bar overlay (transparent, floats over cover) -->
    <div style="position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;z-index:5">
      <div onclick="goBack()" style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('back','#fff',18)}</div>
      <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);padding:6px 12px;border-radius:20px">
        <span style="font-weight:700;font-size:14px;color:#fff">${prof.username}</span>
        ${prof.is_verified?`<span style="display:inline-flex;align-items:center;transform:translateY(1px)">${ico('verified','#3897f0',16)}</span>`:''}
        ${prof.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
      </div>
      <div onclick="showUserProfileOptions('${userId}')" style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('more_v','#fff',20)}</div>
    </div>
  </div>

  <!-- Profile Header - Premium styled (avatar overlaps cover like Instagram) -->
  <div style="padding:16px 16px 10px;display:flex;align-items:center;gap:18px;margin-top:-40px;position:relative;z-index:3">
    <div class="profile-theme-ring" style="background:${profileGrad};border:3px solid #000;border-radius:50%;box-shadow:0 4px 16px rgba(0,0,0,0.4)">
      ${profileActiveNote ? `<div style="position:relative;display:inline-block">
  <div onclick="viewNote('${profileActiveNote.id}')" style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#2a2a2a,#1c1c1c);color:#fff;font-size:10.5px;font-weight:700;padding:5px 11px;border-radius:12px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(0,0,0,0.4);cursor:pointer;z-index:5;animation:pillFadeIn 0.3s ease">
    ${profileActiveNote.text ? profileActiveNote.text.slice(0,16) : (profileActiveNote.music_title ? '🎵 '+profileActiveNote.music_title.slice(0,14) : '💭')}
  </div>
  ${av(prof.avatar_url,prof.username,82,false,online)}
</div>` : `<div onclick="viewAvatarFullscreen('${prof.avatar_url||''}','${prof.username}')" style="cursor:pointer">${av(prof.avatar_url,prof.username,82,false,online)}</div>`}
    </div>
    <div style="display:flex;flex:1;justify-content:space-around;align-items:center">
      ${[['Posts',myPosts.length,null],['Followers',fmt(prof.followers_count||0),'followers'],['Following',fmt(prof.following_count||0),'following']].map(([l,v,type])=>`<div class="pstat" ${type?`onclick="showFollowList('${userId}','${type}')" style="cursor:pointer"`:''}><div class="pstat-n" style="font-size:18px"${type==='followers'?` id="followers-count" data-raw="${prof.followers_count||0}"`:(type==='following'?` id="following-count" data-raw="${prof.following_count||0}"`:'')}>${v}</div><div class="pstat-l" style="font-size:11px;letter-spacing:0.3px">${l}</div></div>`).join('')}
    </div>
  </div>

  <!-- Bio Section - Premium styled -->
  <div style="padding:0 16px 14px">
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px">
      ${(prof.full_name && prof.full_name.trim() && prof.full_name.trim().toLowerCase() !== (prof.username||'').toLowerCase())
        ? `<div style="font-weight:700;font-size:15px;letter-spacing:0.2px">${prof.full_name}</div>`
        : ''}
      ${prof.is_verified?`<span style="display:inline-flex;align-items:center;transform:translateY(1px)">${ico('verified','#3897f0',17)}</span>`:''}
      ${prof.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
    </div>
    ${prof.bio?`<div style="color:#d4d4d4;font-size:13.5px;line-height:1.55;margin-top:4px">${linkify(prof.bio)}</div>`:''}
    ${safeWebsite?`<div onclick="window.open('${safeWebsite}','_blank')" style="color:#4a90d9;font-size:13px;margin-top:6px;display:flex;align-items:center;gap:5px;cursor:pointer;font-weight:500">${ico('link','#4a90d9',14)}${safeWebsite.replace(/^https?:\/\//,'')}</div>`:''}
    <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
      ${online?`<div style="color:#3db83d;font-size:11.5px;display:flex;align-items:center;gap:5px;font-weight:500"><span style="width:7px;height:7px;border-radius:50%;background:#3db83d;display:inline-block;box-shadow:0 0 6px rgba(61,184,61,0.6)"></span>Active now</div>`:`<div style="color:#666;font-size:11.5px;display:flex;align-items:center;gap:5px">${ico('clock','#666',12)}${lastSeenText(prof.last_seen)}</div>`}
    </div>
  </div>

  <!-- Primary Action Buttons (Follow + Message + Share only - NO CALL) -->
  <div style="display:flex;gap:8px;padding:0 16px 12px">
    <button id="follow-btn" class="${isFollowing?'bout':'bgrd'}" onclick="toggleFollowProfile('${userId}')" style="font-size:14px;padding:13px 0;flex:1;font-weight:700;border-radius:12px;letter-spacing:0.3px">${isFollowing?'Following':'Follow'}</button>
    <button class="bout" onclick="startDM('${userId}')" style="font-size:14px;padding:13px 0;flex:1;font-weight:700;border-radius:12px;letter-spacing:0.3px">Message</button>
    <button class="bout" onclick="shareUserProfile('${userId}')" style="font-size:14px;padding:13px 0;flex:1;font-weight:700;border-radius:12px;letter-spacing:0.3px">Share</button>
  </div>

  <!-- Story Highlights Placeholder -->
  <div style="display:flex;gap:14px;padding:8px 16px 14px;overflow-x:auto;scrollbar-width:none">
    <div onclick="showHighlights('${userId}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex-shrink:0">
      <div class="highlight-circle">
        <div style="font-size:24px;color:#555">+</div>
      </div>
      <div style="font-size:11px;color:#888">Highlights</div>
    </div>
  </div>

  <!-- Tabs -->
  <div style="display:flex;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;margin-bottom:2px">
    <div id="upt-posts" onclick="userProfileTab('posts','${userId}')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid #fff">${ico('grid','#fff',22)}</div>
    <div id="upt-reels" onclick="userProfileTab('reels','${userId}')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid transparent">${ico('film','#555',22)}</div>
    <div id="upt-tagged" onclick="userProfileTab('tagged','${userId}')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid transparent">
      ${ico('tag','#555',22)}
    </div>
  </div>

  <!-- Posts Grid -->
  <div class="pgrid" id="upgrid">
    ${!myPosts.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">📷</div>No posts yet</div>':myPosts.map(p=>'<div class="pitem" onclick="viewPost(\''+p.id+'\')">'+(p.media_url?'<img src="'+p.media_url+'" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.style.background=\'#0a0a0a\'">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">📷</div>')+'</div>').join('')}
  </div>

  <div style="height:80px"></div>`;

  // Store posts data for tab switching
  window._userProfilePosts = myPosts;
  window._userProfileReels = myReels;
}

// ── CONNECT OPTIONS SHEET (call icons moved here, off the main profile) ──
function showConnectOptions(userId){
  const m = modal('Connect');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:8px 0">
      <button onclick="closeModal();initiateCall('${userId}','','','audio')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('phone','#0095f6',20)} <span>📞 Audio Call</span>
      </button>
      <button onclick="closeModal();initiateCall('${userId}','','','video')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('video','#a855f7',20)} <span>📹 Video Call</span>
      </button>
      <button onclick="closeModal();startDM('${userId}')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('msg','#0095f6',20)} <span>💬 Send Message</span>
      </button>
      <button onclick="closeModal();shareUserProfile('${userId}')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('share','#E1306C',20)} <span>📤 Share Profile</span>
      </button>
      <button onclick="closeModal();toast('🎤 Voice messages — open a DM and hold the mic icon')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('mic','#f7931e',20)} <span>🎙️ Send Voice Message</span>
      </button>
      <button onclick="closeModal();showHighlights('${userId}')" class="bout" style="border:none;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;display:flex;align-items:center;gap:12px">
        ${ico('star','#f7931e',20)} <span>✨ View Highlights</span>
      </button>
      <button onclick="closeModal()" class="bout" style="border:none;border-radius:0;text-align:left;padding:14px 18px;width:100%;font-size:14px;color:#aaa;margin-top:6px">Cancel</button>
    </div>
  `;
}

function userProfileTab(tab, userId){
  const ptBtn = document.getElementById('upt-posts');
  const rtBtn = document.getElementById('upt-reels');
  const tgBtn = document.getElementById('upt-tagged');
  const grid = document.getElementById('upgrid');
  if(!ptBtn || !rtBtn || !tgBtn || !grid) return;

  // Reset all
  ptBtn.style.borderBottomColor='transparent';
  ptBtn.innerHTML=ico('grid','#555',22);
  rtBtn.style.borderBottomColor='transparent';
  rtBtn.innerHTML=ico('film','#555',22);
  tgBtn.style.borderBottomColor='transparent';
  tgBtn.innerHTML=ico('tag','#555',22);

  if(tab==='posts'){
    ptBtn.style.borderBottomColor='#fff';
    ptBtn.innerHTML=ico('grid','#fff',22);
    const p = window._userProfilePosts || [];
    grid.innerHTML = !p.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">📷</div>No posts yet</div>':p.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.style.background=\'#0a0a0a\'">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">📷</div>')+'</div>').join('');
  } else if(tab==='reels'){
    rtBtn.style.borderBottomColor='#fff';
    rtBtn.innerHTML=ico('film','#fff',22);
    const r = window._userProfileReels || [];
    grid.innerHTML = !r.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">🎬</div>No reels yet</div>':r.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')" style="position:relative">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.style.background=\'#0a0a0a\'">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">🎬</div>')+'<div style="position:absolute;top:6px;right:6px">'+ico('film','#fff',14)+'</div></div>').join('');
  } else if(tab==='tagged'){
    tgBtn.style.borderBottomColor='#fff';
    tgBtn.innerHTML=ico('tag','#fff',22);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">🏷️</div>No tagged posts</div>';
  }
}

async function showUserProfileOptions(userId){
  // Premium glassmorphism action sheet
  const bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;flex-direction:column;justify-content:flex-end;animation:novaFadeIn 0.2s ease';
  bg.id = 'action-sheet-bg';
  bg.onclick = (e) => { if(e.target === bg) bg.remove(); };

  const sheet = document.createElement('div');
  sheet.style.cssText = 'background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border-radius:28px 28px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:8px 0 32px;animation:novaSlideUp 0.3s cubic-bezier(0.32,0.72,0,1)';

  // Grab handle
  const handle = document.createElement('div');
  handle.style.cssText = 'width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:8px auto 16px';
  sheet.appendChild(handle);

  // ── Block-status check: mirror the pattern used by the main profile view (line ~8476) ──
  // Without this, the sheet always shows "Block User" — even for an already-blocked user —
  // which causes a 23505 unique-violation when tapped (the .throwOnError() fix from Part 12
  // now correctly surfaces this as an error instead of silently failing).
  let isBlocked = false;
  try { isBlocked = await getBlockedList().then(s => s.has(userId)); } catch(e) {}

  const actions = [
    {icon: 'share', color: '#FF2D7A', label: 'Share Profile', type: 'share'},
    {icon: 'star', color: '#FF2D7A', label: 'Close Friends', type: 'closeFriends'},
    {icon: 'bell_off', color: '#8A8A8A', label: 'Mute User', type: 'mute'},
    {icon: 'lock', color: '#FF2D7A', label: isBlocked ? 'Unblock User' : 'Block User', type: isBlocked ? 'unblock' : 'block'},
    {icon: 'eye', color: '#8A8A8A', label: 'Restrict User', type: 'restrict'},
    {icon: 'flag', color: '#FF2D7A', label: 'Report User', type: 'report'},
  ];

  // Dispatch table replacing the former eval(a.action) string execution (audit M4):
  // each entry maps to its real function with direct arguments, preserving the
  // original call order and sheet-removal behavior exactly.
  const closeProfileActionSheet = () => { const s = document.getElementById('action-sheet-bg'); if (s) s.remove(); };
  const profileActionHandlers = {
    share: (id) => shareUserProfile(id),
    closeFriends: () => showCloseFriends(),
    mute: (id) => { muteUser(id, null); closeProfileActionSheet(); },
    block: (id) => { blockUser(id, null); closeProfileActionSheet(); },
    unblock: (id) => { unblockUser(id, null); closeProfileActionSheet(); },
    restrict: () => { toast('User restricted'); closeProfileActionSheet(); },
    report: (id) => { reportUser(id); closeProfileActionSheet(); },
  };

  actions.forEach(a => {
    const btn = document.createElement('div');
    btn.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 20px;cursor:pointer;transition:0.2s';
    btn.onclick = () => profileActionHandlers[a.type]?.(userId);
    btn.innerHTML = `
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;flex-shrink:0">${ico(a.icon, a.color, 18)}</div>
      <span style="font-size:15px;font-weight:500;color:${a.color === '#8A8A8A' ? '#fff' : a.color}">${a.label}</span>
    `;
    sheet.appendChild(btn);
  });

  // Cancel
  const cancel = document.createElement('div');
  cancel.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:16px 20px;margin-top:8px;cursor:pointer;border-top:1px solid rgba(255,255,255,0.04)';
  cancel.onclick = () => bg.remove();
  cancel.innerHTML = '<span style="font-size:15px;font-weight:600;color:#8A8A8A">Cancel</span>';
  sheet.appendChild(cancel);

  bg.appendChild(sheet);
  document.body.appendChild(bg);
}

function shareUserProfile(userId){
  const link = `${window.location.origin}/?u=${userId}`;
  if(navigator.share){
    navigator.share({text:'Check out this profile on NovaSocial!',url:link}).catch(()=>{});
  } else {
    try{navigator.clipboard.writeText(link);toast('Profile link copied! 📋');}catch(e){toast('Could not copy');}
  }
}
