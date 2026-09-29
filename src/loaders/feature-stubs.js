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

(function () {
  'use strict';

  function stubFeatureFn(feature, name) {
    if (typeof window[name] !== 'undefined') return; // real definition already present
    const stub = function () {
      const args = arguments;
      const self = this;
      return window.loadFeature(feature).then(function () {
        const real = window[name];
        if (real === stub || typeof real !== 'function') {
          console.error('[FeatureLoader] feature "' + feature + '" loaded but did not define ' + name);
          if (window.toast) window.toast('Something went wrong — please try again');
          return Promise.reject(new Error('missing ' + name + ' in feature ' + feature));
        }
        return real.apply(self, args);
      });
    };
    stub.__novaFeatureStub = feature; // marker for diagnostics
    window[name] = stub;
  }

  const STUBS = {
    // ai — static AI panel HTML + FAB/logo long-press + create-flow entry points
    ai: ['toggleNovaAI', 'sendNovaMsg', 'autoGrowNova', 'novaSuggest',
         'startVoiceAssistant', 'startVoiceConversation', 'generateAICaption',
         'getLocalAIResponse', 'handleNovaCommand', 'callNovaAI', 'detectUserMood',
         'showAIVideoEditor', 'showAIJournal'],
    // stories — feed story ring, FAB create, back-nav, media tools
    stories: ['showCreateStory', 'openSV', 'closeSV', 'trimVideo',
              'showVideoLengthOptions', 'showFilterTray', 'openCropPreview'],
    // dms — profile/post notifications deep links, blocking, media deletion
    dms: ['openChat', 'startDM', 'showNewDM', 'replyMsg', 'blockUser', 'unblockUser',
          'muteUser', 'unmuteUser', 'deleteMultipleMediaProduction',
          '_updateMessageReactionInPlace', 'loadNotesBar'],
    // groups — DMs screen create-group entry
    groups: ['showGC', 'createGC', 'showGroupInfo'],
    // calls — incoming-call realtime + profile/dms call buttons
    calls: ['initiateCall', 'handleIncomingCall', 'showCallFeature', 'showCallHistory',
            'showCallBubble', 'initiateGroupCall', 'joinGroupCall', 'showGroupCallScreen',
            'showGroupCallTypeMenu', 'endCall'],
    // profile — main tab + post-card avatar + universe hub
    profile: ['renderProfile', 'showUserProfile', 'viewAvatarFullscreen',
              'showAvatarCreator', 'logout'],
    // explore — main tab + trending chips + hashtag extraction + search
    explore: ['renderExplore', 'showTrendingPage', 'searchHashtag',
              '_extractAndStoreHashtags', 'doSearch', 'universalAISearch'],
    // notes — universe hub + profile active-note + AI commands
    notes: ['showNotes', 'createNote', 'openNoteCreator', 'viewNote'],
    // admin — FAB/admin entry
    admin: ['showAdminPanel'],
    // settings — profile gear + notifications panel + creator wallet links
    settings: ['showEdit', 'showSettingsNotifications', 'showAISettings',
               'showTipsSettings', 'showPaidPostSettings', 'showMembershipSettings'],
    // discover features — universe hub + AI command entries
    marketplace: ['showMarketplace'],
    communities: ['showCommunities', 'createCommunity', 'createChannel'],
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
})();
