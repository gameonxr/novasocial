const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const normalStart = html.indexOf('async function subscribeToPushNotifications()');
const forceStart = html.indexOf('async function forceResubscribePush()');
const settingsStart = html.indexOf('async function enablePushFromSettings()');
const resetStart = html.indexOf('async function resetPushFromSettings()');
const settingsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
assert(normalStart >= 0 && forceStart > normalStart, 'normal push helper must precede force helper');
assert(forceStart >= 0, 'force helper must remain in the inline application boundary');
assert(html.indexOf('src/features/push-settings.js') > forceStart, 'force helper must precede settings module');
assert(settingsModule.indexOf('window.enablePushFromSettings') >= 0, 'enable settings owner must remain in the module');
assert(settingsModule.indexOf('window.resetPushFromSettings') > settingsModule.indexOf('window.enablePushFromSettings'), 'enable owner must precede reset owner');
const normal = html.slice(normalStart, forceStart);
const force = html.slice(forceStart, html.indexOf('\n/**', forceStart));
const settings = settingsStart >= 0 ? html.slice(settingsStart, resetStart) : settingsModule;
const reset = resetStart >= 0 ? html.slice(resetStart, html.indexOf('// ═══════════════════════════════════════════════════════════════════════', resetStart)) : settingsModule;

assert(normal.includes("if (!('serviceWorker' in navigator) || !('PushManager' in window))"), 'normal helper must guard unsupported browsers');
assert(normal.includes('if (!ME?.id)'), 'normal helper must guard missing logged-in user');
assert(normal.includes('navigator.serviceWorker.ready'), 'normal helper must use the ready service worker');
assert(normal.includes('registration.pushManager.getSubscription()'), 'normal helper must reuse an existing subscription');
assert(normal.includes('userVisibleOnly: true'), 'new subscription must retain userVisibleOnly');
assert(normal.includes('applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)'), 'new subscription must retain current VAPID key');
assert(normal.includes("db.from('push_subscriptions').upsert("), 'normal helper must upsert push subscription data');
assert(normal.includes("{ onConflict: 'endpoint' }).throwOnError();"), 'normal helper must retain endpoint conflict/error boundary');
assert(normal.includes('return true;'), 'normal helper must retain success return');
assert(normal.includes('return false;'), 'normal helper must retain failure returns');

assert(force.includes("if (!('serviceWorker' in navigator) || !('PushManager' in window))"), 'force helper must guard unsupported browsers');
assert(force.includes('if (!ME?.id)'), 'force helper must guard missing logged-in user');
assert(force.includes('registration.pushManager.getSubscription()'), 'force helper must inspect the existing subscription');
assert(force.includes('await existingSub.unsubscribe();'), 'force helper must unsubscribe the old browser subscription');
assert(force.includes("db.from('push_subscriptions').delete().eq('endpoint', existingSub.endpoint)"), 'force helper must delete the old endpoint row');
assert(force.includes('const result = await subscribeToPushNotifications();'), 'force helper must call the normal subscribe helper');
assert(force.includes('return result;'), 'force helper must return fresh-subscribe result');
assert(force.includes('return false;'), 'force helper must retain failure returns');

assert(settings.includes('Notification.permission === \'denied\''), 'enable settings flow must retain denied permission guard');
assert(settings.includes('Notification.requestPermission()'), 'enable settings flow must retain permission request');
assert(settings.includes('await subscribeToPushNotifications();'), 'enable settings flow must call normal subscription');
assert(reset.includes("Notification.permission !== 'granted'"), 'reset settings flow must require granted permission');
assert(reset.includes('await forceResubscribePush()'), 'reset settings flow must call force resubscribe');

console.log('CLIENT_PUSH_SUBSCRIPTION_HARNESS=PASS');
console.log('NORMAL_SUBSCRIBE_BOUNDARY=PASS');
console.log('FORCE_RESUBSCRIBE_BOUNDARY=PASS');
console.log('SETTINGS_INTEGRATION=PASS');
console.log('RUNTIME_PUSH_SIDE_EFFECTS=0');
