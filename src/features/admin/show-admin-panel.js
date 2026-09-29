// showAdminPanel — extracted from index.html
// Owner SHA-256: 476aa928b33d7fb4312621fe74f307534e3bd6aeadf395c0bacd3b1b6c4a44e7
// Classic script — exposes window.showAdminPanel

window.showAdminPanel = async function showAdminPanel(){
  const m = modal('Admin Panel');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:40px;display:flex;flex-direction:column;align-items:center;gap:14px">
    <div class="spin" style="width:32px;height:32px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div>
    <div style="color:#8A8A8A;font-size:13px">Verifying access...</div>
  </div>`;

  let staffVerified = false;
  let myProfile = null;
  let adminContext = null;
  try {
    // 🛡️ SECURE VERIFICATION: Call get_admin_context() RPC which verifies role server-side.
    // This returns the user's role, permissions, and feature flags from the database.
    // Even if the frontend is tampered with, all admin ACTIONS still go through secure RPCs
    // that independently verify permissions.
    const { data: ctx, error: ctxError } = await db.rpc('get_admin_context');

    if(ctxError || !ctx || ctx.error){
      // Fallback to legacy profile check if RPC doesn't exist yet (pre-migration)
      const queryPromise = db.from('profiles').select('is_admin, is_super_admin, is_moderator, is_banned, role, account_status, username, avatar_url').eq('id', ME.id).single();
      const timeoutPromise = new Promise((_, reject) => { setTimeout(() => reject(new Error('timeout')), 8000); });
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if(error) throw error;
      myProfile = data;
      staffVerified = ((data?.is_admin === true || data?.is_moderator === true) && data?.is_banned !== true);
      if(PROF){
        PROF.is_admin = data?.is_admin;
        PROF.is_super_admin = data?.is_super_admin;
        PROF.is_moderator = data?.is_moderator;
        PROF.is_banned = data?.is_banned;
        PROF.role = data?.role;
        PROF.account_status = data?.account_status;
      }
    } else {
      // ✅ SECURE PATH: admin context verified server-side
      adminContext = ctx;
      myProfile = {
        is_admin: ctx.role === 'admin' || ctx.role === 'senior_admin' || ctx.role === 'super_admin',
        is_super_admin: ctx.role === 'super_admin',
        is_moderator: ctx.role === 'moderator',
        is_banned: false,
        username: ctx.username,
        role: ctx.role,
        account_status: 'active'
      };
      staffVerified = ['moderator','admin','senior_admin','super_admin'].includes(ctx.role);
      // Update PROF cache
      if(PROF){
        PROF.is_admin = myProfile.is_admin;
        PROF.is_super_admin = myProfile.is_super_admin;
        PROF.is_moderator = myProfile.is_moderator;
        PROF.is_banned = false;
        PROF.role = ctx.role;
        PROF.account_status = 'active';
        PROF._permissions = ctx.permissions;
        PROF._feature_flags = ctx.feature_flags;
        PROF._admin_context_verified = true;
      }
    }
  } catch(e) {
    body.innerHTML = `<div style="padding:40px;text-align:center">
      <div style="margin-bottom:14px">${ico('shield','#FF2D7A',40)}</div>
      <div style="color:#FF2D7A;font-weight:700;font-size:16px;margin-bottom:6px">Verification Failed</div>
      <div style="color:#8A8A8A;font-size:12px;margin-bottom:20px">${e.message || 'Could not verify'}</div>
      <button onclick="closeModal()" style="padding:10px 24px;background:rgba(255,45,122,0.1);border:1px solid #FF2D7A;border-radius:10px;color:#FF2D7A;font-weight:700;cursor:pointer">Close</button>
    </div>`;
    return;
  }

  if(!staffVerified){
    body.innerHTML = `<div style="padding:40px;text-align:center">
      <div style="margin-bottom:14px">${ico('lock','#FF2D7A',40)}</div>
      <div style="color:#FF2D7A;font-weight:700;font-size:16px;margin-bottom:6px">Access Denied</div>
      <div style="color:#8A8A8A;font-size:13px;margin-bottom:20px">${myProfile?.is_banned ? 'Your account is banned.' : 'You do not have admin privileges.'}</div>
      <button onclick="closeModal()" style="padding:10px 24px;background:rgba(255,45,122,0.1);border:1px solid #FF2D7A;border-radius:10px;color:#FF2D7A;font-weight:700;cursor:pointer">Close</button>
    </div>`;
    return;
  }

  renderAdminPanelUI(myProfile, body);
};
