// Story Mention async search; debounce state remains inline and selection helper is modularized separately.
async function seSearchMentionUsers(query){
  clearTimeout(seMentionSearchTimer);
  if(!query || query.length < 1){
    document.getElementById('se-mention-results').innerHTML = '';
    return;
  }

  seMentionSearchTimer = setTimeout(async () => {
    try {
      // Search in followers + following first
      const [{data: following}, {data: followers}] = await Promise.all([
        db.from('follows').select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url, full_name)').eq('follower_id', ME.id),
        db.from('follows').select('follower_id, profiles!follows_follower_id_fkey(id, username, avatar_url, full_name)').eq('following_id', ME.id)
      ]);

      // Combine and deduplicate
      const contacts = [];
      const seen = new Set();
      [...(following||[]), ...(followers||[])].forEach(f => {
        const p = f.profiles;
        if(p && !seen.has(p.id) && p.username.toLowerCase().includes(query.toLowerCase())){
          seen.add(p.id);
          contacts.push(p);
        }
      });

      // Also search all profiles if less than 5 results
      let allUsers = [];
      if(contacts.length < 5){
        const { data: all } = await db.from('profiles')
          .select('id, username, avatar_url, full_name')
          .ilike('username', '%' + query + '%')
          .neq('id', ME.id)
          .limit(10);
        allUsers = (all || []).filter(u => !seen.has(u.id));
      }

      const results = [...contacts, ...allUsers].slice(0, 8);
      const resultsDiv = document.getElementById('se-mention-results');

      if(!results.length){
        resultsDiv.innerHTML = '<div style="text-align:center;color:#555;padding:20px;font-size:13px">No users found</div>';
        return;
      }

      resultsDiv.innerHTML = results.map(u => `
        <div onclick="seSelectMentionUser('${u.id}', '${u.username}')" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;cursor:pointer;transition:0.2s;margin-bottom:4px;background:rgba(255,255,255,0.02)">
          ${av(u.avatar_url, u.username, 36)}
          <div>
            <div style="font-size:13px;font-weight:600;color:#fff">@${u.username}</div>
            ${u.full_name ? `<div style="font-size:11px;color:#8A8A8A">${u.full_name}</div>` : ''}
          </div>
        </div>
      `).join('');
    } catch(e) {
      console.error('Mention search error:', e);
    }
  }, 300);
}
