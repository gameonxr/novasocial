// showStaffActions — extracted from index.html
// Owner SHA-256: 2903c28a32c42a65bc4f173629535adefe93de1b960185d68e5f62be4b469b60
// Classic script — exposes window.showStaffActions

window.showStaffActions = function showStaffActions(userId, username, currentRole, isSuper){
  const m = modal('Manage ' + username);
  const body = m.querySelector('#mbody');
  const callerSuper = PROF?.is_super_admin === true;
  const callerAdmin = PROF?.is_admin === true;

  let actionsHtml = '';

  if(currentRole === 'admin' && callerSuper){
    // Super admin can demote admin to moderator or remove admin entirely
    actionsHtml += `<button onclick="adminDemoteToModerator('${userId}','${username.replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(0,229,255,0.1);border:1px solid #00E5FF;border-radius:10px;color:#00E5FF;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">Demote to Moderator</button>`;
    actionsHtml += `<button onclick="adminDemoteUser('${userId}','${username.replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:10px;color:#ff4444;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">Remove Admin Completely</button>`;
  } else if(currentRole === 'moderator'){
    // Admin or super admin can promote moderator to admin (only super) or demote
    if(callerSuper){
      actionsHtml += `<button onclick="adminPromoteModToAdmin('${userId}','${username.replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(168,85,247,0.1);border:1px solid #a855f7;border-radius:10px;color:#a855f7;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">Promote to Admin</button>`;
    }
    actionsHtml += `<button onclick="adminDemoteModerator('${userId}','${username.replace(/'/g,"\\'")}')" style="padding:12px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:10px;color:#ff4444;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">Remove Moderator</button>`;
  }

  body.innerHTML = `<div style="padding:16px">
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-weight:800;font-size:16px;color:#fff">${esc(username)}</div>
      <div style="font-size:12px;color:#8A8A8A;margin-top:4px">Current role: ${esc(currentRole.toUpperCase())}</div>
    </div>
    ${actionsHtml}
    <button onclick="closeModal()" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#8A8A8A;font-weight:700;font-size:13px;cursor:pointer;width:100%">Cancel</button>
  </div>`;
};
