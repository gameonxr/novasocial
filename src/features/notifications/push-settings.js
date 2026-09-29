// Push settings owners: window assignments preserve existing inline callers.
window.enablePushFromSettings = async function(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast('Push notifications not supported on this browser');
    return;
  }
  if (Notification.permission === 'denied') {
    toast('Permission blocked — please enable in your browser site settings');
    return;
  }
  if (Notification.permission === 'granted') {
    // Already granted — just make sure subscription is fresh
    toast('Already enabled — refreshing subscription...');
    await subscribeToPushNotifications();
    showSettingsNotifications();  // refresh modal to show updated status
    return;
  }
  // Permission is 'default' — ask
  toast('Requesting permission...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast('Notifications enabled 🔔');
      await subscribeToPushNotifications();
    } else if (permission === 'denied') {
      toast('Permission denied — you can change this in browser settings later');
    } else {
      toast('Permission dismissed — tap again to retry');
    }
  } catch(e) {
    console.error('[Push] Settings enable failed:', e);
    toast('Could not enable notifications 😕');
  }
  showSettingsNotifications();  // refresh modal to show updated status
}

window.resetPushFromSettings = async function(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast('Push notifications not supported on this browser');
    return;
  }
  if (Notification.permission !== 'granted') {
    toast('Please enable push notifications first (tap the row above)');
    return;
  }
  toast('Resetting push subscription...');
  const success = await forceResubscribePush();
  if (success) {
    toast('Push subscription reset ✅');
  } else {
    toast('Reset failed — check console 😕');
  }
  showSettingsNotifications();  // refresh modal
}
