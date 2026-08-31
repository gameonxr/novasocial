window.silentPushResubscribeIfGranted = function() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (Notification.permission !== 'granted') return;
  // Small delay so it doesn't compete with the initial app render
  setTimeout(async () => {
    if (!ME) return;
    await subscribeToPushNotifications();
  }, 5000);
};
