// doSearchMessages — extracted from index.html
// Owner SHA-256: 8f0af1874651e7218620696b0ff6e3b0af103b95bfb064394dc94f34dff8ce01
// Classic script — exposes window.doSearchMessages

window.doSearchMessages = async function doSearchMessages(cid, q) {
  const r = document.getElementById('search-results');
  if(!r) return;
  if(!q.trim()) {
    r.innerHTML = '<div style="color:#444;text-align:center;padding:40px 20px;font-size:13px;">Search karna shuru karo...</div>';
    return;
  }
  r.innerHTML = '<div class="ldiv"><div class="spin"></div></div>';

  const {data:msgs} = await db.from('messages').select('*').eq('conversation_id',cid).ilike('text',`%${q}%`).order('created_at',{ascending:false}).limit(30);

  if(!msgs?.length){
    r.innerHTML = '<div style="color:#444;text-align:center;padding:40px 20px;font-size:13px;">Koi message nahi mila 😕</div>';
    return;
  }

  r.innerHTML = msgs.map(x => `
    <div onclick="jumpToMessage('${x.id}')" style="padding:14px 16px;border-bottom:1px solid #111;cursor:pointer;">
      <div style="color:#fff;font-size:14px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${x.text || '[Media]'}</div>
      <div style="color:#666;font-size:11px;">${ago(x.created_at)}</div>
    </div>
  `).join('');
};
