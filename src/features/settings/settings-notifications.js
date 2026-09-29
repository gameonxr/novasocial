// Extracted from index.html during Phase 81.
async function showSettingsNotifications(){
  const m=modal('Notifications');
  const body=m.querySelector('#mbody');
  body.innerHTML='<div style="padding:16px;display:flex;flex-direction:column;gap:8px"><div class="ldiv"><div class="spin"></div></div></div>';
  let prefs = null;
  try {
    const{data}=await db.from('notification_preferences').select('*').eq('user_id',ME.id).maybeSingle();
    prefs = data;
  } catch(e) {}
  const get = (col) => prefs ? (prefs[col] !== false) : true;
  const val = (col) => get(col) ? '<span style="color:#3db83d;font-size:12px;font-weight:700">ON</span>' : '<span style="color:#555;font-size:12px;font-weight:700">OFF</span>';

  // ── Push notification status (device-level permission + subscription) ──
  const pushSupported = ('serviceWorker' in navigator) && ('PushManager' in window);
  let pushStatusHtml = '';
  if (!pushSupported) {
    pushStatusHtml = '<span style="color:#555;font-size:11px;font-weight:700">NOT SUPPORTED</span>';
  } else if (Notification.permission === 'granted') {
    pushStatusHtml = '<span style="color:#3db83d;font-size:12px;font-weight:700">ON</span>';
  } else if (Notification.permission === 'denied') {
    pushStatusHtml = '<span style="color:#E1306C;font-size:12px;font-weight:700">BLOCKED</span>';
  } else {
    pushStatusHtml = '<span style="color:#555;font-size:12px;font-weight:700">OFF</span>';
  }
  const pushRowAction = (pushSupported && Notification.permission !== 'denied')
    ? 'onclick="enablePushFromSettings()"'
    : '';
  const pushRowStyle = (pushSupported && Notification.permission !== 'granted' && Notification.permission !== 'denied')
    ? 'border-color:rgba(255,45,122,0.25);background:linear-gradient(135deg,rgba(255,45,122,0.05),rgba(131,58,180,0.05))'
    : '';
  const pushRowDesc = !pushSupported
    ? 'Browser does not support push notifications'
    : Notification.permission === 'denied'
      ? 'Blocked in browser settings — enable in site permissions to receive notifications'
      : Notification.permission === 'granted'
        ? 'Device-level push enabled — manage individual types below'
        : 'Tap to enable device notifications for messages, likes, follows';

  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:8px">
    <div ${pushRowAction} class="nova-setting-row" style="${pushRowStyle}">
      ${ico('bell','#FF2D7A',18)}
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px;color:#fff">Push Notifications</div>
        <div style="font-size:11px;color:#8A8A8A">${pushRowDesc}</div>
      </div>
      ${pushStatusHtml}
    </div>
    ${(pushSupported && Notification.permission === 'granted') ? `
    <div onclick="resetPushFromSettings()" class="nova-setting-row" style="border-color:rgba(255,170,0,0.15);background:rgba(255,170,0,0.03)">
      ${ico('refresh','#ffaa00',18)}
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px;color:#fff">Reset Push Subscription</div>
        <div style="font-size:11px;color:#8A8A8A">Unsubscribe + resubscribe with current key (fixes stale endpoints)</div>
      </div>
      ${ico('chevron_right','#555',16)}
    </div>` : ''}
    <div style="height:6px"></div>
    <div style="color:#555;font-size:10px;font-weight:700;padding:0 4px;letter-spacing:0.5px">IN-APP NOTIFICATION TYPES</div>
    <div onclick="toggleNotifSetting('likes')" class="nova-setting-row">${ico('heart','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Likes</div><div style="font-size:11px;color:#8A8A8A">When someone likes your post</div></div>${val('likes')}</div>
    <div onclick="toggleNotifSetting('comments')" class="nova-setting-row">${ico('comment','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Comments</div><div style="font-size:11px;color:#8A8A8A">When someone comments</div></div>${val('comments')}</div>
    <div onclick="toggleNotifSetting('mentions')" class="nova-setting-row">${ico('at','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Mentions</div><div style="font-size:11px;color:#8A8A8A">When someone mentions you</div></div>${val('mentions')}</div>
    <div onclick="toggleNotifSetting('messages')" class="nova-setting-row">${ico('msg','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Messages</div><div style="font-size:11px;color:#8A8A8A">Direct messages</div></div>${val('messages')}</div>
    <div onclick="toggleNotifSetting('follows')" class="nova-setting-row">${ico('user','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Follows</div><div style="font-size:11px;color:#8A8A8A">New followers</div></div>${val('follows')}</div>
    <div onclick="toggleNotifSetting('tags')" class="nova-setting-row">${ico('tag','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Tags</div><div style="font-size:11px;color:#8A8A8A">When you're tagged in a post</div></div>${val('tags')}</div>
    <div onclick="toggleNotifSetting('reels')" class="nova-setting-row">${ico('film','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Reels</div><div style="font-size:11px;color:#8A8A8A">Reel interactions</div></div>${val('reels')}</div>
    <div onclick="toggleNotifSetting('stories')" class="nova-setting-row">${ico('cam','#ffaa00',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Stories</div><div style="font-size:11px;color:#8A8A8A">Story replies & views</div></div>${val('stories')}</div>
  </div>`;
}
