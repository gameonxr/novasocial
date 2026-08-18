function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockAdminGate({ rpc, fallbackProfile, rpcThrows = false }) {
  const events = ['modal.open', 'verification.loading'];
  let staffVerified = false;
  let myProfile = null;
  let adminContext = null;
  try {
    if (rpcThrows) throw new Error('verification unavailable');
    if (rpc?.error || !rpc?.data || rpc.data.error) {
      events.push('fallback.profile-query');
      myProfile = fallbackProfile;
      staffVerified = Boolean((fallbackProfile?.is_admin === true || fallbackProfile?.is_moderator === true) && fallbackProfile?.is_banned !== true);
      events.push(staffVerified ? 'access.granted:fallback' : 'access.denied:fallback');
    } else {
      adminContext = rpc.data;
      myProfile = {
        is_admin: ['admin', 'senior_admin', 'super_admin'].includes(rpc.data.role),
        is_super_admin: rpc.data.role === 'super_admin',
        is_moderator: rpc.data.role === 'moderator',
        is_banned: false,
        username: rpc.data.username,
        role: rpc.data.role,
        account_status: 'active',
      };
      staffVerified = ['moderator', 'admin', 'senior_admin', 'super_admin'].includes(rpc.data.role);
      events.push(`access.${staffVerified ? 'granted' : 'denied'}:rpc:${rpc.data.role}`);
    }
  } catch (error) {
    events.push(`verification.failed:${error.message}`);
    return { staffVerified: false, myProfile, adminContext, events, panel: 'verification-failed' };
  }
  if (!staffVerified) {
    events.push(`denial.reason:${myProfile?.is_banned ? 'banned' : 'not-staff'}`);
    return { staffVerified, myProfile, adminContext, events, panel: 'access-denied' };
  }
  events.push('render-admin-panel');
  return { staffVerified, myProfile, adminContext, events, panel: 'admin-panel' };
}

(() => {
  const moderator = mockAdminGate({ rpc: { data: { role: 'moderator', username: 'mod', permissions: ['reports'] } } });
  const admin = mockAdminGate({ rpc: { data: { role: 'admin', username: 'admin' } } });
  const senior = mockAdminGate({ rpc: { data: { role: 'senior_admin', username: 'senior' } } });
  const superAdmin = mockAdminGate({ rpc: { data: { role: 'super_admin', username: 'root' } } });
  for (const result of [moderator, admin, senior, superAdmin]) {
    assert(result.staffVerified && result.panel === 'admin-panel' && result.events.includes('render-admin-panel'), `Secure staff role must grant panel: ${JSON.stringify(result)}`);
  }
  assert(moderator.myProfile.is_moderator === true && moderator.myProfile.is_admin === false, 'Moderator role mapping must remain distinct');
  assert(superAdmin.myProfile.is_super_admin === true && superAdmin.myProfile.is_admin === true, 'Super-admin role mapping must include admin and super-admin flags');

  const ordinaryRpcRole = mockAdminGate({ rpc: { data: { role: 'user', username: 'user' } } });
  assert(!ordinaryRpcRole.staffVerified && ordinaryRpcRole.panel === 'access-denied' && ordinaryRpcRole.events.includes('denial.reason:not-staff'), 'Ordinary RPC role must be denied');

  const fallbackAdmin = mockAdminGate({ rpc: { data: null, error: { message: 'RPC missing' } }, fallbackProfile: { is_admin: true, is_moderator: false, is_banned: false, username: 'legacy-admin' } });
  const fallbackModerator = mockAdminGate({ rpc: { data: null, error: { message: 'RPC missing' } }, fallbackProfile: { is_admin: false, is_moderator: true, is_banned: false, username: 'legacy-mod' } });
  assert(fallbackAdmin.panel === 'admin-panel' && fallbackAdmin.events.includes('fallback.profile-query'), 'Legacy admin fallback must grant access when not banned');
  assert(fallbackModerator.panel === 'admin-panel', 'Legacy moderator fallback must grant access when not banned');

  const fallbackBanned = mockAdminGate({ rpc: { data: null, error: { message: 'RPC missing' } }, fallbackProfile: { is_admin: true, is_moderator: false, is_banned: true } });
  const fallbackOrdinary = mockAdminGate({ rpc: { data: null, error: { message: 'RPC missing' } }, fallbackProfile: { is_admin: false, is_moderator: false, is_banned: false } });
  assert(fallbackBanned.panel === 'access-denied' && fallbackBanned.events.includes('denial.reason:banned'), 'Banned fallback profile must be denied even with admin flag');
  assert(fallbackOrdinary.panel === 'access-denied', 'Ordinary fallback profile must be denied');

  const verificationFailure = mockAdminGate({ rpc: null, rpcThrows: true, fallbackProfile: { is_admin: true } });
  assert(verificationFailure.panel === 'verification-failed' && !verificationFailure.events.includes('render-admin-panel'), 'Verification exception must stop before panel render');

  console.log(JSON.stringify({ passed: true, moderator, admin, senior, superAdmin, ordinaryRpcRole, fallbackAdmin, fallbackModerator, fallbackBanned, fallbackOrdinary, verificationFailure }, null, 2));
})();
