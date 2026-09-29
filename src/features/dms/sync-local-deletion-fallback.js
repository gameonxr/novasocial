window.syncLocalDeletionFallback = async function() {
  try {
    const pending = JSON.parse(localStorage.getItem('_mediaDeleteFallback') || '[]');
    if(!pending.length) return;

    console.log(`🔄 Syncing ${pending.length} fallback deletions to Supabase...`);

    for(const item of pending) {
      try {
        await deleteMediaProduction(item.mediaUrl, item.source, item.reason);
      } catch(e) { /* individual failures non-critical */ }
    }

    localStorage.removeItem('_mediaDeleteFallback');
    console.log(`✅ Synced ${pending.length} fallback deletions`);
  } catch(e) {
    console.warn('Fallback sync failed:', e);
  }
}

