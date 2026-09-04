const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const expectedNames = [
  '_addingNewAccount', '_autoPurgeRunning', '_callIncomingSubscription', '_callReconnectTimeout',
  '_callRingTimeout', '_callStatusSub', '_chColor', '_chIcon', '_chatCid', '_chatGcAvatar',
  '_chatGcName', '_chatIsAdmin', '_chatMembers',   '_chatOtherId', '_chatScreenActive', '_collabAuthor',
  '_collabUsers', '_curChatId', '_curIsGrp', '_exitTimer', '_expiredNotesCleaned', '_expiredStoriesCleaned', '_forwardMessagePending', 'jumpToMessage',
  '_gcAudioCtx', '_gcs', '_historyApiBroken', '_incomingCallTimeout', '_journalMood',
  '_lastKnownFeedTimestamp', '_liveInterval', '_liveStream', '_mentionedUsers', '_msgPagination',
  '_navPopInProgress', '_networkMonitorInterval', '_noteColor', '_noteMusic', '_noteTextDraft',
  '_noteVisibility', '_notesFeedHasMore', '_notesFeedLoading', '_notesFeedOffset', '_notesFeedSeenUsers',
  '_notesSub', '_offlineBanner', '_offlineQueue', '_pendingDeepLinks', '_pendingIceCandidates',
  '_pl', '_pp', '_pr', '_rankedFeedPatched', '_reelsViewMode', '_ringtoneCtx', '_savedReelIndex',
  '_scheduleTime', '_segmentStartSec', '_selectedFilter', '_selfProfileSub', '_stickerCid',
  '_stickerUrls', '_storiesCleanedUp', '_storyFile', '_svMuted', '_svSlideDir', '_tttBoard',
  '_tttTurn', '_userProfilePosts', '_userProfileReels', '_vanishMode', '_videoFullDuration',
  '_videoTrimTo', 'chatSubscription', 'checkUnreadNotifs', 'clearNavDebugLog', 'confirmCropPreview', 'currentMood',
  'generateAICaption', 'getLocalAIResponse', 'handleNovaCommand', 'initNovaFeatures', 'invalidateTabCache', 'loadMoodFeed',
  'loadMoreFeedPosts', 'loadNoteReactorsList', 'navStack', 'notifsSub', 'novaDebug', 'postsSub', 'refreshProfileCounts', 'replyToId', 'replyToText',
  'sendCmt', 'showApp', 'showNavDebugLog', 'showNovaUniverseHub', 'spawnLikeParticles', 'syncLocalDeletionFallback', 'renderDMs', 'renderReels', 'enablePushFromSettings', 'resetPushFromSettings', 'subscribeToPushNotifications', 'forceResubscribePush', 'viewNote', 'removeMyNoteFromViewer', 'deleteMyNote', 'renderStoryElements', 'reactToNote', 'maybeShowPushPermissionBanner', 'silentPushResubscribeIfGranted', '_applyReelsVideoWindowing', 'submitNote', 'toggleLike', 'typingSub', 'setAppealsFilter', 'setReportsFilter', 'setVerifyFilter', 'toggleSVMute', 'cleanupExpiredStories', 'deleteCloudinaryMedia', 'saveAccountSession', 'removeAccountSession', 'updateLastSeen', 'cleanupExpiredStoryMedia', 'startNetworkMonitor', 'unblockUser', 'blockUser', 'adminTabMyApprovals', 'adminTabApprovals', 'moderatorRecommendBan', 'showStaffActions', 'searchUserForPromotion', 'loadTeamList', 'loadAdminDeletedPosts', 'adminRecoverPost', 'adminHardDeletePost', 'adminSoftDeletePost', 'adminDeleteAnyContent', 'loadAdminContent', 'adminTabContent', 'adminTabAudit', 'adminRejectAppeal', 'adminApproveAppeal', 'loadAppealsList', 'adminApproveVerify', 'loadVerifyList', 'adminResolveReport', 'loadReportsList', 'showAdminUserDetail', 'sendAdminNotification', 'logAdminAction', 'adminTabAppeals', 'adminTabVerify', 'adminTabReports', 'go', 'sendNotif', 'sendMediaMsg', 'sendSticker', 'getConnectionQuality', 'unsendMsg', '_silentBackgroundRefresh', 'deleteStory', 'showCallHistory', 'loadUserReportStats', 'adminTabTeam', 'adminPromoteUser', 'isMessagingBlocked', 'adminDemoteToModerator', 'adminPromoteModToAdmin', 'adminTabDashboard', 'uploadCustomSticker', 'sendGif', 'stickerSend', 'submitReport', 'adminPromoteModerator', 'adminRejectVerify', 'shareLocation', 'goBack', 'adminApproveBan', 'checkEmergencyLock', 'showEmergencyLockScreen', 'searchAddMembers', 'createGC', 'reactMsg', 'pinMsg', 'setupPostsRealtime', 'addMemberToGroup', 'clearChat', 'searchGC', 'adminTabUsers', '_uploadToCloudinary', 'callNovaAI', 'submitStory', 'toggleFollowProfile', 'doSearchMessages', 'switchCallCamera', 'svAppendOverlays', '_setupCropDragHandlers', 'switchReelsView', '_attachLocalVideoStream', 'showCallBubble', 'startTypingWatcher', 'showReportDetail', 'showGroupInfo', '_loadOlderMessages', 'applyMoodToFeed', 'pickStoryMedia', 'muteGroup', 'swipeEnd', 'loadGCSuggestions', 'shareStoryAsPost', 'showStoryActions', 'setChatTheme', 'searchAddMember', 'initFabSystem', 'saveGCName', 'loadNotesFeed', 'autoPurgeExpiredSoftDeletes', 'createGroupPeerConnection', 'adminBanUser', 'sendStoryReply', 'listenForGroupSignals', 'listenForSignals', 'uploadGCAvatar', 'leaveGroupCall', '_updateMessageReactionInPlace', 'showGroupCallScreen', 'addRemoteTileToGrid', 'addLocalTileToGrid', 'searchMessages', 'showAppealForm', 'joinGroupCall', 'initiateGroupCall', 'submitBanAppeal', 'adminDemoteUser', 'adminDeleteContentFromReport', 'deleteConversationMedia', '_showNewMessagePill', '_instantCloudinaryDelete', 'setupSpeakingIndicator', 'adminDemoteModerator', 'initiateCall', 'adminBanMsgUser', 'removeMember', 'acceptIncomingCall', 'adminUnbanUser', 'removeAdmin', 'makeAdmin', 'showBanScreen', 'handleIncomingCall', 'setupLocalMedia', 'startCallTimer', 'addToGroup', 'swipeMove', 'showCallMoreMenu', 'enableCallPiP', 'adminUnbanMsgUser', 'listenForGroupParticipants', 'createOfferToParticipant', 'listenForCallStatus', 'setupWebRTCCallee', 'muteUser', 'deleteMsgForMe', 'unmuteUser', 'showAddToCallMenu', 'adminRejectBan', 'adminDismissReport', 'toggleApprovalSystem', 'playRingtone', 'heartReact', 'leaveGroup', 'prevSV', 'nextSV', 'stopSVPlayback', 'toggleGroupMute', 'updateCallStatus', 'setupWebRTCCaller', 'initCallingSystem', 'showGroupCallTypeMenu', 'pinMsgFromEnc', 'prevUserSV', 'nextUserSV', 'restoreCall', 'minimizeCall', 'toggleGroupVideo', 'signOutBanned', 'removeRemoteTile', 'toggleCallSpeaker', 'toggleCallVideo', 'toggleCallMute', 'rejectIncomingCall', 'swipeStart', 'deselectStoryElement', 'closeStoryEditor', 'updateParticipantCount', 'showMsgMenuFromEl', 'reportGroup', 'reactToStory', 'checkUserActiveNote', 'dismissIncomingCallBanner', 'createIncomingCallBanner', 'setTyping', 'loadAdminTab', 'showAdminPanel', 'destroyReelsPersistentContainer', 'invalidateAllTabCache', 'loadProf', 'resetAccountScopedUiState',
].sort();

function collectSourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, files);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

const files = [path.join(repo, 'index.html'), ...collectSourceFiles(path.join(repo, 'src'))].sort();
const allSource = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const matches = [...allSource.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]);
const actualNames = [...new Set(matches)].sort();
const unexpected = actualNames.filter((name) => !expectedNames.includes(name));
const missing = expectedNames.filter((name) => !actualNames.includes(name));

assert.strictEqual(files.length, 426, 'index.html plus 240 extracted modules must be audited after the DMs renderer owner split');
assert.strictEqual(matches.length, 412, 'application surface must retain 221 explicit window assignments after the Notes submission owner split');
assert.deepStrictEqual(unexpected, [], 'no new explicit window assignment names may appear');
assert.deepStrictEqual(missing, [], 'all established window assignment names must remain present');
assert.deepStrictEqual(actualNames, expectedNames, 'window assignment allowlist must remain stable');

console.log('WINDOW_ASSIGNMENT_SURFACE_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log(`WINDOW_ASSIGNMENTS=${matches.length}`);
console.log(`UNIQUE_WINDOW_NAMES=${actualNames.length}`);
console.log('UNEXPECTED_NAMES=0');
console.log('MISSING_NAMES=0');
