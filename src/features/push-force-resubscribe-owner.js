// ═══════════════════════════════════════════════════════════════
// Force Resubscribe Push Owner — extracted from index.html
// Authorization: docs/push-force-resubscribe-owner-production-authorization-addendum.md
// Origin owner SHA-256: 6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d
// Classic script — exposes window.forceResubscribePush
// No ES modules, no defer, no async load strategy.
// ═══════════════════════════════════════════════════════════════

window.forceResubscribePush = async function forceResubscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported on this browser');
    return false;
  }
  if (!ME?.id) {
    console.warn('[Push] No logged-in user — skipping force resubscribe');
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      await existingSub.unsubscribe(); // browser-level unsubscribe — purani FCM binding hatao
      console.log('[Push] Old subscription unsubscribed at browser level');
      // DB se bhi purani row hatao (endpoint match se)
      await db.from('push_subscriptions').delete().eq('endpoint', existingSub.endpoint);
      console.log('[Push] Old DB row deleted');
    } else {
      console.log('[Push] No existing subscription found — proceeding to fresh subscribe');
    }
    // Fresh subscribe — naya FCM binding banega CURRENT VAPID_PUBLIC_KEY ke saath
    const result = await subscribeToPushNotifications();
    if (result) {
      console.log('[Push] Force resubscribe SUCCESS — new subscription created with current VAPID key');
    } else {
      console.error('[Push] Force resubscribe — fresh subscribe step failed');
    }
    return result;
  } catch(e) {
    console.error('[Push] Force resubscribe failed:', e);
    return false;
  }
};
