// Profile feature — classic script, preserves legacy global handlers.
// ── PROFILE ──────────────────────────────────────


async function renderProfile(){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  const scr=document.getElementById('screen');
  try {
  let prof, posts, savedPosts;

  // Profile query
  const profRes = await db.from('profiles').select('*').eq('id',ME.id).single();
  if(profRes.error) throw new Error('Profile query failed: ' + profRes.error.message);
  prof = profRes.data;

  // Posts query
  const postsRes = await db.from('posts').select('*').eq('user_id',ME.id).order('created_at',{ascending:false});
  if(postsRes.error) throw new Error('Posts query failed: ' + postsRes.error.message);
  posts = postsRes.data;

  // Saved posts query (may fail if table structure changed, catch gracefully)
  let savedData = [];
  try {
    const savedRes = await db.from('bookmarks').select('post_id, posts!inner(id, media_url, media_type)').eq('user_id',ME.id);
    if(!savedRes.error) savedData = savedRes.data || [];
  } catch(e) { console.log('Saved posts query failed (non-critical):', e); }

  const myS = savedData.map(s => s.posts).filter(Boolean);
    PROF=prof||{};
  const myP=(posts||[]).filter(p=>!p.is_reel);
  const myR=(posts||[]).filter(p=>p.is_reel);

  // Fetch Liked Posts (may fail, catch gracefully)
  let myL = [];
  try {
    const { data: likedData } = await db.from('likes').select('post_id, posts!inner(id, media_url, media_type)').eq('user_id', ME.id);
    myL = (likedData||[]).map(l => l.posts).filter(Boolean);
  } catch(e) { console.log('Liked posts query failed (non-critical):', e); }

  window._pp=myP;window._pr=myR;window._pl=myL;

  // Cover: check DB first, then localStorage fallback
  const coverUrl = PROF.cover_url || localStorage.getItem('nova-cover-url') || '';

  // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
  if(myGeneration !== _renderGeneration) return;
  if(!scr) return;
  scr.innerHTML=`
  <!-- Cover Image Header -->
  <div style="position:relative;height:180px;overflow:hidden">
    <div onclick="document.getElementById('cover-pick').click()" style="position:absolute;inset:0;cursor:pointer">
      ${coverUrl?`<img src="${cldUrl(coverUrl, NOVA_MEDIA_CONFIG.cover.cloudTransform)}" style="width:100%;height:100%;object-fit:cover">`:`<div style="width:100%;height:100%;background:linear-gradient(135deg,#0a0a0a,#1a0a2e,#16213e);display:flex;align-items:center;justify-content:center"><div style="font-size:40px;color:#222">${ico('img','#222',40)}</div></div>`}
      <!-- Gradient overlay for contrast (premium strong bottom fade) -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.05) 35%,rgba(0,0,0,0.55) 75%,rgba(0,0,0,0.9) 100%)"></div>
    </div>
    <input id="cover-pick" type="file" accept="image/*" style="display:none" onchange="uploadCover(this)">
    <!-- Top bar overlay — Premium glass effect -->
    <div style="position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;z-index:5;background:linear-gradient(180deg,rgba(0,0,0,0.4) 0%,transparent 100%)">
      <div onclick="document.getElementById('cover-pick').click()" style="width:38px;height:38px;border-radius:12px;background:rgba(0,0,0,0.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${ico('cam','#fff',17)}</div>
      <div style="display:flex;gap:8px">
        <div onclick="shareProfile()" style="width:38px;height:38px;border-radius:12px;background:rgba(0,0,0,0.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${ico('share','#fff',17)}</div>
        <div onclick="showEdit()" style="width:38px;height:38px;border-radius:12px;background:rgba(0,0,0,0.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Avatar (overlapping cover) -->
  <div style="position:relative;margin-top:-50px;padding:0 16px;display:flex;align-items:flex-end;gap:14px">
    <div onclick="showAvatarActionSheet()" style="cursor:pointer;position:relative;flex-shrink:0">
      ${_myActiveNote ? `<div style="position:relative;display:inline-block">
  <div onclick="viewNote('${_myActiveNote.id}')" style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#2a2a2a,#1c1c1c);color:#fff;font-size:10.5px;font-weight:700;padding:5px 11px;border-radius:12px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(0,0,0,0.4);cursor:pointer;z-index:5;animation:pillFadeIn 0.3s ease">
    ${_myActiveNote.text ? _myActiveNote.text.slice(0,16) : (_myActiveNote.music_title ? '🎵 '+_myActiveNote.music_title.slice(0,14) : '💭')}
  </div>
  ${av(PROF.avatar_url,PROF.username||ME.email,82)}
</div>` : `<div class="nova-story-ring" style="background:linear-gradient(135deg,#FF3B81,#833AB4,#00D4FF);padding:3px;border-radius:50%"><div style="border:3px solid #000;border-radius:50%">${av(PROF.avatar_url,PROF.username||ME.email,82)}</div></div>`}
      <div style="position:absolute;bottom:0;right:0;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#FF3B81,#833AB4);display:flex;align-items:center;justify-content:center;border:2.5px solid #000">${ico('cam','#fff',13)}</div>
    </div>
    <input id="avpick" type="file" accept="image/*" style="display:none" onchange="uploadAv(this)">
  </div>

  <!-- Bio & Info -->
  <div style="padding:12px 16px 10px">
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px">
      <div style="font-weight:800;font-size:18px;letter-spacing:0.2px">
        ${(PROF.full_name && PROF.full_name.trim() && PROF.full_name.trim().toLowerCase() !== (PROF.username||'').toLowerCase())
          ? PROF.full_name
          : PROF.username || ''}
      </div>
      ${PROF.is_verified?ico('verified','#3897f0',16):''}
      ${PROF.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}
      <span onclick="showAccountSwitcher()" style="cursor:pointer;margin-left:4px;display:inline-flex;vertical-align:middle" title="Switch Account">${ico('chevron_down','#888',16)}</span>
    </div>
    ${(PROF.full_name && PROF.full_name.trim() && PROF.full_name.trim().toLowerCase() !== (PROF.username||'').toLowerCase())
      ? `<div style="color:#666;font-size:12px;margin-bottom:6px">@${PROF.username||''}</div>`
      : ''}
    ${PROF.bio?`<div style="color:#d4d4d4;font-size:13.5px;line-height:1.55;margin-bottom:6px">${linkify(PROF.bio)}</div>`:''}
    ${PROF.website?`<div onclick="window.open('${sanitizeUrl(PROF.website)}','_blank')" style="color:#00D4FF;font-size:13px;margin-bottom:6px;display:flex;align-items:center;gap:5px;cursor:pointer;font-weight:500">${ico('link','#00D4FF',14)}${sanitizeUrl(PROF.website).replace(/^https?:\/\//,'')}</div>`:''}
    <div style="display:flex;align-items:center;gap:12px">
      <div style="color:#3db83d;font-size:11.5px;display:flex;align-items:center;gap:5px;font-weight:500"><span style="width:7px;height:7px;border-radius:50%;background:#3db83d;display:inline-block;box-shadow:0 0 6px rgba(61,184,61,0.6)"></span>Active now</div>
    </div>
  </div>

  <!-- Stats Row -->
  <div style="display:flex;padding:0 16px 12px;gap:0">
    ${[['Posts',myP.length,null],['Followers',fmt(PROF.followers_count||0),'followers'],['Following',fmt(PROF.following_count||0),'following']].map(([l,v,type])=>`<div class="nova-stat" ${type?`onclick="showFollowList('${ME.id}','${type}')"`:''} style="flex:1;text-align:center;padding:8px 0;${type?'cursor:pointer':''}"><div style="font-size:17px;font-weight:800;color:#fff"${type==='followers'?` id="followers-count" data-raw="${PROF.followers_count||0}"`:''}>${v}</div><div style="font-size:10px;color:#888;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">${l}</div></div>`).join('')}
  </div>

  <!-- Action Buttons (Clean - only 3) -->
  <div style="display:flex;gap:8px;padding:0 16px 14px">
    <button class="prof-btn" onclick="showEdit()" style="display:flex;align-items:center;justify-content:center;gap:6px">${ico('edit','#fff',16)} Edit Profile</button>
    <button class="prof-btn" onclick="shareProfile()" style="display:flex;align-items:center;justify-content:center;gap:6px">${ico('share','#fff',16)} Share</button>
    <button class="prof-btn prof-btn-primary" onclick="showCreate('post')" style="display:flex;align-items:center;justify-content:center;gap:6px">${ico('plus','#fff',16)} New Post</button>
  </div>

  <!-- Tabs -->
  <div style="display:flex;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
    <div id="ptb-p" onclick="profTab('posts')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid #fff">${ico('grid','#fff',22)}</div>
    <div id="ptb-r" onclick="profTab('reels')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid transparent">${ico('film','#555',22)}</div>
    <div id="ptb-s" onclick="profTab('saved')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid transparent">${ico('bm','#555',22)}</div>
    <div id="ptb-l" onclick="profTab('liked')" style="flex:1;display:flex;justify-content:center;padding:13px;cursor:pointer;border-bottom:2px solid transparent">${ico('heart','#555',22)}</div>
  </div>
  <div class="pgrid" id="pgrid">
    ${!myP.length?`<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">${ico('img','#333',44)}</div>No posts yet</div>`:myP.map(p=>`<div class="pitem" onclick="viewPost('${p.id}')">${p.media_url?`<img src="${cldUrl(p.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)}" loading="lazy" onerror="this.style.display='none';this.parentElement.style.background='#0a0a0a'">`:`<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333">${ico('img','#333',32)}</div>`}</div>`).join('')}
  </div>
  <div style="height:80px"></div>`;
  } catch(e) {
    console.error('Profile load error:', e);
    scr.innerHTML=`<div class="topbar"><span style="font-weight:700">Profile</span></div>
    <div style="text-align:center;padding:60px 20px;color:#444">
      <div style="font-size:52px;margin-bottom:16px">⚠️</div>
      <div style="font-weight:700;font-size:17px;color:#fff;margin-bottom:8px">Profile load nahi hua</div>
      <div style="font-size:13px;margin-bottom:20px;color:#888">Error: ${e.message||'Unknown'}</div>
      <button class="bgrd" onclick="renderProfile()" style="width:auto;padding:13px 28px">🔄 Retry</button>
    </div>`;
  }
}

function profTab(t){
  const pb=document.getElementById('ptb-p'),rb=document.getElementById('ptb-r'),sb=document.getElementById('ptb-s'),lb=document.getElementById('ptb-l'),g=document.getElementById('pgrid');
  if(!pb||!rb||!sb||!lb||!g)return;

  // Reset all
  pb.style.borderBottomColor='transparent';pb.innerHTML=ico('grid','#555',22);
  rb.style.borderBottomColor='transparent';rb.innerHTML=ico('film','#555',22);
  sb.style.borderBottomColor='transparent';sb.innerHTML=ico('bm','#555',22);
  lb.style.borderBottomColor='transparent';lb.innerHTML=ico('heart','#555',22);

  if(t==='posts'){
    pb.style.borderBottomColor='#fff';pb.innerHTML=ico('grid','#fff',22);
    const p=window._pp||[];
    g.innerHTML=!p.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">📷</div>Koi post nahi</div>':p.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">📷</div>')+'</div>').join('');
  }else if(t==='reels'){
    rb.style.borderBottomColor='#fff';rb.innerHTML=ico('film','#fff',22);
    const r=window._pr||[];
    g.innerHTML=!r.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">🎬</div>Koi reel nahi</div>':r.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')" style="position:relative">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">🎬</div>')+'<div style="position:absolute;top:6px;right:6px">'+ico('film','#fff',14)+'</div></div>').join('');
  }else if(t==='saved'){
    sb.style.borderBottomColor='#fff';sb.innerHTML=ico('bm','#fff',22);
    const s=window._ps||[];
    g.innerHTML=!s.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="font-size:44px;margin-bottom:10px">🔖</div>Saved posts yahan dikhega</div>':s.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333;font-size:32px">📷</div>')+'</div>').join('');
  }else if(t==='liked'){
    lb.style.borderBottomColor='#fff';lb.innerHTML=ico('heart','#fff',22);
    const l=window._pl||[];
    g.innerHTML=!l.length?'<div style="grid-column:1/-1;text-align:center;padding:52px;color:#333"><div style="margin-bottom:10px;display:flex;justify-content:center">'+ico('heart','#333',44)+'</div>Liked posts yahan dikhega</div>':l.map(x=>'<div class="pitem" onclick="viewPost(\''+x.id+'\')">'+(x.media_url?'<img src="'+cldUrl(x.media_url, NOVA_MEDIA_CONFIG.grid_thumb.cloudTransform)+'" loading="lazy">':'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#333">'+ico('cam','#333',32)+'</div>')+'</div>').join('');
  }
}

async function uploadAv(inp){
  const f=inp.files[0];
  if(!f) return;

  // ── SAFE VALIDATION CHECK ──
  // typeof check pehle karo — ye crash-proof hai
  // (NOTE: direct `!validateFileUpload` ReferenceError throw karta agar function undeclared ho)
  if(typeof validateFileUpload === 'function') {
    if(!validateFileUpload(f, 'avatar')) return;
  } else {
    // Fallback basic validation agar helper function exist nahi karta
    if(!f.type.startsWith('image/')) { toast('❌ Sirf image files allowed hain'); return; }
    if(f.size > 20 * 1024 * 1024) { toast('❌ File 20MB se badi nahi honi chahiye'); return; }
  }

  // Input reset karo taaki same file dobara select ho sake future mein
  inp.value = '';

  // ── CROP PREVIEW SHOW KARO — upload sirf confirm hone ke baad hoga ──
  openCropPreview(f, 'avatar', async (croppedFile) => {
    await _doAvatarUpload(croppedFile);
  });
}

async function _doAvatarUpload(f) {
  // Purana avatar URL save karo cleanup ke liye
  const oldAvatarUrl = PROF?.avatar_url;

  toast('📤 Uploading...');

  try {
    // ── STEP 1: Cloudinary upload ──
    const url = await upload(f, p=>{}, 'avatar');

    if(!url) {
      toast('❌ Upload fail hua — URL nahi mila');
      return;
    }

    // ── STEP 2: DB update WITH verification ──
    const { data: updated, error: updateErr } = await db
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', ME.id)
      .select('avatar_url')
      .single();

    if(updateErr) {
      console.error('Avatar DB update failed:', updateErr);
      toast('❌ Database update failed: ' + updateErr.message);
      return;
    }

    if(!updated || updated.avatar_url !== url) {
      console.error('Avatar DB update mismatch:', updated);
      toast('❌ Update confirm nahi ho saka — dobara try karo');
      return;
    }

    // ── STEP 3: Confirmed successful — ab UI update karo ──
    PROF.avatar_url = url;

    if(typeof updateAccountAvatar === 'function') {
      updateAccountAvatar(ME.id, url);
    }

    // Nav bar avatar update (cache-busting with ?t= timestamp)
    const nav = document.getElementById('nav-av');
    if(nav) {
      nav.innerHTML = `<img src="${url}?t=${Date.now()}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.textContent='${(PROF.username||'?')[0].toUpperCase()}'">`;
    }

    toast('✅ Profile photo updated!');

    // ── STEP 4: Force complete re-render with fresh data ──
    await renderProfile();

    // ── STEP 5: Cleanup purana avatar (background, non-blocking) ──
    if(oldAvatarUrl && oldAvatarUrl.includes('cloudinary.com') && oldAvatarUrl !== url) {
      if(typeof deleteMediaProduction === 'function') {
        deleteMediaProduction(oldAvatarUrl, 'avatar', 'user_delete').catch((e) => {
          console.warn('Old avatar cleanup failed (non-critical):', e);
        });
      }
    }

  } catch(e) {
    console.error('Avatar upload error:', e);
    toast('❌ Upload failed: ' + (e.message || 'Unknown error'));
  }
}

async function uploadCover(inp){
  const f=inp.files[0];
  if(!f) return;

  if(!f.type.startsWith('image/')) { toast('❌ Sirf image files allowed hain'); return; }
  if(f.size > 20 * 1024 * 1024) { toast('❌ File 20MB se badi nahi honi chahiye'); return; }

  // Input reset karo taaki same file dobara select ho sake
  inp.value = '';

  // ── CROP PREVIEW SHOW KARO (wide aspect ratio cover ke liye) ──
  openCropPreview(f, 'cover', async (croppedFile) => {
    await _doCoverUpload(croppedFile);
  });
}

async function _doCoverUpload(f) {
  const oldCoverUrl = PROF?.cover_url;

  toast('📤 Uploading cover...');

  try {
    const url = await upload(f, null, 'cover');

    if(!url) {
      toast('❌ Upload fail hua');
      return;
    }

    // ── DB update WITH verification (no more silent try/catch) ──
    const { data: updated, error: updateErr } = await db
      .from('profiles')
      .update({ cover_url: url })
      .eq('id', ME.id)
      .select('cover_url')
      .single();

    if(updateErr) {
      // Agar column exist nahi karta, ye specific error dega —
      // localStorage fallback use karo lekin user ko batao
      console.error('Cover DB update error:', updateErr);
      if(updateErr.message?.includes('column') || updateErr.code === '42703') {
        localStorage.setItem('nova-cover-url', url);
        PROF.cover_url = url;
        toast('⚠️ Cover saved locally (DB column missing — contact admin)');
      } else {
        toast('❌ Cover update failed: ' + updateErr.message);
        return;
      }
    } else if(updated) {
      PROF.cover_url = updated.cover_url;
      localStorage.setItem('nova-cover-url', url); // backup
    }

    toast('✅ Cover photo updated!');
    await renderProfile();

    // Cleanup purana cover
    if(oldCoverUrl && oldCoverUrl.includes('cloudinary.com') && oldCoverUrl !== url) {
      if(typeof deleteMediaProduction === 'function') {
        deleteMediaProduction(oldCoverUrl, 'cover', 'user_delete').catch(() => {});
      }
    }

  } catch(e) {
    console.error('Cover upload error:', e);
    toast('❌ Upload failed: ' + (e.message || 'Unknown error'));
  }
}

async function logout(){
  if (window._callIncomingSubscription) db.removeChannel(window._callIncomingSubscription);
  if (window._selfProfileSub) db.removeChannel(window._selfProfileSub); // 🔄 Cleanup self-profile realtime sync
  if (_callState.active) endCall();
  stopRingtone();

  const loggedOutUserId = ME?.id;
  if(loggedOutUserId) removeAccountSession(loggedOutUserId); // 👥 Remove current account from saved-accounts list

  // 🛠️ FIX: Koi bhi open modal/overlay forcibly hatao (settings modal isi se stuck reh jaata tha)
  document.querySelectorAll('.mbg').forEach(el => el.remove());
  if(typeof _modalSubPageStack !== 'undefined') _modalSubPageStack = [];
  if(window.navStack) window.navStack = [];
  const sv = document.getElementById('sv');
  if(sv) sv.classList.remove('show');

  // Clear account-bound UI before sign-out so the next user cannot inherit
  // the previous account's story tray, feed DOM, scroll, or tab cache.
  resetAccountScopedUiState(null);
  await db.auth.signOut();
  ME=null; PROF=null;
  clearNavStack();

  // 🆕 Instagram-style: agar koi aur saved account bacha hai, usi pe
  // auto-switch karo (login screen skip)
  const remainingAccounts = getSavedAccounts().filter(a => a.userId !== loggedOutUserId);

  if(remainingAccounts.length > 0){
    const nextAccount = remainingAccounts[0]; // sabse recent wala
    toast(`Switching to ${nextAccount.username}...`);
    try{
      const{error} = await db.auth.setSession({
        access_token: nextAccount.access_token,
        refresh_token: nextAccount.refresh_token
      });
      if(error) throw error;
      setTimeout(()=>{ window.location.reload(); }, 300);
      return; // login screen dikhane wala code skip karo
    }catch(e){
      // Agar saved session expire/invalid ho gaya ho, use list se hata ke
      // login screen pe fall-back karo
      removeAccountSession(nextAccount.userId);
      toast('Saved session expire ho chuka, dobara login karo');
    }
  }

  // Koi aur account nahi bacha (ya switch fail hua) — login screen dikhao
  document.getElementById('root').style.display='none';
  document.getElementById('auth').style.display='flex';
}
