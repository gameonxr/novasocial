function evaluatePushState({ supported, permission, dismissed, mePresent }) {
  if (!supported) return { banner: false, resubscribe: false, reason: 'unsupported' };
  const banner = permission !== 'granted' && permission !== 'denied' && !dismissed && mePresent;
  const resubscribe = permission === 'granted' && mePresent;
  return { banner, resubscribe, reason: banner ? 'promptable' : resubscribe ? 'granted' : permission };
}

async function mockedPermissionRequest(permissionResult) {
  const events = ['permission.request'];
  if (permissionResult === 'granted') {
    events.push('toast.enabled', 'push.subscribe');
  } else {
    events.push('toast.defer');
  }
  events.push('banner.remove');
  return events;
}

const unsupported = evaluatePushState({ supported: false, permission: 'default', dismissed: false, mePresent: true });
const granted = evaluatePushState({ supported: true, permission: 'granted', dismissed: false, mePresent: true });
const denied = evaluatePushState({ supported: true, permission: 'denied', dismissed: false, mePresent: true });
const dismissed = evaluatePushState({ supported: true, permission: 'default', dismissed: true, mePresent: true });
const loggedOutBeforeDelay = evaluatePushState({ supported: true, permission: 'default', dismissed: false, mePresent: false });
const defaultPromptable = evaluatePushState({ supported: true, permission: 'default', dismissed: false, mePresent: true });

if (unsupported.banner || unsupported.resubscribe) throw new Error('Unsupported Push must be silent');
if (granted.banner || !granted.resubscribe) throw new Error('Granted Push must silently resubscribe only');
if (denied.banner || denied.resubscribe) throw new Error('Denied Push must not prompt or resubscribe');
if (dismissed.banner || dismissed.resubscribe) throw new Error('Dismissed banner must stay suppressed');
if (loggedOutBeforeDelay.banner || loggedOutBeforeDelay.resubscribe) throw new Error('Logged-out delayed guard mismatch');
if (!defaultPromptable.banner || defaultPromptable.resubscribe) throw new Error('Default permission must be promptable');

(async () => {
  const grantedRequest = await mockedPermissionRequest('granted');
  const deniedRequest = await mockedPermissionRequest('denied');
  if (JSON.stringify(grantedRequest) !== JSON.stringify(['permission.request','toast.enabled','push.subscribe','banner.remove'])) {
    throw new Error('Granted request contract mismatch');
  }
  if (JSON.stringify(deniedRequest) !== JSON.stringify(['permission.request','toast.defer','banner.remove'])) {
    throw new Error('Denied request contract mismatch');
  }
  console.log(JSON.stringify({ passed: true, states: { unsupported, granted, denied, dismissed, loggedOutBeforeDelay, defaultPromptable }, grantedRequest, deniedRequest }, null, 2));
})();
