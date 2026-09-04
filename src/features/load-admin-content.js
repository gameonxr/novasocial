// loadAdminContent — extracted from index.html
// Owner SHA-256: c94a73a08cd85fef18110039ad33422d2440c139b8aa84f436310acf5eb1caf4
// Classic script — exposes window.loadAdminContent

window.loadAdminContent = async function loadAdminContent(type){
  _contentType = type;
  // Update tab styles
  ['posts','comments','stories'].forEach(t => {
    const el = document.getElementById('ct-'+t);
    if(!el) return;
    if(t === type){ el.style.background='rgba(0,229,255,0.15)'; el.style.border='1px solid #00E5FF'; el.style.color='#00E5FF'; }
    else { el.style.background='rgba(255,255,255,0.04)'; el.style.border='1px solid rgba(255,255,255,0.06)'; el.style.color='#8A8A8A'; }
  });
  const listEl = document.getElementById('admin-content-list');
  if(!listEl) return;
  try {
    let items = [], users = [];
    if(type === 'posts'){
      const {data,error} = await db.from('posts').select('id,caption,media_url,media_type,user_id,created_at,likes_count,comments_count').order('created_at',{ascending:false}).limit(50);
      if(error) throw error;
      items = data || [];
      const uids = [...new Set(items.map(i=>i.user_id).filter(Boolean))];
      if(uids.length){ const {data:u} = await db.from('profiles').select('id,username,avatar_url').in('id',uids); users = u||[]; }
    } else if(type === 'comments'){
      const {data,error} = await db.from('comments').select('id,text,user_id,post_id,created_at').order('created_at',{ascending:false}).limit(50);
      if(error) throw error;
      items = data || [];
      const uids = [...new Set(items.map(i=>i.user_id).filter(Boolean))];
      if(uids.length){ const {data:u} = await db.from('profiles').select('id,username,avatar_url').in('id',uids); users = u||[]; }
    } else if(type === 'stories'){
      const {data,error} = await db.from('stories').select('id,media_url,media_type,user_id,created_at').order('created_at',{ascending:false}).limit(50);
      if(error) throw error;
      items = data || [];
      const uids = [...new Set(items.map(i=>i.user_id).filter(Boolean))];
      if(uids.length){ const {data:u} = await db.from('profiles').select('id,username,avatar_url').in('id',uids); users = u||[]; }
    }
    const userMap = {}; users.forEach(u => userMap[u.id] = u);
    if(items.length === 0){ listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No content</div>'; return; }
    listEl.innerHTML = items.map(item => {
      const u = userMap[item.user_id] || {};
      let preview = '';
      if(type === 'posts') preview = item.caption ? esc(item.caption.substring(0,120)) : (item.media_url ? `[${item.media_type||'media'}]` : '[no content]');
      else if(type === 'comments') preview = esc(item.text?.substring(0,120) || '');
      else if(type === 'stories') preview = `[${item.media_type||'media'} story]`;
      return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          ${av(u.avatar_url,u.username,28)}
          <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;color:#fff">${esc(u.username)||'unknown'}</div><div style="font-size:10px;color:#8A8A8A">${new Date(item.created_at).toLocaleString()}</div></div>
        </div>
        <div style="font-size:13px;color:#ddd;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:8px;margin-bottom:8px;line-height:1.4">${preview}</div>
        <div style="display:flex;gap:6px">
          <button onclick="adminDeleteAnyContent('${item.id}','${type}','${esc(u.username||'').replace(/'/g,"\\'")}','${u.id||''}')" style="flex:1;padding:8px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">${ico('trash','#ff4444',14)} Delete</button>
          ${u.id?`<button onclick="adminBanUser('${u.id}','${esc(u.username||'').replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:8px;color:#ffaa00;font-size:11px;font-weight:700;cursor:pointer">Ban User</button>`:''}
        </div>
      </div>`;
    }).join('');
  } catch(e) { listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`; }
};
