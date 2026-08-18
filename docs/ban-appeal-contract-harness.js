function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockBanRecheck({ me = { id: 'u1' }, profile, dbError = false }) {
  const events = [];
  let active = true;
  if (!me) return { events, active };
  if (dbError) { events.push('db-error.silent'); return { events, active }; }
  if (profile?.is_banned === true) {
    events.push(`ban-screen:${profile.ban_reason || 'Violation of community guidelines'}`);
    events.push('auth.signOut', 'ME.reset', 'PROF.reset', 'root.hide', 'auth.show', 'recheck.clear');
    active = false;
  }
  return { events, active };
}

async function mockSubmitAppeal({ userId, reason, dbErrorMessage = null }) {
  const events = [];
  const normalized = (reason || '').trim();
  if (!normalized) return { events: ['toast:reason-required'], signedOut: false };
  if (!userId) return { events: ['toast:account-missing'], signedOut: false };
  if (dbErrorMessage) {
    const lower = dbErrorMessage.toLowerCase();
    if (lower.includes('does not exist')) events.push('toast:table-missing');
    else if (lower.includes('duplicate') || lower.includes('unique')) events.push('toast:duplicate-pending');
    else if (lower.includes('row-level security')) events.push('toast:rls-blocked');
    else events.push(`toast:appeal-failed:${dbErrorMessage}`);
    return { events, signedOut: false };
  }
  events.push('insert:pending', 'toast:submitted', 'modal.close', 'delayed-signout:1500');
  return { events, signedOut: true };
}

function mockSignOutBanned({ authThrows = false } = {}) {
  const events = [];
  if (authThrows) events.push('auth-error.silent');
  else events.push('auth.signOut');
  events.push('ME.reset', 'PROF.reset', 'ban-screen.remove', 'root.hide', 'auth.show');
  return events;
}

(async () => {
  const banned = mockBanRecheck({ profile: { is_banned: true, ban_reason: 'Spam' } });
  assert(banned.events.includes('ban-screen:Spam') && banned.events.includes('auth.signOut') && banned.events.includes('recheck.clear'), 'Banned recheck must show screen, sign out, reset session, and clear interval');
  const defaultReason = mockBanRecheck({ profile: { is_banned: true } });
  assert(defaultReason.events.includes('ban-screen:Violation of community guidelines'), 'Missing ban reason must use safe default');
  const active = mockBanRecheck({ profile: { is_banned: false } });
  assert(active.active && active.events.length === 0, 'Non-banned profile must remain active');
  const unavailable = mockBanRecheck({ dbError: true });
  assert(unavailable.active && unavailable.events.includes('db-error.silent'), 'Recheck database errors must fail silently without forced logout');

  const signOut = mockSignOutBanned();
  assert(signOut.includes('auth.signOut') && signOut.includes('ban-screen.remove') && signOut.includes('auth.show'), 'Manual banned-user sign-out must clear overlay and return to auth');
  const signOutError = mockSignOutBanned({ authThrows: true });
  assert(signOutError.includes('auth-error.silent') && signOutError.includes('ME.reset'), 'Manual sign-out must reset local session even when auth sign-out throws');

  const missingReason = await mockSubmitAppeal({ userId: 'u1', reason: '   ' });
  const missingUser = await mockSubmitAppeal({ userId: '', reason: 'I was wrongly banned' });
  assert(missingReason.events.includes('toast:reason-required') && !missingReason.signedOut, 'Empty appeal reason must block submission');
  assert(missingUser.events.includes('toast:account-missing') && !missingUser.signedOut, 'Missing user ID must block submission');

  const submitted = await mockSubmitAppeal({ userId: 'u1', reason: ' I was wrongly banned ' });
  assert(submitted.events.includes('insert:pending') && submitted.events.includes('toast:submitted') && submitted.events.includes('delayed-signout:1500'), 'Valid appeal must insert pending row, confirm, close modal, and schedule sign-out');
  const tableMissing = await mockSubmitAppeal({ userId: 'u1', reason: 'reason', dbErrorMessage: 'ban_appeals does not exist' });
  const duplicate = await mockSubmitAppeal({ userId: 'u1', reason: 'reason', dbErrorMessage: 'duplicate key violates unique constraint' });
  const rls = await mockSubmitAppeal({ userId: 'u1', reason: 'reason', dbErrorMessage: 'row-level security policy violation' });
  const generic = await mockSubmitAppeal({ userId: 'u1', reason: 'reason', dbErrorMessage: 'network unavailable' });
  assert(tableMissing.events.includes('toast:table-missing'), 'Missing appeals table must produce setup guidance');
  assert(duplicate.events.includes('toast:duplicate-pending'), 'Duplicate appeal must produce pending-appeal guidance');
  assert(rls.events.includes('toast:rls-blocked'), 'RLS failure must produce policy guidance');
  assert(generic.events.some(event => event.startsWith('toast:appeal-failed:')), 'Unknown appeal failure must produce generic failure feedback');

  console.log(JSON.stringify({ passed: true, banned, defaultReason, active, unavailable, signOut, signOutError, missingReason, missingUser, submitted, tableMissing, duplicate, rls, generic }, null, 2));
})();
