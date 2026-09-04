// loadReportsList — extracted from index.html
// Owner SHA-256: d384da16c84310241bb272662421b1d4c5a99e2a8faf3cf0c92b30be45ac1ed1
// Classic script — exposes window.loadReportsList

window.loadReportsList = async function loadReportsList(){
  const listEl = document.getElementById('admin-reports-list');
  if(!listEl) return;
  try {
    let q = db.from('reports').select('id,target_type,target_id,reason,details,status,created_at,reporter_id').order('created_at',{ascending:false}).limit(100);
    if(_reportsFilter!=='all') q=q.eq('status',_reportsFilter);
    const {data:reports,error} = await q;
    if(error) throw error;
    if(!reports||reports.length===0){ listEl.innerHTML=`<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No ${_reportsFilter} reports</div>`; return; }

    // 📦 Fetch actual content for each report target in parallel
    // Group target IDs by type
    const targetIds = { post: [], comment: [], message: [], story: [], reel: [], user: [] };
    reports.forEach(r => {
      if(r.target_type && targetIds[r.target_type] && r.target_id){
        targetIds[r.target_type].push(r.target_id);
      }
    });

    const targetData = {};
    const userMap = {};

    // Fetch content for each target type in parallel
    await Promise.all(Object.entries(targetIds).map(async ([type, ids]) => {
      if(ids.length === 0) return;
      try {
        if(type === 'user'){
          const { data } = await db.from('profiles').select('id,username,avatar_url,full_name').in('id', ids);
          (data || []).forEach(u => { targetData['user_'+u.id] = u; });
        } else if(type === 'post' || type === 'reel'){
          const { data } = await db.from('posts').select('id,caption,media_url,media_type,user_id').in('id', ids);
          (data || []).forEach(p => { targetData['post_'+p.id] = p; });
        } else if(type === 'comment'){
          const { data } = await db.from('comments').select('id,text,user_id,post_id').in('id', ids);
          (data || []).forEach(c => { targetData['comment_'+c.id] = c; });
        } else if(type === 'message'){
          const { data } = await db.from('messages').select('id,text,sender_id,media_type').in('id', ids);
          (data || []).forEach(m => { targetData['message_'+m.id] = m; });
        } else if(type === 'story'){
          const { data } = await db.from('stories').select('id,media_url,media_type,user_id').in('id', ids);
          (data || []).forEach(s => { targetData['story_'+s.id] = s; });
        }
      } catch(e) { console.log('Fetch '+type+' failed:', e); }
    }));

    // Fetch all unique user IDs (from target content + reporter IDs)
    const allUserIds = new Set();
    Object.values(targetData).forEach(t => { if(t.user_id) allUserIds.add(t.user_id); if(t.sender_id) allUserIds.add(t.sender_id); });
    reports.forEach(r => { if(r.reporter_id) allUserIds.add(r.reporter_id); });
    if(allUserIds.size > 0){
      try {
        const { data: users } = await db.from('profiles').select('id,username,avatar_url').in('id', [...allUserIds]);
        (users || []).forEach(u => { userMap[u.id] = u; });
      } catch(e) {}
    }

    listEl.innerHTML = reports.map(r => {
      const target = targetData[r.target_type+'_'+r.target_id];
      const reporter = r.reporter_id ? userMap[r.reporter_id] : null;

      // Build content preview based on target type
      let contentPreview = '';
      let contentAuthor = '';
      if(r.target_type === 'user'){
        const u = target;
        contentPreview = `@${esc(u?.username || 'unknown')}`;
        contentAuthor = u?.full_name ? esc(u.full_name) : '';
      } else if(r.target_type === 'post' || r.target_type === 'reel'){
        const p = target;
        contentPreview = p?.caption ? esc(p.caption.substring(0, 150)) : (p?.media_url ? '[Media post]' : '[Post deleted]');
        const author = p?.user_id ? userMap[p.user_id] : null;
        contentAuthor = author ? `@${esc(author.username)}` : '';
      } else if(r.target_type === 'comment'){
        const c = target;
        contentPreview = c?.text ? esc(c.text.substring(0, 150)) : '[Comment deleted]';
        const author = c?.user_id ? userMap[c.user_id] : null;
        contentAuthor = author ? `@${esc(author.username)}` : '';
      } else if(r.target_type === 'message'){
        const m = target;
        contentPreview = m?.text ? esc(m.text.substring(0, 150)) : (m?.media_type ? `[${m.media_type} message]` : '[Message deleted]');
        const author = m?.sender_id ? userMap[m.sender_id] : null;
        contentAuthor = author ? `@${esc(author.username)}` : '';
      } else if(r.target_type === 'story'){
        const s = target;
        contentPreview = s?.media_url ? `[${s.media_type || 'media'} story]` : '[Story expired]';
        const author = s?.user_id ? userMap[s.user_id] : null;
        contentAuthor = author ? `@${esc(author.username)}` : '';
      }

      return `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:800;color:#FF2D7A;background:rgba(255,45,122,0.15);padding:3px 8px;border-radius:6px;text-transform:uppercase">${esc(r.target_type)}</span>
            <span style="font-size:10px;font-weight:700;color:#ffaa00;background:rgba(255,170,0,0.1);padding:3px 8px;border-radius:6px;text-transform:uppercase">${esc(r.reason)}</span>
            <span style="font-size:10px;font-weight:700;color:${r.status==='pending'?'#ffaa00':r.status==='resolved'?'#3db83d':'#8A8A8A'};text-transform:uppercase">${esc(r.status)}</span>
          </div>
          <span style="font-size:10px;color:#8A8A8A">${new Date(r.created_at).toLocaleDateString()}</span>
        </div>

        <!-- Reporter info -->
        ${reporter ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:11px;color:#8A8A8A">${av(reporter.avatar_url, reporter.username, 20)} Reported by @${esc(reporter.username)}</div>` : ''}

        <!-- Content preview — what was reported -->
        <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="font-size:10px;color:#8A8A8A;font-weight:700;margin-bottom:4px;text-transform:uppercase">Reported Content</div>
          ${contentAuthor ? `<div style="font-size:11px;color:#00E5FF;font-weight:600;margin-bottom:4px">${contentAuthor}</div>` : ''}
          <div style="font-size:13px;color:#fff;line-height:1.4;word-break:break-word">${contentPreview}</div>
        </div>

        ${r.details?`<div style="font-size:11px;color:#8A8A8A;margin-bottom:8px;font-style:italic">"${esc(r.details)}"</div>`:''}

        <div style="display:flex;gap:6px">
          <button onclick="showReportDetail('${r.id}')" style="flex:2;padding:8px;background:rgba(255,45,122,0.1);border:1px solid #FF2D7A;border-radius:8px;color:#FF2D7A;font-size:11px;font-weight:700;cursor:pointer">View Full Details</button>
          ${r.status==='pending'?`
          <button onclick="adminResolveReport('${r.id}','${r.reporter_id||''}','${esc(r.reason).replace(/'/g,"\\'")}')" style="flex:1;padding:8px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:8px;color:#3db83d;font-size:11px;font-weight:700;cursor:pointer">Resolve</button>
          <button onclick="adminDismissReport('${r.id}','${r.reporter_id||''}')" style="flex:1;padding:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Dismiss</button>
          `:''}
        </div>
      </div>`;
    }).join('');
  } catch(e) { listEl.innerHTML=`<div style="padding:20px;text-align:center;color:#FF2D7A;font-size:12px">Failed: ${e.message||'error'}</div>`; }
};
