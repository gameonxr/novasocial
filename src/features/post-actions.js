/**
 * NovaSocial post actions and sharing handlers.
 *
 * Extracted from index.html without bundling so classic-script globals remain
 * available to inline onclick handlers and the existing navigation stack.
 */
async function downloadMedia(url, name = 'novasocial_media') {
  try {
    toast('Downloading...');
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name + (blob.type.includes('video') ? '.mp4' : '.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast('Downloaded! 📥');
  } catch (e) {
    toast('Download failed');
  }
}

function showPostMenu(pid, userId) {
  const isMine = (userId === ME.id);
  const m = modal('Post Options');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:8px 0;">
      <button onclick="showTranslateOptions('${pid}')" class="bout" style="border:none;border-bottom:1px solid #222;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;display:flex;align-items:center;gap:10px">${ico('globe','#00E5FF',16)} Translate Post</button>
      ${isMine?`
        <button onclick="editPostCaption('${pid}')" class="bout" style="border:none;border-bottom:1px solid #222;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;display:flex;align-items:center;gap:10px">${ico('edit','#fff',16)} Edit Caption</button>
        <button onclick="archivePost('${pid}');closeModal();" class="bout" style="border:none;border-bottom:1px solid #222;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;display:flex;align-items:center;gap:10px">${ico('bm','#fff',16)} Archive Post</button>
        <button onclick="delPost('${pid}');closeModal();" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#E1306C;display:flex;align-items:center;gap:10px">${ico('trash','#E1306C',16)} Delete Post</button>
      `:`
        <button onclick="showReportModal('post','${pid}')" class="bout" style="border:none;border-bottom:1px solid #222;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#ffaa00;display:flex;align-items:center;gap:10px">${ico('flag','#ffaa00',16)} Report Post</button>
      `}
      <button onclick="closeModal()" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;">Cancel</button>
    </div>`;
}

function showTranslateOptions(pid){
  const m = modal('🌍 Translate to...');
  const body = m.querySelector('#mbody');
  const langs = [
    ['Hindi','hi-IN','🇮🇳'],
    ['English','en-US','🇬🇧'],
    ['Punjabi','pa-IN','🇮🇳'],
    ['Arabic','ar-SA','🇸🇦'],
    ['Spanish','es-ES','🇪🇸'],
    ['French','fr-FR','🇫🇷'],
    ['German','de-DE','🇩🇪'],
    ['Portuguese','pt-BR','🇧🇷'],
    ['Chinese','zh-CN','🇨🇳'],
    ['Japanese','ja-JP','🇯🇵'],
    ['Russian','ru-RU','🇷🇺'],
    ['Korean','ko-KR','🇰🇷'],
  ];
  body.innerHTML = `
    <div style="padding:14px">
      <div style="font-size:12px;color:#666;margin-bottom:14px;font-weight:600">Choose language:</div>
      ${langs.map(([name,code,flag])=>`
        <button onclick="closeModal();translatePost('${pid}','${name}')" class="bout" style="display:flex;align-items:center;gap:12px;padding:14px;width:100%;text-align:left;margin-bottom:6px;border-radius:12px">
          <div style="font-size:24px">${flag}</div>
          <div style="flex:1;font-size:14px;font-weight:600">${name}</div>
          <span style="color:#555">›</span>
        </button>
      `).join('')}
    </div>
  `;
}

async function archivePost(pid) {
  if(!confirm('Archive this post? It will be hidden from your profile and feed.')) return;
  await db.from('posts').update({ is_archived: true }).eq('id', pid).eq('user_id', ME.id);
  const el = document.getElementById('pc-' + pid);
  if(el) el.remove();
  toast('Moved to Archive 📦');
}

async function editPostCaption(pid) {
  const { data: post } = await db.from('posts').select('caption').eq('id', pid).single();
  const newCap = prompt('Edit Caption:', post?.caption || '');
  if (newCap !== null) {
    await db.from('posts').update({ caption: newCap }).eq('id', pid);
    toast('Caption updated! ✨');
    closeModal();
    go(curTab); // Refresh page
  }
}

async function viewInsights(pid) {
  showEnhancedInsights(pid);
}

// ── INSTAGRAM STYLE SHARE POST ──────────────────────────────────────
async function sharePostViaDM(pid) {
  const m = modal('Share Post');
  const body = m.querySelector('#mbody');
  body.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';

  // 1. Recent Conversations fetch karein
  const { data: mem } = await db.from('conversation_members').select('conversation_id, conversations!inner(*)').eq('user_id', ME.id);
  const convos = (mem||[]).map(m=>m.conversations).filter(Boolean).sort((a,b)=>new Date(b.last_message_at)-new Date(a.last_message_at));

  const oneOnOneIds = convos.filter(c=>!c.is_group).map(c=>c.id);
  let otherMap = {};
  if(oneOnOneIds.length){
    const {data:others} = await db.from('conversation_members').select('conversation_id,user_id,profiles!conversation_members_user_id_fkey(username,avatar_url,last_seen)').in('conversation_id',oneOnOneIds).neq('user_id',ME.id);
    (others||[]).forEach(o=>{otherMap[o.conversation_id]=o.profiles;});
  }

  // 2. Following list fetch karein (Suggestions)
  const { data: following } = await db.from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)').eq('follower_id', ME.id);
  const followingList = (following || []).map(f => f.profiles).filter(Boolean);

  body.innerHTML = `
    <div style="padding:16px;">
      <div class="sbar2" style="margin-bottom:16px;">${ico('search','#666',18)}<input placeholder="Search..." oninput="searchUserForShare(this.value,'${pid}')" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>
      <div id="share-dm-res">
        ${convos.length ? `<div style="color:#666;font-size:12px;font-weight:700;margin-bottom:8px;">RECENT</div>` : ''}
        ${convos.slice(0, 5).map(c => {
          const name = c.is_group ? c.group_name : (otherMap[c.id]?.username || 'Chat');
          const avHtml = c.is_group ? `<div style="width:40px;height:40px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;">👥</div>` : av(otherMap[c.id]?.avatar_url, otherMap[c.id]?.username, 40);
          return `<div onclick="sendSharedPostToChat('${c.id}', '${name.replace(/'/g, "\\'")}', ${c.is_group}, '${pid}')" style="display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer;">
            ${avHtml}
            <div style="font-weight:600;font-size:14px;">${name}</div>
          </div>`;
        }).join('')}

        ${followingList.length ? `<div style="color:#666;font-size:12px;font-weight:700;margin:16px 0 8px;">SUGGESTED</div>` : ''}
        ${followingList.map(u => `
          <div onclick="sendSharedPostToUser('${u.id}', '${pid}')" style="display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer;">
            ${av(u.avatar_url, u.username, 40)}
            <div style="font-weight:600;font-size:14px;">${u.username}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

async function searchUserForShare(q, pid) {
  if(!q.trim()) return;
  const { data: users } = await db.from('profiles').select('*').ilike('username', `%${q}%`).neq('id', ME.id).limit(20);
  const r = document.getElementById('share-dm-res');
  if(!r) return;
  r.innerHTML = (users||[]).map(u => `
    <div onclick="sendSharedPostToUser('${u.id}', '${pid}')" style="display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer">
      ${av(u.avatar_url, u.username, 40, false, isOnline(u.last_seen))}
      <div><div style="font-weight:700;font-size:14px">${u.username}</div><div style="color:#555;font-size:12px">${u.full_name||''}</div></div>
    </div>
  `).join('') || '<div style="color:#444;text-align:center;padding:24px">Koi nahi mila</div>';
}

async function sendSharedPostToChat(cid, name, isGrp, pid) {
  try {
    await db.from('messages').insert({ conversation_id: cid, sender_id: ME.id, text: '📷 Shared a post', shared_post_id: pid }).throwOnError();
  } catch(e) {
    if (e.message?.includes('MESSAGING_BLOCKED')) {
      toast("You can't send messages to this user");
    } else {
      console.error('Shared post send failed:', e);
      toast('Post send nahi hua 😕');
    }
    return;
  }
  toast('Post sent! ✅');
  closeModal();
  openChat(cid, name, isGrp);
}

async function sendSharedPostToUser(uid, pid) {
  const { data: myConvos } = await db.from('conversation_members').select('conversation_id,conversations!inner(is_group)').eq('user_id', ME.id);
  const oneOnOneIds = (myConvos||[]).filter(c => !c.conversations.is_group).map(c => c.conversation_id);
  let cid = null;
  if(oneOnOneIds.length) {
    const { data: existing } = await db.from('conversation_members').select('conversation_id').eq('user_id', uid).in('conversation_id', oneOnOneIds);
    if(existing?.length) cid = existing[0].conversation_id;
  }
  if(!cid) {
    const { data: c } = await db.from('conversations').insert({ is_group: false, created_by: ME.id }).select().single();
    if(c) {
      cid = c.id;
      await Promise.all([
        db.from('conversation_members').insert({ conversation_id: cid, user_id: ME.id }),
        db.from('conversation_members').insert({ conversation_id: cid, user_id: uid })
      ]);
    }
  }
  if(cid) {
    try {
      await db.from('messages').insert({ conversation_id: cid, sender_id: ME.id, text: '📷 Shared a post', shared_post_id: pid }).throwOnError();
    } catch(e) {
      if (e.message?.includes('MESSAGING_BLOCKED')) {
        toast("You can't send messages to this user");
      } else {
        console.error('Shared post send failed:', e);
        toast('Post send nahi hua 😕');
      }
      return;
    }
    toast('Post sent! ✅');
    closeModal();
    openChat(cid, 'Chat', false);
  }
}

function goToProfile(userId){
  if(userId===ME.id){go('profile');return;}
  // NAV-STACK: push profile view entry
  pushNavState('profile', userId, function(){ go(curTab); });
  showUserProfile(userId);
}

async function toggleSave(pid){
  const el=document.getElementById('sbtn-'+pid);if(!el)return;
  const was=el.dataset.saved==='true';
  el.dataset.saved=!was;
  el.innerHTML=!was?ico('bmf'):ico('bm');
  if(!was){await db.from('bookmarks').insert({user_id:ME.id,post_id:pid});toast('Saved! 🔖');}
  else{await db.from('bookmarks').delete().eq('user_id',ME.id).eq('post_id',pid);toast('Removed');}
}

/**
 * USER POST DELETE — HARD DELETE (Production Grade)
 * Sab kuch permanently delete: post, likes, comments, bookmarks,
 * views, notifications, AND Cloudinary media (via 2-layer engine).
 * Irreversible action — full error handling + ownership verification.
 */
async function delPost(pid){
  if(!confirm('Post permanently delete karo? Ye action undo nahi ho sakta.')) return;

  toast('🗑️ Delete ho raha hai...');

  try {
    // ── STEP 1: Post data fetch karo (media URLs + is_reel flag ke liye) ──
    const { data: post, error: fetchErr } = await db
      .from('posts')
      .select('media_url, media_type, thumbnail_url, user_id, is_reel')
      .eq('id', pid)
      .single();

    if(fetchErr || !post) {
      toast('❌ Post nahi mila');
      return;
    }

    // Ownership verify karo (extra security layer — even if RLS misses)
    if(post.user_id !== ME.id) {
      toast('❌ Ye tumhara post nahi hai');
      return;
    }

    // ── STEP 2: Related data delete karo ──
    // (FK CASCADE may already handle this, but explicit = safe)
    await Promise.allSettled([
      db.from('likes').delete().eq('post_id', pid),
      db.from('comments').delete().eq('post_id', pid),
      db.from('bookmarks').delete().eq('post_id', pid),
      db.from('post_views').delete().eq('post_id', pid),
      db.from('notifications').delete().eq('post_id', pid),
    ]);

    // ── STEP 3: Post row delete karo (double safety with user_id) ──
    const { error: delErr } = await db
      .from('posts')
      .delete()
      .eq('id', pid)
      .eq('user_id', ME.id);

    if(delErr) throw delErr;

    // ── STEP 4: Cloudinary media delete karo (production engine) ──
    const mediaUrls = [post.media_url, post.thumbnail_url].filter(Boolean);
    if(mediaUrls.length) {
      await deleteMultipleMediaProduction(
        mediaUrls,
        post.media_type === 'video' ? 'reel' : 'post',
        'user_delete'
      );
    }

    // ── STEP 5: UI update karo ──
    const el = document.getElementById('pc-' + pid);
    if(el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }
    const pitem = document.getElementById('pitem-' + pid);
    if(pitem) pitem.remove();

    toast('✅ Post permanently delete ho gaya');
    // Invalidate caches so deleted post feed se hat jaaye
    invalidateTabCache('home');
    invalidateTabCache('profile');

    // ── Fix 2: Agar deleted item reel tha, persistent-container destroy karo
    // taaki next Reels tab visit pe fresh rebuild ho (deleted reel gayab ho jaaye)
    if (post.is_reel) {
      destroyReelsPersistentContainer();
    }

  } catch(e) {
    console.error('Post delete error:', e);
    toast('❌ Delete nahi ho saka. Dobara try karo.');
  }
}

function shareIt(){if(navigator.share)navigator.share({text:'Check NovaSocial!'});else toast('Link copied!');}

// ── PREMIUM SHARE SHEET (Fixed & Enhanced) ──────────────────────────────────────
async function openShareSheet(pid){
  // Fetch post info
  const {data:p}=await db.from('posts').select('*,profiles!posts_user_id_fkey(username)').eq('id',pid).single();
  if(!p){toast('Post not found');return;}
  const postUrl=`${window.location.origin}/?p=${pid}`;
  const shareText=`Check out @${p.profiles?.username||'user'}'s post on NovaSocial! 🔥`;
  const m=modal('Share Post');
  const body=m.querySelector('#mbody');

  // Preview thumbnail
  const thumbHtml = p.media_url
    ? (p.media_type==='video'
      ? `<video src="${p.media_url}" ${p.thumbnail_url?`poster="${p.thumbnail_url}"`:''} style="width:100%;height:100%;object-fit:cover" muted></video>`
      : `<img src="${optimizeCloudinaryUrl(cldUrl(p.media_url, NOVA_MEDIA_CONFIG.post_image.cloudTransform))}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async">`)
    : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px">📷</div>';

  body.innerHTML=`
    <div style="padding:16px;">
      <!-- Post Preview -->
      <div style="display:flex;gap:14px;align-items:center;padding:14px;background:#0f0f0f;border-radius:14px;margin-bottom:18px;border:1px solid #1a1a1a;">
        <div style="width:64px;height:64px;border-radius:12px;overflow:hidden;background:#111;flex-shrink:0">${thumbHtml}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">@${p.profiles?.username||'user'}</div>
          <div style="color:#888;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(p.caption||'No caption').substring(0,60)}${(p.caption||'').length>60?'...':''}</div>
        </div>
      </div>

      <!-- Share Targets Grid -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;">
        <div onclick="shareToWhatsApp('${postUrl}','${shareText.replace(/'/g,"\\'")}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:24px">💬</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">WhatsApp</div>
        </div>
        <div onclick="shareToTwitter('${postUrl}','${shareText.replace(/'/g,"\\'")}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid #333">𝕏</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Twitter / X</div>
        </div>
        <div onclick="shareToFacebook('${postUrl}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#1877F2;display:flex;align-items:center;justify-content:center;font-size:24px">f</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Facebook</div>
        </div>
        <div onclick="shareToTelegram('${postUrl}','${shareText.replace(/'/g,"\\'")}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#0088cc;display:flex;align-items:center;justify-content:center;font-size:22px">✈</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Telegram</div>
        </div>
        <div onclick="sharePostViaDM('${pid}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);display:flex;align-items:center;justify-content:center;font-size:22px">📨</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Via DM</div>
        </div>
        <div onclick="copyPostLink('${postUrl}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#222;display:flex;align-items:center;justify-content:center;font-size:22px">📋</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Copy Link</div>
        </div>
        <div onclick="downloadMedia('${p.media_url||''}','novasocial_${pid}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#222;display:flex;align-items:center;justify-content:center;font-size:22px">⬇</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">Download</div>
        </div>
        <div onclick="shareNative('${postUrl}','${shareText.replace(/'/g,"\\'")}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px;border-radius:14px;background:#0f0f0f;transition:.2s" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#0f0f0f'">
          <div style="width:48px;height:48px;border-radius:50%;background:#222;display:flex;align-items:center;justify-content:center;font-size:22px">⤴</div>
          <div style="font-size:11px;color:#aaa;font-weight:600">More...</div>
        </div>
      </div>

      <!-- Link Box -->
      <div style="display:flex;align-items:center;gap:8px;background:#0f0f0f;border:1px solid #1a1a1a;border-radius:12px;padding:10px 14px;">
        <div style="flex:1;color:#888;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${postUrl}</div>
        <button onclick="copyPostLink('${postUrl}')" style="background:${'linear-gradient(135deg,#833AB4,#E1306C,#F77737)'};border:none;border-radius:8px;color:#fff;font-weight:700;font-size:12px;padding:8px 14px;cursor:pointer;flex-shrink:0">Copy</button>
      </div>

      <!-- QR Code -->
      <div style="text-align:center;margin-top:18px;">
        <div style="color:#666;font-size:12px;margin-bottom:10px">Scan QR to open post</div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(postUrl)}" style="border-radius:12px;background:#fff;padding:8px;width:160px;height:160px">
      </div>
    </div>
  `;
}

function shareToWhatsApp(url,text){
  const waUrl=`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`;
  window.open(waUrl,'_blank');
  toast('Opening WhatsApp...');
}
function shareToTwitter(url,text){
  const twUrl=`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twUrl,'_blank');
  toast('Opening Twitter...');
}
function shareToFacebook(url){
  const fbUrl=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(fbUrl,'_blank');
  toast('Opening Facebook...');
}
function shareToTelegram(url,text){
  const tgUrl=`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(tgUrl,'_blank');
  toast('Opening Telegram...');
}
function copyPostLink(url){
  try{
    navigator.clipboard.writeText(url);
    toast('Link copied! 📋');
  }catch(e){
    // Fallback for older browsers
    const ta=document.createElement('textarea');
    ta.value=url;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');toast('Link copied! 📋');}catch(err){toast('Copy failed');}
    document.body.removeChild(ta);
  }
}
function shareNative(url,text){
  if(navigator.share){
    navigator.share({text:text,url:url}).catch(()=>{});
  }else{
    copyPostLink(url);
  }
}
