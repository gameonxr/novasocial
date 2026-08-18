function makeMockOps(events, options) {
  const record = (name) => events.push(name);
  return {
    removeIncomingCallSubscription: () => record('teardown.incoming-call-subscription'),
    removeSelfProfileSubscription: () => record('teardown.self-profile-subscription'),
    endActiveCall: () => record('teardown.active-call'),
    stopRingtone: () => record('teardown.ringtone'),
    removeCurrentSavedAccount: () => record('saved.remove-current'),
    removeOverlays: () => record('ui.remove-overlays'),
    clearModalSubPageStack: () => record('ui.clear-modal-subpage-stack'),
    clearNavigationStack: () => record('navigation.clear-before-signout'),
    hideStoryViewer: () => record('stories.hide-viewer'),
    resetAccountScopedUi: () => record('account.reset-before-signout'),
    signOut: () => record('auth.signout'),
    clearIdentity: () => record('identity.clear'),
    clearNavigationAfterSignout: () => record('navigation.clear-after-signout'),
    getRemainingAccounts: () => options.remaining,
    setRemainingSession: () => {
      if (options.sessionResult === 'valid') record('saved.restore-session');
      else throw new Error('saved session invalid');
    },
    removeInvalidSavedAccount: () => record('saved.remove-invalid'),
    scheduleReload: () => record('app.reload.schedule'),
    showAuth: () => record('auth.show'),
  };
}

function mockedLogout(options) {
  const events = [];
  const ops = makeMockOps(events, options);
  ops.removeIncomingCallSubscription();
  ops.removeSelfProfileSubscription();
  if (options.activeCall) ops.endActiveCall();
  ops.stopRingtone();
  ops.removeCurrentSavedAccount();
  ops.removeOverlays();
  ops.clearModalSubPageStack();
  ops.clearNavigationStack();
  ops.hideStoryViewer();
  ops.resetAccountScopedUi();
  ops.signOut();
  ops.clearIdentity();
  ops.clearNavigationAfterSignout();
  if (ops.getRemainingAccounts().length > 0) {
    try {
      ops.setRemainingSession();
      ops.scheduleReload();
    } catch (error) {
      ops.removeInvalidSavedAccount();
      ops.showAuth();
    }
  } else {
    ops.showAuth();
  }
  return events;
}

function assertBefore(events, first, second) {
  const a = events.indexOf(first);
  const b = events.indexOf(second);
  if (a < 0 || b < 0 || a >= b) throw new Error(`Expected ${first} before ${second}: ${JSON.stringify(events)}`);
}

const noAccount = mockedLogout({activeCall: false, remaining: [], sessionResult: null});
const validRemaining = mockedLogout({activeCall: true, remaining: [{userId: 'next'}], sessionResult: 'valid'});
const invalidRemaining = mockedLogout({activeCall: false, remaining: [{userId: 'expired'}], sessionResult: 'invalid'});

for (const events of [noAccount, validRemaining, invalidRemaining]) {
  assertBefore(events, 'account.reset-before-signout', 'auth.signout');
  assertBefore(events, 'auth.signout', 'identity.clear');
  assertBefore(events, 'identity.clear', 'navigation.clear-after-signout');
}
assertBefore(validRemaining, 'teardown.active-call', 'auth.signout');
assertBefore(validRemaining, 'saved.restore-session', 'app.reload.schedule');
if (!noAccount.includes('auth.show') || noAccount.includes('app.reload.schedule')) throw new Error('No-account fallback mismatch');
if (!validRemaining.includes('saved.restore-session') || !validRemaining.includes('app.reload.schedule') || validRemaining.includes('auth.show')) throw new Error('Valid-session recovery mismatch');
if (!invalidRemaining.includes('saved.remove-invalid') || !invalidRemaining.includes('auth.show') || invalidRemaining.includes('app.reload.schedule')) throw new Error('Invalid-session fallback mismatch');
for (const events of [noAccount, validRemaining, invalidRemaining]) {
  for (const token of ['ui.remove-overlays', 'ui.clear-modal-subpage-stack', 'navigation.clear-before-signout', 'stories.hide-viewer']) {
    assertBefore(events, token, 'auth.signout');
  }
}
console.log(JSON.stringify({passed: true, noAccount, validRemaining, invalidRemaining}, null, 2));
