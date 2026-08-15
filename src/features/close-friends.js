/**
 * NovaSocial Close Friends manager.
 *
 * Extracted as a classic script so inline profile controls keep calling the
 * manager and toggle handlers through window globals.
 */
// CLOSE FRIENDS MANAGER (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
async function showCloseFriendsManager(){
  const m = modal('⭐ Close Friends');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  // Get following list
  const { data: following } = await db.from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)').eq('follower_id', ME.id);

  // Get current close friends (stored in profile as JSON array)
  let cfIds = [];
  try { cfIds = JSON.parse(PROF.close_friends || '[]'); } catch(e) {}
  const cfSet = new Set(cfIds);

  const users = (following||[]).map(f=>f.profiles).filter(Boolean);

  if(!users.length){
    body.innerHTML = `
      <div style="padding:30px;text-align:center;color:#666">
        <div style="font-size:42px;margin-bottom:12px">👥</div>
        <div style="font-weight:700;color:#fff;margin-bottom:6px">Koi following nahi</div>
        <div style="font-size:13px">Pehle logon ko follow karo, phir close friends add karo</div>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div style="padding:14px">
      <div style="background:rgba(225,48,108,0.08);border:1px solid rgba(225,48,108,0.2);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:4px">⭐ Close Friends</div>
        <div style="font-size:11px;color:#aaa">Sirf in logon ko apni close-friends-only stories dikhegi</div>
      </div>
      <div style="max-height:50vh;overflow-y:auto">
        ${users.map(u=>`
          <div id="cf-${u.id}" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d">
            ${av(u.avatar_url, u.username, 40)}
            <div style="flex:1">
              <div style="font-weight:600;font-size:14px;color:#fff">${u.username}</div>
            </div>
            <button onclick="toggleCloseFriend('${u.id}')" class="${cfSet.has(u.id)?'bgrd':'bout'}" style="width:auto;padding:7px 14px;font-size:12px" id="cfbtn-${u.id}">${cfSet.has(u.id)?'⭐ Added':'Add'}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function toggleCloseFriend(uid){
  let cfIds = [];
  try { cfIds = JSON.parse(PROF.close_friends || '[]'); } catch(e) {}
  const idx = cfIds.indexOf(uid);
  if(idx >= 0){
    cfIds.splice(idx, 1);
    toast('Removed from close friends');
  } else {
    cfIds.push(uid);
    toast('⭐ Added to close friends');
  }
  try {
    await db.from('profiles').update({close_friends: JSON.stringify(cfIds)}).eq('id', ME.id);
    PROF.close_friends = JSON.stringify(cfIds);
    const btn = document.getElementById('cfbtn-'+uid);
    if(btn){
      if(cfIds.includes(uid)){
        btn.className = 'bgrd';
        btn.textContent = '⭐ Added';
      } else {
        btn.className = 'bout';
        btn.textContent = 'Add';
      }
    }
  } catch(e) {
    toast('Error: '+e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
