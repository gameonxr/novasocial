// Blocked-accounts list renderer.
async function showBlockedList() {
  const m = modal('Blocked Accounts');
  const body = m.querySelector('#mbody');
  body.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';
  const { data } = await db.from('blocks').select('blocked_id, profiles!blocks_blocked_id_fkey(username, avatar_url, id)').eq('blocker_id', ME.id);
  const blocked = (data || []).map(d => d.profiles).filter(Boolean);
  if(!blocked.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:#555">No blocked accounts.</div>';
    return;
  }
  body.innerHTML = blocked.map(u => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #0d0d0d">
      ${av(u.avatar_url, u.username, 40)}
      <div style="flex:1"><div style="font-weight:700;font-size:14px">${u.username}</div></div>
      <button onclick="unblockUser('${u.id}', this)" style="background:#262626;border:none;border-radius:8px;color:#fff;font-size:12px;padding:8px 14px;cursor:pointer">Unblock</button>
    </div>
  `).join('');
}
