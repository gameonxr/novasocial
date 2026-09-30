// NovaSocial feature stubs — boundary API for demand-loaded features.
// Part of the feature-based architecture migration
// (project-management/architecture/ARCHITECTURE.md).
//
// Each entry function of a LAZY feature that can be invoked before the feature
// chunk has loaded gets a stub: load the feature, then re-dispatch to the real
// definition (the chunk's classic script overwrites window[name] when it
// evaluates). Stubs are installed only for names still undefined at startup, so
// transitional eager states keep their real definitions.
//
// Tab renderers (renderReels/renderExplore/renderDMs/renderProfile) are ALSO
// gated inside go(); stubs for them are harmless belt-and-suspenders.
//
// ── FAILURE HARDENING (post-migration repair) ────────────────────────────
// A stub's re-dispatch now handles chunk-load FAILURE:
//   - the user gets a visible toast (no more silent unhandled rejections);
//   - if a PARTIALLY-executed chunk already overwrote the stub with a real
//     definition, that definition is remembered (__novaPartialReal) and the
//     stub is RE-INSTALLED — the demand-loading boundary is never permanently
//     destroyed, and the next invocation retries the load instead of running
//     a half-loaded feature. The partial definition is re-dispatched only
//     after the retry completes the chunk.
// The loader calls __novaFeatureStubs.onFeatureFailure(feature) on every
// chunk rejection (see src/loaders/feature-loader.js).

(function () {
  'use strict';

  // feature -> [{name, stub}] registry for boundary restoration
  const registry = {};

  function stubFeatureFn(feature, name) {
    if (typeof window[name] !== 'undefined') return; // real definition already present
    const stub = function () {
      const args = arguments;
      const self = this;
      return window.loadFeature(feature).then(function () {
        let real = window[name];
        // chunk completed but this file was already evaluated during a FAILED
        // earlier attempt (loader per-URL dedup skips it on retry) — use the
        // remembered partial definition.
        if (real === stub && stub.__novaPartialReal) real = stub.__novaPartialReal;
        if (real === stub || typeof real !== 'function') {
          console.error('[FeatureLoader] feature "' + feature + '" loaded but did not define ' + name);
          if (window.toast) window.toast('Something went wrong — please try again');
          return Promise.reject(new Error('missing ' + name + ' in feature ' + feature));
        }
        return real.apply(self, args);
      }, function (err) {
        // chunk load failed → visible, recoverable failure (no zombie state)
        console.error('[FeatureLoader] feature "' + feature + '" failed to load (' + name + '):', err && err.message);
        if (window.toast) window.toast('Feature load ho payi nahi — dobara try karein');
        throw err; // JS callers can await/catch; inline handlers already saw the toast
      });
    };
    stub.__novaFeatureStub = feature; // marker for diagnostics
    stub.__novaPartialReal = null;    // set on partial-failure restoration
    (registry[feature] = registry[feature] || []).push({ name: name, stub: stub });
    window[name] = stub;
  }

  const STUBS = {
    // ai — static AI panel HTML + FAB/logo long-press + create-flow entry points
    ai: ['toggleNovaAI', 'sendNovaMsg', 'autoGrowNova', 'novaSuggest',
         'startVoiceAssistant', 'startVoiceConversation', 'generateAICaption',
         'generateAIHashtags',
         'getLocalAIResponse', 'handleNovaCommand', 'callNovaAI', 'detectUserMood',
         'showAIVideoEditor', 'showAIJournal'],
    // stories — feed story ring, FAB create, back-nav, media tools, highlights
    // (profile tab + settings rows link here), post-create editor tools
    // (eager posts/create.js renders the same tool buttons)
    stories: ['showCreateStory', 'openSV', 'closeSV', 'trimVideo',
              'showVideoLengthOptions', 'showFilterTray', 'openCropPreview',
              'showHighlights',
              'seOpenTextTool', 'seOpenDrawTool', 'seOpenStickerTool', 'seOpenMusicTool'],
    // dms — DMs tab renderer (go('dms') calls renderDMs() on cache-miss before
    // the chunk has loaded — same belt-and-suspenders as the other lazy tab
    // renderers; without it go() throws a synchronous ReferenceError into its
    // generic navigation-error catch), profile/post notifications deep links,
    // blocking, media deletion. Additional cross-chunk entries: groups info
    // (search-in-chat / theme picker), settings privacy rows (blocked list /
    // read receipts / disappearing options), notes viewer emoji picker, admin
    // report-detail image viewer, and the eager system cache-restore +
    // silent-background-refresh in-place updater.
    dms: ['renderDMs', 'openChat', 'startDM', 'showNewDM', 'replyMsg', 'blockUser', 'unblockUser',
          'muteUser', 'unmuteUser', 'deleteMultipleMediaProduction',
          '_updateMessageReactionInPlace', 'loadNotesBar',
          'searchMessages', 'setChatTheme', 'openMoreEmojiPicker',
          'showBlockedList', 'toggleReadReceipts', 'showDisappearingOptions',
          'viewChatImage', '_refreshDmsInPlace'],
    // groups — DMs screen create-group entry
    groups: ['showGC', 'createGC', 'showGroupInfo'],
    // calls — incoming-call realtime + profile/dms call buttons
    calls: ['initiateCall', 'handleIncomingCall', 'showCallFeature', 'showCallHistory',
            'showCallBubble', 'initiateGroupCall', 'joinGroupCall', 'showGroupCallScreen',
            'showGroupCallTypeMenu', 'endCall'],
    // profile — main tab + post-card avatar + universe hub + settings-linked
    // surfaces (customizer, collab picker on eager posts/create.js, close
    // friends + ghost mode on settings privacy, deep-link share)
    profile: ['renderProfile', 'showUserProfile', 'viewAvatarFullscreen',
              'showAvatarCreator', 'logout',
              'showProfileCustomizer', 'showCollabPicker',
              'showCloseFriendsManager', 'toggleGhostMode', 'shareUserProfile'],
    // explore — main tab + trending chips + hashtag extraction + search
    explore: ['renderExplore', 'showTrendingPage', 'searchHashtag',
              '_extractAndStoreHashtags', 'doSearch', 'universalAISearch'],
    // notes — universe hub + profile active-note + AI commands + calendar's
    // add-event row (calendar chunk DOM links into notes.js)
    notes: ['showNotes', 'createNote', 'openNoteCreator', 'viewNote', 'addCalendarEvent'],
    // admin — FAB/admin entry + eager report-detail action buttons
    admin: ['showAdminPanel',
            'adminBanUser', 'adminDismissReport', 'adminResolveReport',
            'adminDeleteContentFromReport', 'showAdminUserDetail'],
    // settings — profile gear + notifications panel + creator wallet links +
    // profile tab share button
    settings: ['showEdit', 'showSettingsNotifications', 'showAISettings',
               'showTipsSettings', 'showPaidPostSettings', 'showMembershipSettings',
               'shareProfile'],
    // discover features — universe hub + AI command entries
    marketplace: ['showMarketplace'],
    // communities — universe hub + settings-features channels row
    communities: ['showCommunities', 'createCommunity', 'createChannel', 'showChannels'],
    games: ['showGames'],
    learning: ['showLearning'],
    news: ['showNews'],
    calendar: ['showCalendar'],
    'voice-rooms': ['showVoiceRooms', 'createVoiceRoom'],
    'live-stream': ['showLiveStreamUI'],
    memories: ['showMemories'],
    creator: ['showCreatorWallet'],
    'scheduled-posts': ['showScheduledPosts'],
    // reels — go() tab gate covers the render; stub kept for direct callers
    reels: ['renderReels', '_applyReelsVideoWindowing'],
  };

  for (const feature in STUBS) {
    for (const name of STUBS[feature]) {
      stubFeatureFn(feature, name);
    }
  }

  // ── Boundary restoration hook (called by feature-loader.js) ────────────
  // A chunk load FAILED after some of its files already executed. Any stub
  // this feature owns that the partial execution overwrote with a real
  // definition is restored: the real definition is remembered on the stub and
  // the stub is put back on window. The next invocation retries the load
  // (pendingFeatures was cleared by the loader) instead of running the
  // half-loaded feature — a partially executed feature can never permanently
  // destroy its stub boundary.
  window.__novaFeatureStubs = {
    onFeatureFailure: function (feature) {
      const entries = registry[feature] || [];
      for (let i = 0; i < entries.length; i++) {
        const cur = window[entries[i].name];
        if (cur !== entries[i].stub && typeof cur === 'function') {
          entries[i].stub.__novaPartialReal = cur;
          window[entries[i].name] = entries[i].stub;
        }
      }
    },
  };
})();
