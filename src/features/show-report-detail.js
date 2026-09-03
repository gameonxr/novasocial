// showReportDetail — extracted from index.html
// Owner SHA-256: 23d7cf180fd8ea8c96cb88097f3ebced6ed7eff5b6efe638f69f1190fb133466
// Classic script — exposes window.showReportDetail

window.showReportDetail = async function showReportDetail(reportId){
  const m = modal('Report Details');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:40px;display:flex;justify-content:center"><div class="spin" style="width:28px;height:28px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>`;

  try {
    // 1. Fetch the report
    const { data: report, error: rErr } = await db.from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    if(rErr) throw rErr;
    if(!report){ body.innerHTML = '<div style="padding:30px;text-align:center;color:#FF2D7A">Report not found</div>'; return; }

    // 2. Fetch ALL reports on the same target (multiple reporters)
    const { data: allReportsOnTarget } = await db.from('reports')
      .select('id, reporter_id, reason, details, status, created_at')
      .eq('target_type', report.target_type)
      .eq('target_id', report.target_id)
      .order('created_at', { ascending: false });

    // 3. Fetch the target content (real data)
    let targetContent = null;
    let targetAuthorId = null;
    if(report.target_type === 'post' || report.target_type === 'reel'){
      const { data } = await db.from('posts').select('id,caption,media_url,media_type,user_id,created_at,likes_count,comments_count,views_count').eq('id', report.target_id).single();
      targetContent = data;
      targetAuthorId = data?.user_id;
    } else if(report.target_type === 'comment'){
      const { data } = await db.from('comments').select('id,text,user_id,post_id,created_at').eq('id', report.target_id).single();
      targetContent = data;
      targetAuthorId = data?.user_id;
    } else if(report.target_type === 'message'){
      const { data } = await db.from('messages').select('id,text,sender_id,media_type,media_url,created_at').eq('id', report.target_id).single();
      targetContent = data;
      targetAuthorId = data?.sender_id;
    } else if(report.target_type === 'story'){
      const { data } = await db.from('stories').select('id,media_url,media_type,user_id,created_at').eq('id', report.target_id).single();
      targetContent = data;
      targetAuthorId = data?.user_id;
    } else if(report.target_type === 'user'){
      targetAuthorId = report.target_id;
    }

    // 4. Fetch author profile (who created the reported content)
    let authorProfile = null;
    if(targetAuthorId){
      const { data } = await db.from('profiles').select('id,username,avatar_url,full_name,is_verified,is_banned,is_msg_banned,created_at,followers_count,posts_count').eq('id', targetAuthorId).single();
      authorProfile = data;
    }

    // 5. Fetch ALL reporter profiles (unique reporters)
    const reporterIds = [...new Set((allReportsOnTarget||[]).map(r => r.reporter_id).filter(Boolean))];
    const reporterMap = {};
    if(reporterIds.length > 0){
      const { data: reporters } = await db.from('profiles').select('id,username,avatar_url,full_name,created_at').in('id', reporterIds);
      (reporters || []).forEach(r => reporterMap[r.id] = r);
    }

    // 6. Fetch reporter credibility — how many reports has the MAIN reporter filed?
    let reporterStats = {};
    for(const rid of reporterIds){
      try {
        const { count: totalFiled } = await db.from('reports').select('id', { count: 'exact', head: true }).eq('reporter_id', rid);
        const { count: resolved } = await db.from('reports').select('id', { count: 'exact', head: true }).eq('reporter_id', rid).eq('status', 'resolved');
        const { count: dismissed } = await db.from('reports').select('id', { count: 'exact', head: true }).eq('reporter_id', rid).eq('status', 'dismissed');
        reporterStats[rid] = { total: totalFiled || 0, resolved: resolved || 0, dismissed: dismissed || 0 };
      } catch(e) {}
    }

    // 7. Fetch author's report history (how many reports against them?)
    let authorReportCount = 0;
    if(targetAuthorId){
      try {
        const { count } = await db.from('reports').select('id', { count: 'exact', head: true }).eq('target_type', 'user').eq('target_id', targetAuthorId);
        authorReportCount = count || 0;
      } catch(e) {}
    }

    // ─── RENDER ───
    const statusColor = report.status === 'pending' ? '#ffaa00' : report.status === 'resolved' ? '#3db83d' : '#8A8A8A';

    body.innerHTML = `
      <div style="padding:0">
        <!-- Status Header -->
        <div style="background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1));padding:16px;border-bottom:1px solid rgba(255,255,255,0.08)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:11px;color:#8A8A8A;font-weight:700;text-transform:uppercase">Report #${report.id.substring(0,8)}</div>
              <div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">${esc(report.target_type.toUpperCase())} · ${esc(report.reason)}</div>
            </div>
            <span style="font-size:11px;font-weight:800;color:${statusColor};background:${statusColor}26;padding:4px 10px;border-radius:8px;text-transform:uppercase">${esc(report.status)}</span>
          </div>
          <div style="font-size:11px;color:#8A8A8A;margin-top:6px">Filed ${new Date(report.created_at).toLocaleString()}</div>
        </div>

        <div style="padding:16px;display:flex;flex-direction:column;gap:14px">

          <!-- 📦 REPORTED CONTENT (full view) -->
          <div>
            <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;text-transform:uppercase">Reported Content</div>
            <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:14px">
              ${targetContent ? `
                ${report.target_type === 'post' || report.target_type === 'reel' ? `
                  ${targetContent.media_url ? `
                    <div style="margin-bottom:10px;border-radius:10px;overflow:hidden;background:#111">
                      ${targetContent.media_type === 'video'
                        ? `<video src="${esc(targetContent.media_url)}" style="width:100%;max-height:300px;object-fit:cover" controls></video>`
                        : `<img src="${esc(targetContent.media_url)}" style="width:100%;max-height:300px;object-fit:cover" loading="lazy" decoding="async" onclick="viewChatImage('${esc(targetContent.media_url)}')">`
                      }
                    </div>
                  ` : ''}
                  ${targetContent.caption ? `<div style="font-size:13px;color:#fff;line-height:1.5;margin-bottom:8px">${esc(targetContent.caption)}</div>` : '<div style="font-size:12px;color:#666">[No caption]</div>'}
                  <div style="display:flex;gap:12px;font-size:11px;color:#8A8A8A;margin-top:8px">
                    <span>❤️ ${targetContent.likes_count || 0}</span>
                    <span>💬 ${targetContent.comments_count || 0}</span>
                    <span>👁️ ${targetContent.views_count || 0}</span>
                    <span style="margin-left:auto">${new Date(targetContent.created_at).toLocaleDateString()}</span>
                  </div>
                ` : ''}
                ${report.target_type === 'comment' ? `
                  <div style="font-size:14px;color:#fff;line-height:1.5">${esc(targetContent.text)}</div>
                  <div style="font-size:11px;color:#8A8A8A;margin-top:8px">On post: ${targetContent.post_id?.substring(0,8) || '?'}</div>
                ` : ''}
                ${report.target_type === 'message' ? `
                  ${targetContent.media_url ? `<div style="margin-bottom:8px"><img src="${esc(targetContent.media_url)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px" loading="lazy" decoding="async"></div>` : ''}
                  <div style="font-size:14px;color:#fff;line-height:1.5">${esc(targetContent.text || '['+targetContent.media_type+' message]')}</div>
                ` : ''}
                ${report.target_type === 'story' ? `
                  ${targetContent.media_url ? `<div><${targetContent.media_type === 'video' ? 'video' : 'img'} src="${esc(targetContent.media_url)}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px" ${targetContent.media_type === 'video' ? 'controls' : 'onclick="viewChatImage(\''+esc(targetContent.media_url)+'\')"'}></div>` : '<div style="color:#666">[Story expired]</div>'}
                ` : ''}
              ` : '<div style="color:#666;font-size:13px">[Content no longer exists — may have been deleted]</div>'}
            </div>
          </div>

          <!-- 👤 CONTENT AUTHOR (who created the reported content) -->
          ${authorProfile ? `
          <div>
            <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;text-transform:uppercase">Content Author ${report.target_type === 'user' ? '(Reported User)' : ''}</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                ${av(authorProfile.avatar_url, authorProfile.username, 48)}
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <span style="font-weight:700;font-size:15px;color:#fff">${esc(authorProfile.username)}</span>
                    ${authorProfile.is_verified ? ico('verified','#3897f0',14) : ''}
                    ${authorProfile.is_banned ? '<span style="font-size:9px;font-weight:800;color:#ff4444;background:rgba(255,68,68,0.15);padding:2px 6px;border-radius:6px">BANNED</span>' : ''}
                    ${authorProfile.is_msg_banned ? '<span style="font-size:9px;font-weight:800;color:#ffaa00;background:rgba(255,170,0,0.15);padding:2px 6px;border-radius:6px">MSG-BANNED</span>' : ''}
                  </div>
                  <div style="font-size:12px;color:#8A8A8A">${esc(authorProfile.full_name || '')}</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px">
                <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px;text-align:center"><div style="font-size:16px;font-weight:800;color:#00E5FF">${authorProfile.posts_count || 0}</div><div style="font-size:9px;color:#8A8A8A">POSTS</div></div>
                <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px;text-align:center"><div style="font-size:16px;font-weight:800;color:#FF2D7A">${authorProfile.followers_count || 0}</div><div style="font-size:9px;color:#8A8A8A">FOLLOWERS</div></div>
                <div style="background:rgba(255,68,68,0.1);border-radius:8px;padding:8px;text-align:center"><div style="font-size:16px;font-weight:800;color:#ff4444">${authorReportCount}</div><div style="font-size:9px;color:#8A8A8A">REPORTS</div></div>
              </div>
              <div style="font-size:10px;color:#8A8A8A;margin-bottom:8px">Joined: ${authorProfile.created_at ? new Date(authorProfile.created_at).toLocaleDateString() : 'Unknown'} · ID: ${authorProfile.id?.substring(0,8)}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button onclick="closeModal();showAdminUserDetail('${authorProfile.id}')" style="padding:8px 12px;background:rgba(255,45,122,0.1);border:1px solid #FF2D7A;border-radius:8px;color:#FF2D7A;font-size:11px;font-weight:700;cursor:pointer">Full Profile</button>
                ${report.target_type !== 'user' ? `<button onclick="closeModal();adminBanUser('${authorProfile.id}','${esc(authorProfile.username||'').replace(/'/g,"\\'")}')" style="padding:8px 12px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">Ban Author</button>` : ''}
                ${report.target_type === 'post' || report.target_type === 'reel' ? `<button onclick="adminDeleteContentFromReport('${report.target_id}','${report.target_type}','${esc(authorProfile.username||'').replace(/'/g,"\\'")}','${authorProfile.id}')" style="padding:8px 12px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;font-size:11px;font-weight:700;cursor:pointer">Delete Content</button>` : ''}
              </div>
            </div>
          </div>
          ` : ''}

          <!-- 🚩 ALL REPORTERS (everyone who reported this content) -->
          <div>
            <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;text-transform:uppercase">Reporters (${(allReportsOnTarget||[]).length} total)</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${(allReportsOnTarget||[]).map((r, i) => {
                const reporter = reporterMap[r.reporter_id] || {};
                const stats = reporterStats[r.reporter_id] || { total: 0, resolved: 0, dismissed: 0 };
                const credibility = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100;
                const credColor = credibility >= 70 ? '#3db83d' : credibility >= 40 ? '#ffaa00' : '#ff4444';
                return `
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                    ${av(reporter.avatar_url, reporter.username, 32)}
                    <div style="flex:1;min-width:0">
                      <div style="font-size:13px;font-weight:700;color:#fff">${esc(reporter.username || 'unknown')}</div>
                      <div style="font-size:10px;color:#8A8A8A">${new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <span style="font-size:9px;font-weight:800;color:${r.status==='pending'?'#ffaa00':r.status==='resolved'?'#3db83d':'#8A8A8A'};background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;text-transform:uppercase">${r.status}</span>
                  </div>
                  <div style="font-size:11px;color:#FF2D7A;margin-bottom:4px">Reason: ${esc(r.reason)}</div>
                  ${r.details ? `<div style="font-size:11px;color:#8A8A8A;font-style:italic;margin-bottom:6px">"${esc(r.details)}"</div>` : ''}
                  <div style="display:flex;gap:8px;font-size:10px;color:#8A8A8A;margin-bottom:6px">
                    <span>Total reports: ${stats.total}</span>
                    <span style="color:#3db83d">Resolved: ${stats.resolved}</span>
                    <span style="color:#ff4444">Dismissed: ${stats.dismissed}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                    <span style="font-size:10px;color:#8A8A8A">Credibility:</span>
                    <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden"><div style="width:${credibility}%;height:100%;background:${credColor}"></div></div>
                    <span style="font-size:10px;font-weight:700;color:${credColor}">${credibility}%</span>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button onclick="closeModal();showAdminUserDetail('${r.reporter_id}')" style="padding:5px 8px;background:rgba(255,45,122,0.1);border:1px solid #FF2D7A;border-radius:6px;color:#FF2D7A;font-size:10px;font-weight:700;cursor:pointer">View Profile</button>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>

          <!-- 🔍 ADMIN DECISION -->
          ${report.status === 'pending' ? `
          <div>
            <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;text-transform:uppercase">Admin Decision</div>
            <div style="display:flex;gap:8px">
              <button onclick="adminResolveReport('${report.id}','${report.reporter_id||''}','${esc(report.reason).replace(/'/g,"\\'")}');closeModal()" style="flex:1;padding:12px;background:rgba(61,184,61,0.1);border:1px solid #3db83d;border-radius:10px;color:#3db83d;font-size:13px;font-weight:700;cursor:pointer">✓ Resolve (Genuine)</button>
              <button onclick="adminDismissReport('${report.id}','${report.reporter_id||''}');closeModal()" style="flex:1;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#8A8A8A;font-size:13px;font-weight:700;cursor:pointer">✗ Dismiss (False)</button>
            </div>
          </div>
          ` : `
          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:12px;color:#8A8A8A">This report has been <b style="color:${statusColor}">${esc(report.status)}</b></div>
          </div>
          `}
        </div>
      </div>`;

  } catch(e) {
    console.error('Report detail failed:', e);
    body.innerHTML = `<div style="padding:30px;text-align:center;color:#FF2D7A;font-size:13px">Failed to load: ${e.message||'error'}</div>`;
  }
};
