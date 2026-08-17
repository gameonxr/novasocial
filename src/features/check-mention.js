// Chat mention autocomplete renderer.
function checkMention(inp, cid) {
  const val = inp.value;
  const words = val.split(' ');
  const lastWord = words[words.length - 1];

  const existingList = document.getElementById('mention-list');

  if (lastWord.startsWith('@') && lastWord.length < 20) {
    const query = lastWord.substring(1).toLowerCase();
    const members = window._chatMembers || [];
    const matched = members.filter(m => m.profiles?.username && m.profiles.username.toLowerCase().includes(query) && m.user_id !== ME.id);

    if (matched.length > 0) {
      if (!existingList) {
        const list = document.createElement('div');
        list.id = 'mention-list';
        list.style.cssText = 'position:absolute;bottom:70px;left:10px;right:10px;background:#1a1a1a;border:1px solid #333;border-radius:12px;max-height:200px;overflow-y:auto;z-index:100;box-shadow:0 -4px 12px rgba(0,0,0,0.5);';
        document.getElementById('mlist').parentElement.appendChild(list);
      }

      let html = '';
      matched.forEach(m => {
        html += '<div onclick="insertMention(\''+m.profiles.username+'\', \'minp\')" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #222;">';
        html += av(m.profiles?.avatar_url, m.profiles.username, 32);
        html += '<span style="font-weight:600;font-size:14px;">'+m.profiles.username+'</span></div>';
      });
      document.getElementById('mention-list').innerHTML = html;
    } else {
      existingList?.remove();
    }
  } else {
    existingList?.remove();
  }
}
