// Classic global owner extracted from index.html with exact origin parity.
window.maybeShowPushPermissionBanner = function maybeShowPushPermissionBanner() {
  // Skip if push not supported
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  // Skip if already granted (we silently resubscribe separately in showApp)
  if (Notification.permission === 'granted') return;
  // Skip if explicitly denied before — user said no, respect that
  if (Notification.permission === 'denied') return;
  // Skip if user already dismissed our banner once for this account
  const dismissedKey = 'nova_push_banner_dismissed_' + (ME?.id || 'anon');
  try {
    if (localStorage.getItem(dismissedKey) === '1') return;
  } catch(e) {}

  // Show the banner after a short delay (let user settle into the app)
  setTimeout(() => {
    if (!ME) return;  // user logged out in the meantime
    if (document.getElementById('push-permission-banner')) return;  // already shown

    const banner = document.createElement('div');
    banner.id = 'push-permission-banner';
    banner.style.cssText = 'position:fixed;bottom:80px;left:12px;right:12px;background:linear-gradient(135deg,#0A0A0A,#1a0533);border:1px solid rgba(255,45,122,0.25);border-radius:18px;padding:14px 16px;display:flex;align-items:center;gap:12px;z-index:9998;box-shadow:0 8px 30px rgba(0,0,0,0.6);animation:novaFadeIn 0.3s ease';

    banner.innerHTML = `
      <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#FF2D7A,#833AB4);display:flex;align-items:center;justify-content:center;flex-shrink:0">${ico('bell','#fff',20)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;color:#fff;margin-bottom:2px">Turn on notifications</div>
        <div style="font-size:11px;color:#999;line-height:1.4">Never miss a message, like, or follow</div>
      </div>
      <button id="push-banner-enable" style="background:linear-gradient(135deg,#FF2D7A,#833AB4);color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0">Enable</button>
      <div id="push-banner-dismiss" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${ico('close','#666',16)}</div>
    `;

    document.body.appendChild(banner);

    // Enable button — request permission, then subscribe if granted
    banner.querySelector('#push-banner-enable').onclick = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast('Notifications enabled 🔔');
          await subscribeToPushNotifications();
        } else {
          toast('You can enable later in Settings');
        }
      } catch(e) {
        console.error('[Push] Permission request failed:', e);
      }
      banner.remove();
    };

    // Dismiss button — record in localStorage so we don't nag again
    banner.querySelector('#push-banner-dismiss').onclick = () => {
      try { localStorage.setItem(dismissedKey, '1'); } catch(e) {}
      banner.remove();
    };
  }, 4000);
}
