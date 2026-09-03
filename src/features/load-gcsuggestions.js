// loadGCSuggestions — extracted from index.html
// Owner SHA-256: 15b225cee93186d92b1d46cd8dda782ca4a4c72d062545b938e277d38131e132
// Classic script — exposes window.loadGCSuggestions

window.loadGCSuggestions = async function loadGCSuggestions(cid) {
  const exIds = (window._chatMembers||[]).map(m => m.user_id);
  exIds.push(ME.id);
  const { data: following } = await db.from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)').eq('follower_id', ME.id);
  const suggestions = (following || []).map(f => f.profiles).filter(p => p && !exIds.includes(p.id));

  const res = document.getElementById('gc-suggest-res');
  if (!res) return;
  if (suggestions.length === 0) return;

  let html = '<div style="color:#666;font-size:11px;margin-bottom:6px;">SUGGESTED</div>';
  suggestions.forEach(u => {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer;">';
    html += av(u.avatar_url, u.username, 36);
    html += '<div style="flex:1;font-size:14px;font-weight:600">'+u.username+'</div>';
    html += '<button onclick="addToGroup(\''+cid+'\',\''+u.id+'\',\''+u.username+'\',this)" style="background:'+GRAD+';border:none;border-radius:6px;color:#fff;font-size:11px;padding:5px 10px;cursor:pointer">Add</button>';
    html += '</div>';
  });
  res.innerHTML = html;
};
