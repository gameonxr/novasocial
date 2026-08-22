function evaluatePushState({ supported, permission, dismissed, mePresent }) {
  if (!supported) return { banner: false, resubscribe: false, reason: 'unsupported' };
  const banner = permission !== 'granted' && permission !== 'denied' && !dismissed && mePresent;
  const resubscribe = permission === 'granted' && mePresent;
  return { banner, resubscribe, reason: banner ? 'promptable' : resubscribe ? 'granted' : permission };
}

function createInjectedPushPermissionSeam(deps) {
  const calls = [];
  return {
    calls,
    evaluate(input) {
      calls.push('evaluate');
      return deps.evaluate(input);
    },
    request(input) {
      calls.push('request');
      return deps.request(input);
    },
  };
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

  const seam = createInjectedPushPermissionSeam({ evaluate: evaluatePushState, request: mockedPermissionRequest });
  const injectedState = seam.evaluate({ supported: true, permission: 'granted', dismissed: false, mePresent: true });
  const injectedRequest = await seam.request('granted');
  if (JSON.stringify(seam.calls) !== JSON.stringify(['evaluate', 'request'])) {
    throw new Error('Injected Push permission seam dispatch mismatch');
  }
  if (!injectedState.resubscribe || !injectedRequest.includes('push.subscribe') || !injectedRequest.includes('banner.remove')) {
    throw new Error('Injected Push permission seam outcome mismatch');
  }
  console.log(JSON.stringify({ passed: true, states: { unsupported, granted, denied, dismissed, loggedOutBeforeDelay, defaultPromptable }, grantedRequest, deniedRequest, seam: { calls: seam.calls, injectedState, injectedRequest } }, null, 2));
})();
