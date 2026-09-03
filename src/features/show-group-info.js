// showGroupInfo — extracted from index.html
// Owner SHA-256: 9b83af9829faba87c889aecc90e056214ecbeaccd635ad039b7636d475a22d78
// Classic script — exposes window.showGroupInfo

window.showGroupInfo = async function showGroupInfo(cid){
  const members=window._chatMembers||[];
  const isAdmin=window._chatIsAdmin;
  const gcName=window._chatGcName||'Group';

  const { data: ci } = await db.from('conversations').select('group_avatar, group_name, admin_approval_required, theme').eq('id', cid).single();
  const { data: myMem } = await db.from('conversation_members').select('muted_until').eq('conversation_id', cid).eq('user_id', ME.id).maybeSingle();

  // Shared Media Fetch
  const { data: mediaMsgs } = await db.from('messages').select('media_url, media_type').eq('conversation_id', cid).not('media_url', 'is', null).order('created_at', {ascending:false}).limit(9);

  const gcAvatar = ci?.group_avatar || '';
  const approvalReq = ci?.admin_approval_required || false;
  const isMuted = myMem?.muted_until && new Date(myMem.muted_until) > new Date();
  const chatTheme = ci?.theme || 'default';

  const m = modal(`${gcName} · Info`);
  const body = m.querySelector('#mbody');
  const inviteLink = `${window.location.origin}/?gc=${cid}`;

  let html = '<div style="display:flex;flex-direction:column;align-items:center;padding:24px 16px 16px;gap:8px;border-bottom:8px solid #0a0a0a;">';

  html += '<div onclick="'+(isAdmin?`document.getElementById('gc-av-pick').click()`:'')+'" style="position:relative;cursor:'+(isAdmin?'pointer':'default')+';margin-bottom:8px;">';
  if(gcAvatar) {
    html += '<div style="width:90px;height:90px;border-radius:50%;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.5);"><img src="'+gcAvatar+'" style="width:100%;height:100%;object-fit:cover"></div>';
  } else {
    html += '<div style="width:90px;height:90px;border-radius:50%;background:'+GRAD+';display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">👥</div>';
  }
  if(isAdmin) html += '<div style="position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:'+GRAD+';display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid #0d0d0d;">📷</div>';
  html += '</div>';

  html += '<input id="gc-av-pick" type="file" accept="image/*" style="display:none" onchange="uploadGCAvatar(this,\''+cid+'\')">';
  if(isAdmin) {
    html += '<input id="gc-rename" value="'+gcName.replace(/"/g,'&quot;')+'" style="background:transparent;border:none;color:#fff;font-size:20px;font-weight:800;text-align:center;outline:none;width:220px" onblur="saveGCName(\''+cid+'\',this.value)">';
  } else {
    html += '<div style="font-size:20px;font-weight:800">'+gcName+'</div>';
  }
  html += '<div style="color:#666;font-size:13px">Group · '+members.length+' members</div></div>';

  // Quick Action Icons
  html += '<div style="display:flex;justify-content:space-around;padding:16px 0;border-bottom:8px solid #0a0a0a;">';
  html += '<div onclick="showGroupCallTypeMenu(\''+cid+'\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;color:#fff;"><div style="width:50px;height:50px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;">'+ico('mic','#fff',22)+'</div><span style="font-size:11px;color:#aaa;">Audio</span></div>';
  html += '<div onclick="showGroupCallTypeMenu(\''+cid+'\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;color:#fff;"><div style="width:50px;height:50px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;">'+ico('vid','#fff',22)+'</div><span style="font-size:11px;color:#aaa;">Video</span></div>';
  html += '<div onclick="searchMessages(\''+cid+'\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;color:#fff;"><div style="width:50px;height:50px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;">'+ico('search','#fff',22)+'</div><span style="font-size:11px;color:#aaa;">Search</span></div>';
  html += '</div>';

  // Shared Media Gallery
  if(mediaMsgs && mediaMsgs.length > 0) {
    html += '<div style="padding:16px; border-bottom:8px solid #0a0a0a;"><div style="color:#666;font-size:12px;font-weight:700;margin-bottom:8px; display:flex; justify-content:space-between;">SHARED MEDIA <span style="color:#4a90d9;cursor:pointer;" onclick="toast(\'Opening all media...\')">See All</span></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;">';
    mediaMsgs.forEach(m => {
      if(m.media_type === 'image') html += '<img src="'+m.media_url+'" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="window.open(\''+m.media_url+'\',\'_blank\')">';
      else if(m.media_type === 'video') html += '<div style="position:relative;width:100%;aspect-ratio:1/1;background:#000;border-radius:8px;overflow:hidden;"><video src="'+m.media_url+'" style="width:100%;height:100%;object-fit:cover;"></video><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;">▶️</div></div>';
    });
    html += '</div></div>';
  }

  // Mute Notifications Dropdown
  html += '<div style="padding:0 16px; border-bottom:1px solid #1a1a1a;">';
  html += '<div onclick="var d=document.getElementById(\'mute-opts\'); d.style.display = d.style.display === \'none\' ? \'flex\' : \'none\';" style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;cursor:pointer;">';
  html += '<div style="font-size:14px;font-weight:600;">Mute Notifications</div>';
  html += '<div id="mute-label" style="color:#aaa;font-size:12px;">'+(isMuted?'Muted':'Off')+' 🔽</div></div>';
  html += '<div id="mute-opts" style="display:none;padding-bottom:16px;gap:8px;flex-wrap:wrap;">';
  const muteDurations = [['Off', null], ['1H', '1 hour'], ['8H', '8 hours'], ['24H', '24 hours']];
  muteDurations.forEach(([label, duration]) => {
    const isActive = (duration === null && !isMuted) || (duration !== null && isMuted);
    html += '<button onclick="muteGroup(\''+cid+'\', \''+duration+'\', this)" class="bout" style="font-size:11px;padding:6px 14px;'+(isActive?'border-color:#E1306C;color:#E1306C;':'')+'">'+label+'</button>';
  });
  html += '</div></div>';

  // Admin Approval System Toggle
  if(isAdmin) {
    html += '<div style="padding:16px; border-bottom:1px solid #1a1a1a; display:flex; justify-content:space-between; align-items:center;">';
    html += '<div><div style="font-size:14px;font-weight:600;">Approval System</div><div style="color:#666;font-size:11px;">Approve new members manually</div></div>';
    html += '<button onclick="toggleApprovalSystem(\''+cid+'\', '+(approvalReq?'false':'true')+', this)" style="width:46px;height:26px;border-radius:14px;border:none;background:'+(approvalReq?'#E1306C':'#333')+';position:relative;cursor:pointer;transition:0.3s;">';
    html += '<div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:'+(approvalReq?'23px':'3px')+';transition:0.3s;"></div></button>';
    html += '</div>';
  }

  // Chat Themes
  html += '<div style="padding:0 16px; border-bottom:8px solid #0a0a0a;">';
  html += '<div onclick="var d=document.getElementById(\'theme-opts\'); d.style.display = d.style.display === \'none\' ? \'flex\' : \'none\';" style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;cursor:pointer;">';
  html += '<div style="font-size:14px;font-weight:600;">Theme</div><div style="color:#aaa;font-size:12px;">'+chatTheme.charAt(0).toUpperCase()+chatTheme.slice(1)+' 🔽</div></div>';
  html += '<div id="theme-opts" style="display:none;padding-bottom:16px;gap:12px;flex-wrap:wrap;">';
  const themes = [['Default', 'default', '#0d0d0d'], ['Cyberpunk', 'cyberpunk', '#1a0533'], ['Tropical', 'tropical', '#05331a'], ['Pride', 'pride', '#330a0a']];
  themes.forEach(([name, val, color]) => {
    html += '<div onclick="setChatTheme(\''+cid+'\',\''+val+'\', this)" style="width:60px;height:60px;border-radius:50%;background:'+color+';border:2px solid '+(chatTheme===val?'#E1306C':'transparent')+';cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">'+name+'</div>';
  });
  html += '</div></div>';

  // Invite Link
  html += '<div style="padding:16px; border-bottom:8px solid #0a0a0a;"><div style="color:#666;font-size:12px;font-weight:700;margin-bottom:8px">INVITE VIA LINK</div>';
  html += '<div style="display:flex;align-items:center;gap:8px;background:#111;padding:10px 12px;border-radius:10px;"><span style="flex:1;color:#aaa;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+inviteLink+'</span>';
  html += '<button onclick="copyInviteLink(\''+inviteLink+'\')" style="background:'+GRAD+';border:none;border-radius:6px;color:#fff;font-size:11px;padding:6px 10px;cursor:pointer;font-weight:700;">Copy</button></div></div>';

  // Members Section
  html += '<div style="padding:16px 16px 4px"><div style="color:#666;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px">MEMBERS ('+members.length+')</div>';
    members.forEach(mem => {
    const isMe = mem.user_id === ME.id;
    html += '<div id="member-'+mem.user_id+'" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d">';
    html += '<div onclick="closeModal();goToProfile(\''+mem.user_id+'\')" style="cursor:pointer;display:flex;align-items:center;gap:12px;flex:1">';
    html += av(mem.profiles?.avatar_url, mem.profiles?.username, 44, false, isOnline(mem.profiles?.last_seen));
    html += '<div><div style="font-weight:600;font-size:14px">'+(mem.profiles?.username||'User')+(isMe?' (You)':'')+'</div>';
    html += '<div class="member-role">'; // Class added for instant update
    if(mem.is_admin) html += '<div style="color:#E1306C;font-size:11px;font-weight:700;display:flex;align-items:center;gap:3px">'+ico('star','#E1306C',10)+'Admin</div>';
    else html += '<div style="color:#555;font-size:11px">Member</div>';
    html += '</div></div></div>';
    if(isAdmin && !isMe) {
      html += '<div style="display:flex;gap:6px">';
      html += '<button class="admin-btn" onclick="makeAdmin(\''+cid+'\',\''+mem.user_id+'\')" style="background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#aaa;font-size:11px;padding:5px 8px;cursor:pointer">'+(!mem.is_admin?'Admin':'Remove Admin')+'</button>';
      html += '<button onclick="removeMember(\''+cid+'\',\''+mem.user_id+'\')" style="background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#E1306C;font-size:11px;padding:5px 8px;cursor:pointer">Remove</button>';
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  if(isAdmin) {
    html += '<div style="padding:16px; border-top:8px solid #0a0a0a;"><div style="color:#666;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px">ADD MEMBER</div>';
    html += '<div id="gc-suggest-res" style="margin-bottom:12px;"></div>';
    html += '<div class="sbar2" style="margin-bottom:10px">'+ico('search','#666',18)+'<input placeholder="Search username to add..." id="gc-add-inp" oninput="searchAddMember(this.value,\''+cid+'\')" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>';
    html += '<div id="gc-add-res"></div></div>';
  }

  // Leave & Report Group
  html += '<div style="padding:16px; display:flex; flex-direction:column; gap:10px;">';
  html += '<button onclick="leaveGroup(\''+cid+'\')" style="width:100%;padding:12px;background:transparent;border:1px solid #E1306C;border-radius:12px;color:#E1306C;font-weight:600;font-size:14px;cursor:pointer">Leave Group</button>';
  html += '<button onclick="reportGroup(\''+cid+'\')" style="width:100%;padding:12px;background:transparent;border:1px solid #333;border-radius:12px;color:#aaa;font-weight:600;font-size:14px;cursor:pointer">🚩 Report Group</button>';
  html += '</div><div style="height:20px"></div>';

  body.innerHTML = html;
  if(isAdmin) loadGCSuggestions(cid);
};
