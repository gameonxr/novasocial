// adminBanUser — extracted from index.html
// Owner SHA-256: 2adbc78714f27b8d0aa3f6b92f7df2f7826a37aa723701cef7fdb993409aba4f
// Classic script — exposes window.adminBanUser

window.adminBanUser = async function adminBanUser(userId, username){
  console.log('%c[BAN] adminBanUser called | userId=' + userId + ' | PROF.is_super_admin=' + PROF?.is_super_admin + ' (type: ' + typeof PROF?.is_super_admin + ')', 'color:red;font-weight:bold');

  if(PROF?.is_super_admin !== true){
    console.log('%c[BAN] Entering pre-check branch (PROF.is_super_admin is NOT strictly true)', 'color:orange');
    try {
      const { data: targetUser, error: preErr } = await db.from('profiles').select('is_admin, is_super_admin').eq('id', userId).single();
      console.log('%c[BAN] pre-check query result:', 'color:cyan', targetUser, 'error:', preErr);
      if(targetUser?.is_super_admin){ console.log('[BAN] BLOCKED: target is super_admin'); toast('❌ Cannot ban a super admin'); return; }
      if(targetUser?.is_admin){ console.log('[BAN] BLOCKED: target is admin'); toast('❌ Only super admin can ban other admins'); return; }
    } catch(e) { console.log('%c[BAN] pre-check threw error:', 'color:red', e); }
  } else {
    console.log('%c[BAN] Skipped pre-check (user IS super_admin)', 'color:lime');
  }

  console.log('%c[BAN] About to show prompt()...', 'color:yellow');
  const reason = prompt(`Ban user "${username}"?\n\nReason:`);
  console.log('%c[BAN] prompt() returned: "' + reason + '"', 'color:yellow');
  if(!reason||!reason.trim()){ console.log('[BAN] Aborted — no reason entered'); return; }

  try {
    console.log('%c[BAN] Calling db.rpc(ban_user)...', 'color:cyan');
    const { error } = await db.rpc('ban_user', {
      p_target_id: userId,
      p_reason: reason.trim(),
      p_is_permanent: true
    });
    console.log('%c[BAN] RPC returned. error=', 'color:cyan', error);
    if(error) throw error;
    await sendAdminNotification(userId, `🚫 Your account has been banned. Reason: ${reason.trim()}`);
    toast(`✅ ${username} banned`); closeModal();
    setTimeout(()=>searchAdminUsers(document.getElementById('admin-user-search')?.value||''),300);
  } catch(e) {
    console.log('%c[BAN] CAUGHT ERROR:', 'color:red;font-weight:bold', e);
    const msg = e.message || '';
    if(msg.includes('PROTECTED_ACCOUNT') || msg.includes('super_admin')) toast('❌ Cannot ban a super admin');
    else if(msg.includes('PERMISSION_DENIED')) toast('❌ Permission denied: ' + msg);
    else if(msg.includes('INSUFFICIENT_RANK')) toast('❌ Your role cannot ban this user');
    else toast('❌ Ban failed: ' + msg);
  }
};
