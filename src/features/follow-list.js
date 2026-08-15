/**
 * NovaSocial Follow List feature.
 *
 * Extracted as a classic script so follower/following modal actions remain
 * window-global; full profile and bidirectional block checks stay inline.
 */
// ── FOLLOW LIST ──────────────────────────────────────
// ── INSTAGRAM STYLE FOLLOW LIST ──────────────────────────────────────
async function showFollowList(userId, type) {
  const m = modal(type === 'followers' ? 'Followers' : 'Following');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  let fk, uk;
  if (type === 'followers') {
    fk = 'following_id'; // userId is being followed
    uk = 'follower_id';  // fetch the followers
  } else {
    fk = 'follower_id';  // userId is following
    uk = 'following_id'; // fetch the following
  }

  const { data } = await db.from('follows').select(`profiles!follows_${uk}_fkey(username, avatar_url, id)`).eq(fk, userId);
  const users = (data || []).map(d => d.profiles).filter(Boolean);

  if(!users.length) {
    body.innerHTML = `<div style="text-align:center;padding:40px;color:#555">No ${type} yet.</div>`;
    return;
  }

  body.innerHTML = users.map(u => `
    <div onclick="closeModal();showUserProfile('${u.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #0d0d0d;cursor:pointer">
      ${av(u.avatar_url, u.username, 40)}
      <div style="flex:1"><div style="font-weight:700;font-size:14px">${u.username}</div></div>
    </div>
  `).join('');
}

async function quickFollowFromList(uid, btn) {
  const wasFollowing = btn.textContent.trim() === 'Following';
  const newFollowing = !wasFollowing;
  btn.textContent = newFollowing ? 'Following' : 'Follow';
  btn.className = newFollowing ? 'bout' : 'bgrd';
  try {
    if(newFollowing) {
      await db.from('follows').insert({follower_id: ME.id, following_id: uid});
      await sendNotif(uid, 'follow', {message: `started following you`});
    } else {
      await db.from('follows').delete().eq('follower_id', ME.id).eq('following_id', uid);
    }
  } catch(e) { toast('Error'); }
}
