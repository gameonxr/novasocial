// Extracted from index.html during Phase 83.
function renderAdminPanelUI(myProfile, body){
  // Determine access level
  const isSuper = PROF?.is_super_admin === true;
  const isAdmin = PROF?.is_admin === true;
  const isMod = PROF?.is_moderator === true;

  // Role badge
  let roleBadge = '';
  let roleLabel = 'Staff';
  if(isSuper){ roleBadge = '<span style="font-size:9px;font-weight:800;color:#FF2D7A;background:rgba(255,45,122,0.2);padding:3px 8px;border-radius:8px;border:1px solid #FF2D7A">SUPER ADMIN</span>'; roleLabel = 'Super Admin'; }
  else if(isAdmin){ roleBadge = '<span style="font-size:9px;font-weight:800;color:#a855f7;background:rgba(168,85,247,0.2);padding:3px 8px;border-radius:8px;border:1px solid #a855f7">ADMIN</span>'; roleLabel = 'Admin'; }
  else if(isMod){ roleBadge = '<span style="font-size:9px;font-weight:800;color:#00E5FF;background:rgba(0,229,255,0.2);padding:3px 8px;border-radius:8px;border:1px solid #00E5FF">MODERATOR</span>'; roleLabel = 'Moderator'; }

  // Build tabs based on level
  // Moderator: Dashboard, Reports (view only), Approvals (their recommendations)
  // Admin: All tabs EXCEPT Team management (that's super admin only... wait, admin CAN manage moderators)
  // Actually: Admin can manage moderators, super admin can manage admins
  // Team tab: super admin sees all admins+mods, admin sees all mods

  let tabsHtml = '';
  const tabStyle1 = "flex-shrink:0;padding:8px 14px;border-radius:10px;background:rgba(255,45,122,0.15);border:1px solid #FF2D7A;color:#FF2D7A;font-size:12px;font-weight:700;cursor:pointer";
  const tabStyle0 = "flex-shrink:0;padding:8px 14px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);color:#8A8A8A;font-size:12px;font-weight:700;cursor:pointer";

  tabsHtml += `<div onclick="switchAdminTab('dashboard')" class="admin-tab" data-tab="dashboard" style="${tabStyle1}">Dashboard</div>`;

  if(isAdmin || isSuper){
    tabsHtml += `<div onclick="switchAdminTab('users')" class="admin-tab" data-tab="users" style="${tabStyle0}">Users</div>`;
    tabsHtml += `<div onclick="switchAdminTab('content')" class="admin-tab" data-tab="content" style="${tabStyle0}">Content</div>`;
  }

  tabsHtml += `<div onclick="switchAdminTab('reports')" class="admin-tab" data-tab="reports" style="${tabStyle0}">Reports</div>`;

  if(isAdmin || isSuper){
    tabsHtml += `<div onclick="switchAdminTab('verify')" class="admin-tab" data-tab="verify" style="${tabStyle0}">Verify</div>`;
    tabsHtml += `<div onclick="switchAdminTab('appeals')" class="admin-tab" data-tab="appeals" style="${tabStyle0}">Appeals</div>`;
    tabsHtml += `<div onclick="switchAdminTab('approvals')" class="admin-tab" data-tab="approvals" style="${tabStyle0}">Approvals</div>`;
  }

  if(isMod && !isAdmin && !isSuper){
    tabsHtml += `<div onclick="switchAdminTab('myapprovals')" class="admin-tab" data-tab="myapprovals" style="${tabStyle0}">My Requests</div>`;
  }

  tabsHtml += `<div onclick="switchAdminTab('team')" class="admin-tab" data-tab="team" style="${tabStyle0}">Team</div>`;

  if(isAdmin || isSuper){
    tabsHtml += `<div onclick="switchAdminTab('audit')" class="admin-tab" data-tab="audit" style="${tabStyle0}">Audit</div>`;
    tabsHtml += `<div onclick="switchAdminTab('deleted')" class="admin-tab" data-tab="deleted" style="${tabStyle0}">Deleted</div>`;
  }

  body.innerHTML = `
    <div style="padding:0">
      <div style="background:linear-gradient(135deg,rgba(255,45,122,0.15),rgba(0,229,255,0.15));padding:20px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FF2D7A,#00E5FF);display:flex;align-items:center;justify-content:center">${ico('shield','#fff',24)}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div style="font-weight:800;font-size:17px;color:#fff">Admin Panel</div>
              ${roleBadge}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6)">${esc(myProfile?.username) || 'staff'} · ${roleLabel}</div>
          </div>
        </div>
      </div>
      <div id="admin-tabs" style="display:flex;gap:4px;padding:12px 16px 8px;overflow-x:auto;border-bottom:1px solid rgba(255,255,255,0.04)">
        ${tabsHtml}
      </div>
      <div id="admin-content" style="padding:16px;min-height:400px;max-height:60vh;overflow-y:auto"></div>
    </div>`;
  loadAdminTab('dashboard');
}
