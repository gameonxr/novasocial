// ═══════════════════════════════════════════════════════════════
// Push Subscription Owner — extracted from index.html
// Authorization: docs/push-subscription-owner-production-authorization-addendum.md
// Origin owner SHA-256: b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4
// Classic script — exposes window.subscribeToPushNotifications
// No ES modules, no defer, no async load strategy.
// ═══════════════════════════════════════════════════════════════

window.subscribeToPushNotifications = async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported on this browser');
    return false;
  }
  if (!ME?.id) {
    console.warn('[Push] No logged-in user — skipping subscribe');
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('[Push] New subscription created');
    } else {
      console.log('[Push] Existing subscription found — refreshing DB record');
    }
    const subJson = subscription.toJSON();
    await db.from('push_subscriptions').upsert({
      user_id: ME.id,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
      device_info: navigator.userAgent.substring(0, 200),
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' }).throwOnError();
    console.log('[Push] Subscribed and saved successfully');
    return true;
  } catch (e) {
    console.error('[Push] Subscribe failed:', e);
    return false;
  }
};
