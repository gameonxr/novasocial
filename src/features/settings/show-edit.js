// Extracted from index.html during Phase 73.
function showEdit(){
  const m=modal('Settings');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:0">

    <!-- Profile Header Card -->
    <div style="display:flex;align-items:center;gap:14px;padding:20px;background:#0A0A0A;border-bottom:1px solid #1A1A1A">
      ${av(PROF?.avatar_url,PROF?.username||ME?.email,56)}
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:15px;color:#fff;display:flex;align-items:center;gap:6px">${PROF?.username||''} ${PROF?.is_verified?ico('verified','#3897f0',14):''} ${PROF?.is_verified_plus?`<span class="verified-plus">${ico('crown','#000',10)}PLUS</span>`:''}</div>
        <div style="color:#8A8A8A;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ME?.email||''}</div>
      </div>
    </div>

    <!-- 6 Settings Cards -->
    <div style="padding:16px;display:flex;flex-direction:column;gap:8px">

      <!-- Account -->
      <div onclick="showSettingsAccount()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:rgba(255,45,122,0.1)">${ico('user','#FF2D7A',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Account</div><div class="nova-setting-desc">Edit profile, password, verification</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      <!-- Privacy -->
      <div onclick="showSettingsPrivacy()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:rgba(0,229,255,0.1)">${ico('lock','#00E5FF',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Privacy</div><div class="nova-setting-desc">Ghost mode, blocked users, close friends</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      <!-- Appearance -->
      <div onclick="showSettingsAppearance()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:rgba(168,85,247,0.1)">${ico('palette','#a855f7',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Appearance</div><div class="nova-setting-desc">Themes, profile customization, gradients</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      <!-- Features -->
      <div onclick="showSettingsFeatures()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1))">${ico('sparkles','#FF2D7A',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Features</div><div class="nova-setting-desc">Universe, AI, wallet, memories, more</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      <!-- Notifications -->
      <div onclick="showSettingsNotifications()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:rgba(255,170,0,0.1)">${ico('bell','#ffaa00',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Notifications</div><div class="nova-setting-desc">Likes, comments, follows, messages</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      <!-- Support -->
      <div onclick="showSettingsSupport()" class="nova-setting-row">
        <div class="nova-setting-icon-box" style="background:rgba(61,184,61,0.1)">${ico('help','#3db83d',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:600">Support</div><div class="nova-setting-desc">Help center, report, about</div></div>
        ${ico('chevron_right','#555',18)}
      </div>

      ${PROF?.is_admin === true || PROF?.is_moderator === true ? `
      <div onclick="showAdminPanel()" class="nova-setting-row" style="border-color:rgba(255,45,122,0.3);background:linear-gradient(135deg,rgba(255,45,122,0.05),rgba(0,229,255,0.05))">
        <div class="nova-setting-icon-box" style="background:linear-gradient(135deg,#FF2D7A,#00E5FF)">${ico('shield','#fff',18)}</div>
        <div style="flex:1"><div class="nova-setting-label" style="color:#fff;font-size:14px;font-weight:700">${PROF?.is_super_admin ? 'Super Admin Panel' : PROF?.is_admin ? 'Admin Panel' : 'Moderator Panel'}</div><div class="nova-setting-desc">${PROF?.is_super_admin ? 'Full access — manage all staff' : PROF?.is_admin ? 'Manage users, content, moderators' : 'View reports, recommend bans'}</div></div>
        ${ico('chevron_right','#FF2D7A',18)}
      </div>
      ` : ''}
    </div>

    <!-- Logout -->
    <div style="padding:16px">
      <button class="nova-btn-outline nova-btn" onclick="logout()" style="width:100%;padding:14px">${ico('logout','#FF2D7A',18)} Logout</button>
    </div>

    <div style="padding:0 16px 16px;text-align:center;color:#444;font-size:11px">
      NovaSocial v1.0
    </div>
  </div>`;
}
