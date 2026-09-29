// showApp — extracted from index.html
// Owner SHA-256: d731d28c692edff53a564e1b7d7b5ae1303655ec91b2616c20a109716892d9e7
// Classic script — exposes window.showApp

window.showApp = function showApp(){
  document.getElementById('auth').style.display='none';
  document.getElementById('root').style.display='flex';
  setupNotifsRealtime();
  setupPostsRealtime();
  initFabSystem();
  startBanRecheck();
  checkEmergencyLock();  // 🛡️ Check if platform is in emergency lock mode
  resetAccountScopedUiState(ME?.id);
  go('home');
  setTimeout(() => { if (ME && typeof initCallingSystem === 'function') initCallingSystem(); }, 1500);
  setTimeout(() => { if (ME && typeof setupSelfProfileRealtimeSync === 'function') setupSelfProfileRealtimeSync(); }, 1500);
  setTimeout(() => { if (ME && typeof setupNotesRealtime === 'function') setupNotesRealtime(); }, 1500); // 📝 Notes realtime
  syncCurrentAccountToSavedList(); // 👥 Save current session to multi-account list
  // ── Part 6 Fix 3: Setup offline/online handlers (likes + follows queue)
  _setupOfflineHandlers();
  // 🔔 PUSH NOTIFICATIONS: Show permission banner (if first time, not yet granted/denied)
  //    AND silently resubscribe if permission was already granted in a previous session.
  maybeShowPushPermissionBanner();
  silentPushResubscribeIfGranted();

  // ═══════════════════════════════════════════════════════════════════
  // 🧹 PRODUCTION MEDIA LIFECYCLE — Background mein run karo, UI block na ho
  // Layer 1: Local fallback queue sync (agar offline tha pehle)
  // Layer 2: Expired stories cleanup (24h+ expired)
  // Layer 3: Expired notes cleanup
  // Layer 4: Admin-only — auto-purge 30-day-old soft-deletes
  // ═══════════════════════════════════════════════════════════════════
  setTimeout(() => {
    if(!ME) return;
    // Sync local fallback queue first (priority — clear backlog)
    if(typeof syncLocalDeletionFallback === 'function') syncLocalDeletionFallback().catch(() => {});
    // Expired stories cleanup
    if(typeof cleanupExpiredStories === 'function') cleanupExpiredStories().catch(() => {});
    // Expired notes cleanup
    if(typeof cleanupExpiredNotes === 'function') cleanupExpiredNotes().catch(() => {});
    // Admin-only: auto-purge old soft-deletes
    if(PROF?.is_admin && typeof autoPurgeExpiredSoftDeletes === 'function') {
      autoPurgeExpiredSoftDeletes().catch(() => {});
    }
  }, 3000);
};
