// loadAdminTab — extracted from index.html
// Owner SHA-256: 0a0904f1ca7c7adb85585cb971f727d837aa4186379a0dbfcf8109b2ed4e2fee
// Classic script — exposes window.loadAdminTab

window.loadAdminTab = async function loadAdminTab(tab){
  curAdminTab = tab;
  const content = document.getElementById('admin-content');
  if(!content) return;
  content.innerHTML = `<div style="display:flex;justify-content:center;padding:40px"><div class="spin" style="width:28px;height:28px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div>`;
  try {
    if(tab==='dashboard') await adminTabDashboard(content);
    else if(tab==='users') await adminTabUsers(content);
    else if(tab==='content') await adminTabContent(content);
    else if(tab==='reports') await adminTabReports(content);
    else if(tab==='verify') await adminTabVerify(content);
    else if(tab==='appeals') await adminTabAppeals(content);
    else if(tab==='approvals') await adminTabApprovals(content);
    else if(tab==='myapprovals') await adminTabMyApprovals(content);
    else if(tab==='team') await adminTabTeam(content);
    else if(tab==='audit') await adminTabAudit(content);
    else if(tab==='deleted') await loadAdminDeletedPosts();
  } catch(e) { content.innerHTML = `<div style="padding:30px;text-align:center;color:#FF2D7A;font-size:13px">Failed: ${e.message||'error'}</div>`; }
};
