// _refreshDmsInPlace — extracted from index.html
// Owner SHA-256: c242ac463e9a764edaa05cbdbb0981ce0eca47fbf75aaeb9efc42728b90899ac
// Classic script — exposes window._refreshDmsInPlace

window._refreshDmsInPlace = async function _refreshDmsInPlace() {
  if (!ME?.id) return false;
  if (curTab !== 'dms') return false;
  if (window._chatScreenActive) return false;

  try {
    // ── Fetch fresh data (same shape as renderDMs uses) ──
    const [memRes, unreadRes, notesData] = await Promise.all([
      db.from('conversation_members').select('conversation_id,conversations(*)').eq('user_id',ME.id),
      db.from('messages').select('conversation_id').is('seen_at', null).neq('sender_id', ME.id),
      _fetchNotesBarData(),
    ]);

    // Generation guard — user may have navigated away during the await
    if (curTab !== 'dms') return false;

    const mem = memRes.data || [];
    const convos = mem.map(m=>m.conversations).filter(Boolean).sort((a,b)=>new Date(b.last_message_at)-new Date(a.last_message_at));
    const unreadMap = {};
    (unreadRes.data || []).forEach(r => { unreadMap[r.conversation_id] = (unreadMap[r.conversation_id] || 0) + 1; });

    // Fetch other-members for 1-on-1 convos (needed for online dot + name, same as renderDMs)
    const oneOnOneIds=convos.filter(c=>!c.is_group).map(c=>c.id);
    let otherMap={};
    if(oneOnOneIds.length){
      const{data:others}=await db.from('conversation_members').select('conversation_id,user_id,profiles!conversation_members_user_id_fkey(username,avatar_url,last_seen)').in('conversation_id',oneOnOneIds).neq('user_id',ME.id);
      (others||[]).forEach(o=>{otherMap[o.conversation_id]=o.profiles;});
    }

    if (curTab !== 'dms') return false;

    // ── Refresh notes bar in-place (its own container, doesn't affect chat list scroll) ──
    _renderNotesBarHtml(notesData);

    // ── Patch conversation list items in-place ──
    // Each existing .clist item has its conversation ID encoded in the onclick attribute
    // (format: openChat('CID','NAME',ISGRP)). We use a data attribute instead for cleaner
    // lookup — but since the existing DOM doesn't have data attributes, we parse the onclick.
    // To make future refreshes cleaner, also stamp data-cid on items we touch.
    const existingItems = document.querySelectorAll('#screen .clist');
    const existingCidSet = new Set();
    const itemsByCid = {};

    existingItems.forEach(el => {
      // Try data-cid first (set by us on a previous refresh), fall back to parsing onclick
      let cid = el.getAttribute('data-cid');
      if (!cid) {
        const onclick = el.getAttribute('onclick') || '';
        const m = onclick.match(/openChat\('([^']+)'/);
        cid = m ? m[1] : null;
      }
      if (cid) {
        existingCidSet.add(cid);
        itemsByCid[cid] = el;
      }
    });

    const freshCidSet = new Set(convos.map(c => c.id));
    let updatesMade = false;

    // (a) Remove items that no longer exist (conversation left/deleted)
    existingItems.forEach(el => {
      let cid = el.getAttribute('data-cid');
      if (!cid) {
        const onclick = el.getAttribute('onclick') || '';
        const m = onclick.match(/openChat\('([^']+)'/);
        cid = m ? m[1] : null;
      }
      if (cid && !freshCidSet.has(cid)) {
        el.remove();
        updatesMade = true;
      }
    });

    // (b) Update existing items in-place + collect new ones to prepend
    const newConvosToPrepend = [];
    convos.forEach(c => {
      const other = otherMap[c.id];
      const name = c.is_group ? c.group_name : (other?.username || 'Chat');
      const safeName = name.replace(/'/g, "\\'");
      const online = other ? isOnline(other.last_seen) : false;
      const lastMsg = c.last_message || 'Tap to open';
      const timeAgo = ago(c.last_message_at);
      const unread = unreadMap[c.id] || 0;
      const unreadText = unread > 99 ? '99+' : String(unread);

      const existingEl = itemsByCid[c.id];
      if (existingEl) {
        // ── In-place update: stamp data-cid if not already, then patch text nodes ──
        if (!existingEl.getAttribute('data-cid')) existingEl.setAttribute('data-cid', c.id);

        // Update onclick (in case name changed)
        existingEl.setAttribute('onclick', `openChat('${c.id}','${safeName}',${c.is_group})`);

        // Update name (the bold span — first span inside the inner flex div)
        const nameSpan = existingEl.querySelector('div[style*="flex:1"] > div > span');
        if (nameSpan && nameSpan.textContent !== name) {
          nameSpan.textContent = name;
          updatesMade = true;
        }

        // Update timestamp (the small span after the unread badge container)
        const timeSpan = existingEl.querySelector('div[style*="flex:1"] > div > div > span[style*="color:#444"]');
        if (timeSpan && timeSpan.textContent !== timeAgo) {
          timeSpan.textContent = timeAgo;
          updatesMade = true;
        }

        // Update preview text (the div with color:#555)
        const previewDiv = existingEl.querySelector('div[style*="color:#555"]');
        if (previewDiv && previewDiv.textContent !== lastMsg) {
          previewDiv.textContent = lastMsg;
          updatesMade = true;
        }

        // Update unread badge (insert/remove as needed)
        const badgeContainer = existingEl.querySelector('div[style*="flex:1"] > div > div[style*="display:flex"]');
        if (badgeContainer) {
          let badgeEl = badgeContainer.querySelector('div[style*="background:#E1306C"]') || badgeContainer.querySelector('div[style*="min-width:20px"]');
          if (unread > 0) {
            if (!badgeEl) {
              // Insert new badge before the timestamp span
              const newBadge = document.createElement('div');
              newBadge.style.cssText = 'min-width:20px;height:20px;border-radius:10px;background:#E1306C;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 6px;';
              newBadge.textContent = unreadText;
              badgeContainer.insertBefore(newBadge, badgeContainer.firstChild);
              updatesMade = true;
            } else if (badgeEl.textContent !== unreadText) {
              badgeEl.textContent = unreadText;
              updatesMade = true;
            }
          } else if (badgeEl) {
            badgeEl.remove();
            updatesMade = true;
          }
        }

        // Update online dot for 1-on-1 chats (only if changed)
        if (!c.is_group) {
          const avatarWrap = existingEl.querySelector('div[style*="position:relative"]');
          if (avatarWrap) {
            let onlineDot = avatarWrap.querySelector('div[style*="background:#3db83d"]');
            if (online && !onlineDot) {
              const dot = document.createElement('div');
              dot.style.cssText = 'position:absolute;bottom:0;right:0;width:14px;height:14px;background:#3db83d;border-radius:50%;border:2px solid #000;';
              avatarWrap.appendChild(dot);
              updatesMade = true;
            } else if (!online && onlineDot) {
              onlineDot.remove();
              updatesMade = true;
            }
          }
        }
      } else {
        // ── New conversation: build the full HTML for this one item, prepend later ──
        const onlineDot = online ? '<div style="position:absolute;bottom:0;right:0;width:14px;height:14px;background:#3db83d;border-radius:50%;border:2px solid #000;"></div>' : '';
        let avatarHtml = '';
        if (c.is_group) {
          avatarHtml = c.group_avatar
            ? '<div style="width:54px;height:54px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="'+c.group_avatar+'" style="width:100%;height:100%;object-fit:cover;"></div>'
            : '<div style="width:54px;height:54px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">👥</div>';
        } else {
          avatarHtml = '<div style="position:relative;width:54px;height:54px;flex-shrink:0;">' + av(other?.avatar_url, other?.username, 54, false, false) + onlineDot + '</div>';
        }
        const unreadBadge = unread > 0
          ? '<div style="min-width:20px;height:20px;border-radius:10px;background:#E1306C;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 6px;">'+unreadText+'</div>'
          : '';
        const itemHtml = '<div class="clist" data-cid="'+c.id+'" onclick="openChat(\''+c.id+'\',\''+safeName+'\','+c.is_group+')">'+avatarHtml+'<div style="flex:1;overflow:hidden"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-weight:700;font-size:15px">'+esc(name)+'</span><div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+unreadBadge+'<span style="color:#444;font-size:11px">'+timeAgo+'</span></div></div><div style="color:#555;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(lastMsg)+'</div></div></div>';
        newConvosToPrepend.push(itemHtml);
        updatesMade = true;
      }
    });

    // (c) Prepend any new conversations at the top of the list (after notes bar, before existing items)
    if (newConvosToPrepend.length) {
      // Find the first .clist OR the spacer div at the bottom — insert before the first .clist
      const firstExistingItem = document.querySelector('#screen .clist');
      const notesBar = document.getElementById('notes-bar');
      // Insert right after notes bar (or after topbar if notes bar somehow missing)
      const insertAnchor = notesBar || document.querySelector('#screen .topbar');
      if (insertAnchor) {
        insertAnchor.insertAdjacentHTML('afterend', newConvosToPrepend.join(''));
      } else if (firstExistingItem) {
        firstExistingItem.insertAdjacentHTML('beforebegin', newConvosToPrepend.join(''));
      }
    }

    return updatesMade;
  } catch(e) {
    console.warn('[DMs] Non-destructive background refresh failed:', e.message);
    return false;
  }
};
