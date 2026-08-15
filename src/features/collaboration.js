/**
 * NovaSocial Collaborative Posts/co-author picker.
 *
 * Extracted as a classic script so create-modal collaboration controls stay
 * window-global while Smart Replies and core chat code remain inline.
 */
// COLLABORATIVE POSTS (Futuristic - Co-author)
// ═══════════════════════════════════════════════════════════════════════
async function showCollabPicker(){
  const m = modal('🤝 Add Co-Author');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  const { data: following } = await db.from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)').eq('follower_id', ME.id);
  const users = (following||[]).map(f=>f.profiles).filter(Boolean);

  if(!users.length){
    body.innerHTML = `
      <div style="padding:30px;text-align:center;color:#666">
        <div style="font-size:42px;margin-bottom:12px">🤝</div>
        <div style="font-weight:700;color:#fff;margin-bottom:6px">No followings</div>
        <div style="font-size:13px">Follow someone first to add them as co-author</div>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div style="padding:14px">
      <div style="background:rgba(0,149,246,0.08);border:1px solid rgba(0,149,246,0.2);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:4px">🤝 Collaborative Post</div>
        <div style="font-size:11px;color:#aaa">Post tumhare aur co-author dono ke profile pe show hoga</div>
      </div>
      <input id="collab-search" placeholder="Search..." oninput="filterCollabList(this.value)" class="inp" style="margin-bottom:12px">
      <div id="collab-list" style="max-height:50vh;overflow-y:auto">
        ${users.map(u=>`
          <div onclick="selectCollab('${u.id}','${u.username}')" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d;cursor:pointer">
            ${av(u.avatar_url, u.username, 40)}
            <div style="flex:1">
              <div style="font-weight:600;font-size:14px;color:#fff">${u.username}</div>
            </div>
            <div style="color:#555;font-size:18px">›</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  window._collabUsers = users;
}

function filterCollabList(q){
  const list = document.getElementById('collab-list');
  if(!list || !window._collabUsers) return;
  const filtered = window._collabUsers.filter(u=>u.username.toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = filtered.map(u=>`
    <div onclick="selectCollab('${u.id}','${u.username}')" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d;cursor:pointer">
      ${av(u.avatar_url, u.username, 40)}
      <div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">${u.username}</div></div>
      <div style="color:#555;font-size:18px">›</div>
    </div>
  `).join('') || '<div style="text-align:center;padding:20px;color:#555">No match</div>';
}

function selectCollab(uid, uname){
  window._collabAuthor = {id:uid, username:uname};
  toast('🤝 Co-author: @'+uname);
  closeModal();
  // Update create modal to show co-author
  const cbtn = document.getElementById('cbtn');
  if(cbtn) cbtn.textContent = 'Share with Co-Author';
}
