// ═══════════════════════════════════════════════════════════════
// NovaEngine X Part 6 — Fix 3: Basic Offline Queue
// Scoped to likes + follows only (lowest-risk, most common actions).
// Posts/comments/messages/uploads NOT included — complex failure
// modes deserve separate careful passes later.
// ═══════════════════════════════════════════════════════════════

window._offlineQueue = window._offlineQueue || [];
window._offlineBanner = null;

/**
 * Check karo ki app abhi offline hai ya nahi.
 * navigator.onLine unreliable ho sakta hai (false negatives), lekin
 * false positives rare hain — safe side pe queue when in doubt.
 */
function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * Persistent offline banner dikhao (top of screen, fixed position).
 * User ko batata hai ki actions save nahi ho rahe — silent failures se
 * confusion prevent karta hai. Multiple calls safe (deduplicates).
 */
function _showOfflineBanner() {
  if (window._offlineBanner) return; // already showing
  const banner = document.createElement('div');
  banner.id = 'nova-offline-banner';
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#E1306C;color:#fff;font-size:13px;font-weight:600;padding:8px 16px;text-align:center;z-index:999998;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:inherit';
  banner.innerHTML = 'No internet connection — some actions may not save';
  document.body.appendChild(banner);
  window._offlineBanner = banner;
  // Push content down so banner doesn't overlap top bars
  document.body.style.paddingTop = '32px';
}

function _hideOfflineBanner() {
  if (window._offlineBanner) {
    window._offlineBanner.remove();
    window._offlineBanner = null;
    document.body.style.paddingTop = '';
  }
}

/**
 * Queue ek action for later replay (when back online).
 * @param {Object} action - { type: 'like'|'follow', payload: {...}, ts: Date.now() }
 */
function _queueOfflineAction(action) {
  action.ts = Date.now();
  window._offlineQueue.push(action);
}

/**
 * Replay all queued actions in order. Failures are silently dropped
 * (e.g., post was deleted while offline — no error toast for minor stuff).
 */
async function _replayOfflineQueue() {
  if (!window._offlineQueue.length) return;
  const queue = [...window._offlineQueue];
  window._offlineQueue = [];
  let syncedCount = 0;

  for (const action of queue) {
    try {
      if (action.type === 'like') {
        if (action.payload.liked) {
          await db.from('likes').upsert({
            user_id: ME.id,
            post_id: action.payload.postId,
            reaction: 'heart'
          }, { onConflict: 'user_id,post_id' });
        } else {
          await db.from('likes').delete()
            .eq('user_id', ME.id)
            .eq('post_id', action.payload.postId);
        }
        syncedCount++;
      } else if (action.type === 'follow') {
        if (action.payload.following) {
          await db.from('follows').insert({
            follower_id: ME.id,
            following_id: action.payload.userId
          });
        } else {
          await db.from('follows').delete()
            .eq('follower_id', ME.id)
            .eq('following_id', action.payload.userId);
        }
        syncedCount++;
      }
    } catch (e) {
      // Silently drop failed action (e.g., post deleted, user blocked)
      console.warn('[OfflineQueue] Action failed on replay, dropping:', action.type, e.message);
    }
  }

  if (syncedCount > 0) {
    toast(syncedCount + ' action' + (syncedCount > 1 ? 's' : '') + ' synced');
  }
}

/**
 * Setup online/offline event listeners. Call once at app boot.
 */
function _setupOfflineHandlers() {
  window.addEventListener('offline', () => {
    console.log('[OfflineQueue] Went offline');
    _showOfflineBanner();
  });
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Back online — replaying queue');
    _hideOfflineBanner();
    _replayOfflineQueue();
  });

  // Initial state check (in case app loaded while already offline)
  if (isOffline()) {
    _showOfflineBanner();
  }
}
