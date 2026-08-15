/**
 * NovaSocial Mention and Create-support helpers.
 *
 * This classic script preserves inline caption, mention-notification, and
 * scheduling handlers while Story editor/viewer code remains in index.html.
 */
// ── MENTION SYSTEM (Instagram-style with suggestions + notifications) ──
let mentionSearchTimer = null;

async function checkMentionInCaption(textarea){
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Find @ mention before cursor
  const beforeCursor = text.substring(0, cursorPos);
  const atMatch = beforeCursor.match(/@([a-zA-Z0-9._]+)$/);

  const suggestionsDiv = document.getElementById('mention-suggestions');
  if(!suggestionsDiv) return;

  if(!atMatch){
    suggestionsDiv.style.display = 'none';
    return;
  }

  const query = atMatch[1];
  if(query.length < 1){
    suggestionsDiv.style.display = 'none';
    return;
  }

  clearTimeout(mentionSearchTimer);
  mentionSearchTimer = setTimeout(async () => {
    try {
      const { data: users } = await db.from('profiles')
        .select('id,username,avatar_url,full_name')
        .ilike('username', '%' + query + '%')
        .neq('id', ME.id)
        .limit(5);

      if(!users || users.length === 0){
        suggestionsDiv.style.display = 'none';
        return;
      }

      suggestionsDiv.innerHTML = users.map(u => `
        <div onclick="insertMentionIntoCaption('${u.username}', '${u.id}')" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:0.2s;border-bottom:1px solid rgba(255,255,255,0.04)">
          ${av(u.avatar_url, u.username, 32)}
          <div>
            <div style="font-size:13px;font-weight:600;color:#fff">@${u.username}</div>
            ${u.full_name?`<div style="font-size:11px;color:#8A8A8A">${u.full_name}</div>`:''}
          </div>
        </div>
      `).join('');
      suggestionsDiv.style.display = 'block';
    } catch(e) {
      console.error('Mention search error:', e);
    }
  }, 300);
}

function insertMentionIntoCaption(username, userId){
  const textarea = document.getElementById('capinp');
  if(!textarea) return;

  const text = textarea.value;
  const cursorPos = textarea.selectionStart;
  const beforeCursor = text.substring(0, cursorPos);
  const afterCursor = text.substring(cursorPos);

  // Replace @partial with @username
  const newText = beforeCursor.replace(/@([a-zA-Z0-9._]+)$/, '@' + username + ' ') + afterCursor;
  textarea.value = newText;

  // Focus and set cursor after mention
  const newCursorPos = beforeCursor.replace(/@([a-zA-Z0-9._]+)$/, '@' + username + ' ').length;
  textarea.focus();
  textarea.setSelectionRange(newCursorPos, newCursorPos);

  // Hide suggestions
  const suggestionsDiv = document.getElementById('mention-suggestions');
  if(suggestionsDiv) suggestionsDiv.style.display = 'none';

  // Store mentioned user for notification
  if(!window._mentionedUsers) window._mentionedUsers = [];
  window._mentionedUsers.push({username, id: userId});
}

// Send mention notifications after post creation
async function sendMentionNotifications(postId){
  if(!window._mentionedUsers || !window._mentionedUsers.length) return;

  for(const user of window._mentionedUsers){
    try {
      await sendNotif(user.id, 'mention', {post_id: postId, message: 'mentioned you in a post'});
    } catch(e) {
      console.log('Mention notification error:', e);
    }
  }

  // Clear mentioned users
  window._mentionedUsers = [];
}

function toggleScheduleMode(btn){
  const wrap = document.getElementById('schedule-input-wrap');
  if(!wrap) return;
  const isShowing = wrap.style.display === 'flex';
  if(isShowing){
    wrap.style.display = 'none';
    btn.style.background = 'rgba(0,149,246,0.1)';
    btn.style.borderColor = 'rgba(0,149,246,0.3)';
    window._scheduleTime = null;
  } else {
    wrap.style.display = 'flex';
    btn.style.background = 'linear-gradient(135deg,#0095f6,#00d4ff)';
    btn.style.borderColor = '#00d4ff';
    // Set min to now + 1 hour
    const minTime = new Date(Date.now()+3600000).toISOString().slice(0,16);
    const inp = document.getElementById('schedule-time');
    if(inp){ inp.min = minTime; inp.value = minTime; }
  }
}
