/**
 * NovaSocial Comments feature.
 *
 * Extracted as a classic script; inline comment controls continue to call
 * openComments, toggleCommentLike, and sendCmt through window globals.
 */
// COMMENTS
async function openComments(pid){
  const m=modal('Comments');
  const body=m.querySelector('#mbody');

  let cmts = [];
  try {
    // Part 8 Fix 3: explicit column list instead of select('*') — saves bandwidth on comments query.
    // Verified fields: openComments render uses id, user_id, text, created_at + joined profile fields.
    // Comment likes fetched separately from comment_likes table (line 4968) — no likes_count needed here.
    // parent_comment_id/reply_to NOT used (no threaded comments in current UI — verified via grep).
    const res = await db.from('comments').select('id,user_id,text,created_at,profiles!comments_user_id_fkey(username,avatar_url)').eq('post_id',pid).order('created_at',{ascending:true}).limit(100);
    if(res.error){
      console.error('Comments join error:', res.error);
      // Fallback without join (Part 8 Fix 3: explicit columns, no select('*'))
      const fb = await db.from('comments').select('id,user_id,text,created_at').eq('post_id',pid).order('created_at',{ascending:true}).limit(100);
      if(!fb.error && fb.data){
        const userIds = [...new Set(fb.data.map(c => c.user_id))];
        if(userIds.length){
          const { data: profData } = await db.from('profiles').select('id,username,avatar_url').in('id', userIds);
          const profMap = {};
          (profData || []).forEach(p => { profMap[p.id] = p; });
          cmts = fb.data.map(c => ({ ...c, profiles: profMap[c.user_id] || { username: 'user' } }));
        }
      }
    } else {
      cmts = res.data || [];
    }
  } catch(e) { console.error('Comments error:', e); }

  // Fetch comment likes
  const cmtIds = (cmts||[]).map(c=>c.id);
  let myLikedCmts = new Set();
  if(cmtIds.length) {
    const { data: cl } = await db.from('comment_likes').select('comment_id').eq('user_id', ME.id).in('comment_id', cmtIds);
    (cl||[]).forEach(x => myLikedCmts.add(x.comment_id));
  }

  body.innerHTML=`
    <div style="padding:0 0 80px">
      ${!(cmts?.length)?'<div style="text-align:center;color:#444;padding:40px">Pehla comment karo! 💬</div>'
      :(cmts||[]).map(c=>{
        const isLiked = myLikedCmts.has(c.id);
        return `<div style="display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #0d0d0d">
          <div onclick="closeModal();goToProfile('${c.user_id}')" style="cursor:pointer">${av(c.profiles?.avatar_url,c.profiles?.username,34)}</div>
          <div style="flex:1">
            <span style="font-weight:700;font-size:13px">${esc(c.profiles?.username)} </span>
            <span style="font-size:13px;color:#ddd">${esc(c.text)}</span>
            <div style="color:#444;font-size:11px;margin-top:3px">${ago(c.created_at)}</div>
          </div>
          <div onclick="toggleCommentLike('${c.id}', this)" data-liked="${isLiked}" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;">
            <span style="font-size:14px;">${isLiked?'❤️':'🤍'}</span>
          </div>
        </div>`}).join('')}
    </div>
    <div style="position:sticky;bottom:0;background:#0d0d0d;padding:10px 14px;border-top:1px solid #1a1a1a;display:flex;gap:10px">
      <input id="ci-${pid}" placeholder="Comment likhao..." style="flex:1;background:#111;border:1px solid #222;border-radius:24px;padding:12px 16px;color:#fff;font-size:14px;outline:none" onkeydown="if(event.key==='Enter')sendCmt('${pid}')">
      <div onclick="sendCmt('${pid}')" style="width:46px;height:46px;border-radius:50%;background:${GRAD};display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${ico('send')}</div>
    </div>`;
}

async function toggleCommentLike(cmid, btn) {
  const isLiked = btn.dataset.liked === 'true';
  btn.dataset.liked = !isLiked;
  btn.innerHTML = `<span style="display:inline-flex;align-items:center">${!isLiked?ico('heartf','#FF2D7A',14):ico('heart','#888',14)}</span>`;
  if(!isLiked) {
    await db.from('comment_likes').insert({ user_id: ME.id, comment_id: cmid });
    try {
      const { data: cmt } = await db.from('comments').select('user_id, post_id').eq('id', cmid).single();
      if(cmt && cmt.user_id !== ME.id){
        await sendNotif(cmt.user_id, 'comment_like', {post_id: cmt.post_id, comment_id: cmid, message: 'liked your comment'});
      }
    } catch(e) {}
  } else {
    await db.from('comment_likes').delete().eq('user_id', ME.id).eq('comment_id', cmid);
  }
}

async function sendCmt(pid){
  if(isBannedClient()) return;
  const inp=document.getElementById('ci-'+pid);if(!inp)return;
  const txt=inp.value.trim();if(!txt)return;
  inp.value='';
  try {
    await db.from('comments').insert({user_id:ME.id,post_id:pid,text:txt}).throwOnError();
  } catch(e) {
    // Part 12 Fix: Handle server-side rate-limit errors with friendly message
    if(e.message?.includes('RATE_LIMIT_EXCEEDED')) {
      const friendlyMsg = e.message.split('RATE_LIMIT_EXCEEDED:')[1]?.trim() || 'You are commenting too fast. Please wait a moment.';
      toast(friendlyMsg);
    } else {
      toast('Comment post nahi hua 😕');
    }
    return; // Don't proceed to notifications/refresh if insert failed
  }
  const { data: postData } = await db.from('posts').select('user_id').eq('id', pid).single();
  const owner = postData?.user_id;
  if(owner && owner !== ME.id){
    await sendNotif(owner, 'comment', {post_id: pid, message: txt.slice(0,60)});
  }
  openComments(pid);
}
