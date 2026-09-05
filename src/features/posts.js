// Posts presentation feature — classic script, preserves legacy global handlers.
// ── VIEWS & CAPTION HELPER ──────────────────────────────────────
async function recordPostView(postId) {
  try {
    await db.from('post_views').upsert(
      { post_id: postId, user_id: ME.id },
      { onConflict: 'post_id,user_id', ignoreDuplicates: true }
    );
  } catch (e) {}
}

function formatCaption(username, caption) {
  if (!caption) return '';
  const maxLen = 120;
  // Double-escaped for the inline onclick innerHTML-rebuild context (attr decode + JS string + innerHTML layers)
  const safeCaption = esc(esc(caption));
  if (caption.length <= maxLen) {
    return `<span style="font-weight:700">${esc(username)} </span><span style="color:#ddd">${esc(caption)}</span>`;
  }
  const shortText = caption.substring(0, maxLen).trim();
  return `<span style="font-weight:700">${esc(username)} </span><span style="color:#ddd">${esc(shortText)}... <span class="caption-more" onclick="event.stopPropagation();this.parentElement.innerHTML='<b>${esc(esc(username))}</b> <span style=\\'color:#ddd\\'>${safeCaption}</span>'">more</span></span>`;
}

// ── LIKE / REACTIONS ──────────────────────────────────────
function likeIconHTML(liked,reaction){
  if(liked && reaction && reaction!=='heart') return `<span style="font-size:25px;line-height:1">${REACT_MAP[reaction]||'❤️'}</span>`;
  return liked?ico('heartf'):ico('heart');
}

function startLongPress(pid){lpFired=false;lpTimer=setTimeout(()=>{lpFired=true;showReactionBar(pid);},420);}
function cancelLongPress(){clearTimeout(lpTimer);}
function showReactionBar(pid){
  const bar=document.getElementById('rbar-'+pid);if(!bar)return;
  bar.innerHTML=REACT_EMOJIS.map(em=>`<span onclick="setReaction(event,'${pid}','${em}')">${em}</span>`).join('');
  bar.style.display='flex';
  setTimeout(()=>{if(bar)bar.style.display='none';},4000);
}

function updateLikeUI(pid,liked,cnt,reaction){
  const el=document.getElementById('lbtn-'+pid);
  if(el){el.dataset.liked=liked;el.dataset.cnt=cnt;el.dataset.reaction=reaction;el.innerHTML=likeIconHTML(liked,reaction);}
  const lc1=document.getElementById('lcnt-'+pid);
  if(lc1){lc1.textContent=fmt(cnt)+' likes';lc1.style.display=cnt>0?'block':'none';}
  const lc2=document.getElementById('lcnt-'+pid+'-txt');
  if(lc2) lc2.textContent=fmt(cnt);
}

async function toggleLike(pid){
    if(lpFired){lpFired=false;return;}
  haptic(15); // Vibrate on like
  const el=document.getElementById('lbtn-'+pid);if(!el)return;
  const wasLiked=el.dataset.liked==='true';
  const newLiked=!wasLiked;
  const cnt=parseInt(el.dataset.cnt)||0;
  const newCnt=newLiked?cnt+1:Math.max(0,cnt-1);
  const owner=el.dataset.owner;
  updateLikeUI(pid,newLiked,newCnt,'heart'); // ← Optimistic UI update (already exists, preserved)

  // ── Part 6 Fix 3: Offline queue — agar offline hai, DB call skip karo
  // aur action queue mein daal do (replay on reconnect). UI already updated
  // optimistically above, so user ko turant feedback milta hai.
  if (isOffline()) {
    _queueOfflineAction({
      type: 'like',
      payload: { postId: pid, liked: newLiked }
    });
    return;
  }

  if(newLiked){
    await db.from('likes').upsert({user_id:ME.id,post_id:pid,reaction:'heart'},{onConflict:'user_id,post_id'});
    if(owner && owner !== ME.id){
      await sendNotif(owner, 'like', {post_id: pid, message: 'liked your post ❤️'});
    }
  }else{
    await db.from('likes').delete().eq('user_id',ME.id).eq('post_id',pid);
  }
}

function dblLike(pid,cont){
  cont.appendChild(p);setTimeout(()=>p.remove(),700);
  haptic(20);
  const el=document.getElementById('lbtn-'+pid);
  if(el&&el.dataset.liked!=='true') toggleLike(pid);

  // Flying Hearts Animation
  for(let i=0; i<6; i++) {
    setTimeout(() => {
      const p=document.createElement('div');
      p.className='hpop';
      p.textContent='❤️';
      p.style.left = (30 + Math.random() * 50) + '%';
      p.style.top = (30 + Math.random() * 50) + '%';
      p.style.fontSize = (40 + Math.random() * 30) + 'px';
      p.style.animationDuration = (0.8 + Math.random() * 0.5) + 's';
      cont.appendChild(p);
      setTimeout(()=>p.remove(), 1300);
    }, i * 100);
  }
}

async function setReaction(e,pid,emoji){
  e.stopPropagation();
  const reactionKey=Object.keys(REACT_MAP).find(k=>REACT_MAP[k]===emoji)||'heart';
  const el=document.getElementById('lbtn-'+pid);if(!el)return;
  const wasLiked=el.dataset.liked==='true';
  const cnt=parseInt(el.dataset.cnt)||0;
  const owner=el.dataset.owner;
  const newCnt=wasLiked?cnt:cnt+1;
  updateLikeUI(pid,true,newCnt,reactionKey);
  await db.from('likes').upsert({user_id:ME.id,post_id:pid,reaction:reactionKey},{onConflict:'user_id,post_id'});
  if(!wasLiked && owner && owner !== ME.id){
    await sendNotif(owner, 'like', {post_id: pid, message: `reacted ${emoji} to your post`});
  }
  const bar=document.getElementById('rbar-'+pid);if(bar)bar.style.display='none';
}

function postCard(p,liked,saved,reaction){
  const online=isOnline(p.profiles?.last_seen);
  const isMine = p.user_id === ME.id;
  return `<div class="post fade" id="pc-${p.id}">
  <div class="post-hdr">
    <div onclick="goToProfile('${p.user_id}')" style="display:flex;align-items:center;gap:10px;cursor:pointer">
      ${av(p.profiles?.avatar_url,p.profiles?.username,40,true,online)}
      <div>
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-weight:700;font-size:14px">${p.profiles?.username||''}</span>
          ${p.profiles?.is_verified?ico('verified','',14):''}
        </div>
        ${p.location?`<div style="color:#777;font-size:11px">${p.location}</div>`:online?`<div style="color:#3db83d;font-size:11px">Active now</div>`:''}
      </div>
    </div>
    <div style="display:flex;gap:14px;align-items:center">
      ${p.media_url?`<div onclick="downloadMedia('${p.media_url}','novasocial_${p.id}')" style="cursor:pointer" title="Download">${ico('img','#aaa',18)}</div>`:''}
      <div onclick="showPostMenu('${p.id}','${p.user_id}')" style="cursor:pointer">${ico('more','#fff')}</div>
    </div>
  </div>
  <div style="position:relative;aspect-ratio:1/1;background:#111;overflow:hidden;cursor:pointer" ondblclick="dblLike('${p.id}',this)">
    ${p.media_url?
      p.media_type==='video'?`<div style="position:relative;width:100%;height:100%"><video src="${p.media_url}" ${p.thumbnail_url?`poster="${p.thumbnail_url}"`:''} style="width:100%;height:100%;object-fit:cover" controls playsinline loop muted id="pv-${p.id}"></video></div>`
      :`<img src="${optimizeCloudinaryUrl(cldUrl(p.media_url, NOVA_MEDIA_CONFIG.post_image.cloudTransform))}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`
    :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:48px">📷</div>`}
  </div>
  <div class="post-acts">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div style="display:flex;gap:18px;align-items:center">
        <div style="position:relative">
          <div id="lbtn-${p.id}" data-liked="${liked}" data-cnt="${p.likes_count||0}" data-owner="${p.user_id}" data-reaction="${reaction}"
            onclick="toggleLike('${p.id}')" ontouchstart="startLongPress('${p.id}')" ontouchend="cancelLongPress()" ontouchmove="cancelLongPress()"
            style="cursor:pointer;display:flex;align-items:center">${likeIconHTML(liked,reaction)}</div>
          <div id="rbar-${p.id}" class="reaction-bar"></div>
        </div>
        <div onclick="openComments('${p.id}')" style="cursor:pointer">${ico('comment')}</div>
        <div onclick="sharePostViaDM('${p.id}')" style="cursor:pointer" title="Send via DM">${ico('send')}</div>
        <div onclick="openShareSheet('${p.id}')" style="cursor:pointer" title="Share">${ico('more','#fff',18)}</div>
      </div>
      <div id="sbtn-${p.id}" data-saved="${saved}" onclick="toggleSave('${p.id}')" style="cursor:pointer">${saved?ico('bmf'):ico('bm')}</div>
    </div>
    <div style="display:flex;gap:15px;font-weight:700;font-size:14px;margin-bottom:5px;align-items:center;">
      <div id="lcnt-${p.id}" style="${!(p.likes_count>0)?'display:none':''}">${fmt(p.likes_count||0)} likes</div>
     <div style="color:#aaa;font-weight:600;">${fmt(p.views_count||0)} views</div>
      ${isMine?`<div onclick="viewInsights('${p.id}')" style="color:#4a90d9;font-weight:600;cursor:pointer;margin-left:auto;">Insights</div>`:''}
    </div>
    ${p.caption?`<div style="font-size:14px;line-height:1.6;margin-bottom:4px">${formatCaption(p.profiles?.username, p.caption)}</div>`:''}
    <div id="ccnt-${p.id}" onclick="openComments('${p.id}')" style="color:#777;font-size:13px;cursor:pointer;margin-bottom:4px;${!(p.comments_count>0)?'display:none':''}">View all ${p.comments_count} comments</div>
    <div style="color:#444;font-size:11px">${ago(p.created_at)}</div>
  </div>
</div>`;
}
