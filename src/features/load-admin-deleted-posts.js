// loadAdminDeletedPosts — extracted from index.html
// Owner SHA-256: f5a4757b8058c7495c40364038d936d335b76081a18bc5eff4731d4c20532da1
// Classic script — exposes window.loadAdminDeletedPosts

window.loadAdminDeletedPosts = async function loadAdminDeletedPosts() {
  const content = document.getElementById('admin-content');
  if(!content) return;

  try {
    const { data: deletedPosts, error } = await db
      .from('posts')
      .select('id, media_url, media_type, caption, deleted_at, auto_purge_at, deleted_by, profiles!posts_user_id_fkey(username)')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false })
      .limit(50);

    if(error) throw error;

    content.innerHTML = `
      <div style="padding:12px 0">
        <div style="font-size:13px;font-weight:700;color:#8A8A8A;letter-spacing:1px;margin-bottom:12px">
          🗑️ DELETED POSTS (Recoverable — 30 days)
        </div>
        ${!deletedPosts?.length
          ? '<div style="text-align:center;color:#444;padding:40px">Koi deleted post nahi hai ✅</div>'
          : deletedPosts.map(p => {
              const purgeDate = p.auto_purge_at ? new Date(p.auto_purge_at) : null;
              const daysLeft = purgeDate ? Math.max(0, Math.ceil((purgeDate - new Date()) / (1000*60*60*24))) : '?';
              const safeCaption = (p.caption || '').substring(0, 60);
              return `
              <div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,193,7,0.15);border-radius:14px">
                ${p.media_url ? `<img src="${p.media_url}" style="width:56px;height:56px;border-radius:10px;object-fit:cover" onerror="this.style.display='none'">` : '<div style="width:56px;height:56px;border-radius:10px;background:#111;display:flex;align-items:center;justify-content:center">📷</div>'}
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:600">@${p.profiles?.username || '?'}</div>
                  <div style="font-size:11px;color:#8A8A8A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(safeCaption) || 'No caption'}</div>
                  <div style="font-size:11px;color:#8A8A8A;margin-top:2px">Deleted ${ago(p.deleted_at)} ago</div>
                  <div style="font-size:11px;color:#ffc107;margin-top:2px">⏳ ${daysLeft} din baad permanently delete hoga</div>
                </div>
                <div onclick="adminRecoverPost('${p.id}')" style="padding:8px 12px;background:rgba(61,184,61,0.15);border:1px solid rgba(61,184,61,0.3);border-radius:10px;color:#3db83d;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">
                  ↩️ Recover
                </div>
              </div>`;
            }).join('')}
      </div>`;
  } catch(e) {
    content.innerHTML = `<div style="text-align:center;color:#FF2D7A;padding:40px;font-size:13px">Error: ${esc(e.message || 'unknown')}</div>`;
  }
};
