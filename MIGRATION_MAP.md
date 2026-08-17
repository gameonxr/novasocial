# NOVASOCIAL MODULARIZATION — PHASE 1 CSS EXTRACTION

**Status**: Phase 1 CSS Extraction Complete

**Date**: 2026-08-15

**Target Branch**: Branch2

**Original Source**: index.html (main branch)

---

## MIGRATION STATUS

| Phase | Status | Verification |
|------:|--------|--------------|
| 0 — Inventory | Complete | Inventory baseline preserved |
| 1 — CSS Extraction | Complete | 18 source-order-preserving stylesheets linked from `index.html`; exact CSS reconstruction and static validation passed; mobile safe-area nav follow-up added in `responsive.css` |
| 2 — Core Setup | In progress | 9 classic core scripts extracted; syntax, script-order, marker-preservation, and whitespace checks passed; DMs/chat-screen cache-refresh guard added after regression report; shared UI, settings, and profile feature modules now extracted; account-switch cache isolation fix added after regression report; Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, Nova Init/FAB, like-effects, and Smart Feed/Mood Feed feature modules now extracted with static checks passing; protected deep-link handlers remain in index.html; full profile, main Story viewer/editor, DMs, Reels, and Calls remain inline; runtime click-through pending |

**Checkpoint**: Phase 2 core extraction and shared components (`modal.js`, `shared-ui.js`) are isolated on `Branch2`. The `main` branch has not been modified. Static checks pass; account-switch reset now covers startup, logout, and add-account transitions; Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, Nova Init/FAB, like-effects, and Smart Feed/Mood Feed module order/syntax checks pass; `nova-init.js` and `like-effects.js` intentionally load after the inline app script so their wrappers see the existing `showApp`, `toggleLike`, and `spawnLikeParticles`; protected `resolveAndOpenProfile`/`processDeepLinks` remain in index.html per critical safeguards; full profile, main Story viewer/editor, DMs, Reels, and Calls remain inline for later careful extraction; modal, navigation, haptic, overlay, FAB, settings, profile, account-switch, Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, Nova Init/FAB, like-effects, and Smart Feed/Mood Feed click-through remain required before additional feature extraction. Smart Feed/Mood Feed globals and all protected fragile globals were verified in the live preview at commit `782d6b2`; the latest remote `main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.

---

## 📋 TABLE OF CONTENTS

1. [HTML Structure](#html-structure)
2. [CSS Sections](#css-sections)
3. [Global State & Variables](#global-state--variables)
4. [Core Functions & Utilities](#core-functions--utilities)
5. [Feature-Specific Code](#feature-specific-code)
6. [External Dependencies](#external-dependencies)
7. [Migration Sequence](#migration-sequence)
8. [Risk Assessment](#risk-assessment)

---

## 🏗️ HTML STRUCTURE

### Main Sections:
```
<body>
  #toast                          → Shared component
  #nova-ai-fab                    → AI Feature
  #nova-ai-panel                  → AI Feature
  .theme-picker-fab              → Themes Feature
  #theme-panel                    → Themes Feature
  #splash                         → Splash/Loading
  #sv (story viewer)              → Stories Feature
  #auth                           → Auth Feature
  #root
    #screen                       → Main content area
    #nav                          → Navigation
    #fab-main                     → FAB menu
    #fab-menu                     → FAB menu
    #fab-longpress-menu           → FAB menu
</body>
```

**Risk Level**: LOW — HTML structure can stay mostly unchanged

---

## 🎨 CSS SECTIONS (Lines 15-504)

### To Extract to `src/styles/`:

| File | Content | Lines | Risk |
|------|---------|-------|------|
| `variables.css` | Design tokens, :root vars, theme definitions | 23-281 | LOW |
| `animations.css` | @keyframes, animation utilities | 55-75, 389-454 | LOW |
| `layout.css` | Core layout, #root, #screen, #nav, #auth | 98-133, 461-468 | LOW |
| `components.css` | Reusable UI: .post, .av, .toast, .modal, .loader | 135-263 | LOW |
| `calls.css` | Call system CSS | 77-85, 388-417 | MEDIUM |
| `stories.css` | Story viewer CSS | 149-163, 154-161 | MEDIUM |
| `chat.css` | Chat UI CSS | 165-177, 220-224 | MEDIUM |
| `responsive.css` | Media queries, accessibility | 496-502 | LOW |
| `performance.css` | GPU optimization, content-visibility | 460-494 | LOW |
| `themes.css` | Theme switching logic | 264-281 | LOW |

**Total CSS**: ~2500+ lines → Can be safely extracted

---

## 🔐 GLOBAL STATE & VARIABLES

### 1. **Authentication State**
```javascript
// Inferred (not explicitly declared in visible excerpt)
amode                    // 'login' | 'signup' (auth mode)
ME                       // Current user object { id, email, username, ... }
PROF                     // Current profile object
```
**Location**: Must be defined early in <script>  
**Used By**: ALL features  
**Risk**: HIGH — Used everywhere  

### 2. **Database & Configuration**
```javascript
SURL                     // Supabase URL (line 894)
SKEY                     // Supabase key (line 895)
db                       // Supabase client (created from SURL + SKEY)
```
**Should Move To**: `src/core/supabase.js`  
**Risk**: HIGH — Critical initialization  

### 3. **Cloudinary Configuration**
```javascript
CLOUDINARY_ACCOUNTS      // Array of { id, cloud, preset, label } (line 900-903)
_cldActiveIdx           // Current active Cloudinary account index (line 904)
CLD                     // Dynamic getter for active cloud name (line 923)
CPRE                    // Dynamic getter for active preset (line 924)
_getCldAccount()        // Get current account
_switchCldAccount()     // Switch between accounts
_checkMonthlyReset()    // Auto-reset to primary on new month
```
**Should Move To**: `src/core/media.js` or `src/features/media/config.js`  
**Risk**: MEDIUM — Used by upload/media features  

### 4. **Offline State**
```javascript
window._offlineQueue     // Array of queued actions
window._offlineBanner    // Offline banner DOM element
isOffline()              // Check if offline
_showOfflineBanner()
_hideOfflineBanner()
_queueOfflineAction()
_replayOfflineQueue()
_setupOfflineHandlers()
```
**Should Move To**: `src/core/offline.js`  
**Risk**: MEDIUM — Complex state management  

### 5. **Event System (NovaEngine X)**
```javascript
NovaEvents              // Event bus { on, off, emit }
NovaEngine              // Boot system { boot, detectDevice, tier, bootTime }
NovaLazy                // Lazy loader { register, load, isLoaded }
```
**Location**: Lines 680-749  
**Should Move To**: `src/core/engine.js`  
**Risk**: LOW — Self-contained  

---

## ⚙️ CORE FUNCTIONS & UTILITIES

### Common Patterns (Need Analysis):
- `toast(message)` — Show toast notification
- `modal(html, options)` — Show modal
- `closeModal()` — Close modal
- `go(tabName)` — Navigate to tab
- `av(user, size)` — Avatar component
- `ico(name)` — Icon helper
- `upload(file, type)` — File upload
- Navigation history: `pushNavState()`, `popNavState()`
- Realtime subscriptions setup

**Status**: Need to find full definitions (not in visible excerpt)

---

## 📦 FEATURE-SPECIFIC CODE

### Based on HTML structure, these features exist:

| Feature | DOM ID | Estimated Code | Risk | Target Module |
|---------|--------|-----------------|------|----------------|
| **Auth** | #auth | ~500 lines | HIGH | `src/features/auth/` |
| **Home Feed** | #screen (when tab=home) | ~2000 lines | HIGH | `src/features/home/` |
| **Posts** | .post, post-related | ~1500 lines | HIGH | `src/features/posts/` |
| **Reels** | .rvid, reel-related | ~1000 lines | HIGH | `src/features/reels/` |
| **Stories** | #sv, story viewer | ~1200 lines | MEDIUM | `src/features/stories/` |
| **Chat/DMs** | .clist, chat-related | ~1000 lines | HIGH | `src/features/chat/` |
| **Calls** | #nova-call-screen, WebRTC | ~1500 lines | CRITICAL | `src/features/calls/` |
| **Notifications** | .nitem | ~800 lines | MEDIUM | `src/features/notifications/` |
| **Profile** | profile rendering | ~1200 lines | MEDIUM | `src/features/profile/` |
| **Search** | search UI | ~400 lines | LOW | `src/features/search/` |
| **Explore** | explore grid | ~400 lines | LOW | `src/features/explore/` |
| **Settings** | settings panel | ~600 lines | MEDIUM | `src/features/settings/` |
| **Themes** | #theme-panel | ~300 lines | LOW | `src/features/themes/` |
| **Nova AI** | #nova-ai-panel | ~400 lines | LOW | `src/features/ai/` |

---

## 🔌 EXTERNAL DEPENDENCIES

### Must Be Initialized Before App Starts:

1. **Supabase Client**
   - CDN: `@supabase/supabase-js@2` (line 13)
   - Creates: `db` global
   - Required By: All features

2. **Cloudinary**
   - Used via CDN upload widget
   - Uses: `CLD`, `CPRE` globals
   - Required By: Media features

3. **WebRTC** (Implicit)
   - Required By: Calls feature
   - Uses: `getUserMedia`, `RTCPeerConnection`

4. **Service Worker** (PWA)
   - Referenced: `/manifest.json`
   - File: `sw.js`
   - Affects: Offline capability

---

## 📊 INLINE EVENT HANDLERS (Must Keep Working)

Found in HTML:

```html
<!-- Auth -->
onclick="setMode('login')"
onclick="setMode('signup')"
onclick="doAuth()"
onclick="togglePasswordVisibility('i-pass', this)"

<!-- Navigation -->
onclick="go('home')"
onclick="go('explore')"
onclick="go('reels')"
onclick="go('dms')"
onclick="go('profile')"

<!-- FAB Menu -->
onclick="toggleFabMenu()"
onclick="hideFabButton()"
onclick="changeFabSize()"
onclick="changeFabStyle()"

<!-- AI Assistant -->
onclick="toggleNovaAI()"
onclick="novaSuggest('caption')"
onclick="novaSuggest('hashtags')"
...
onclick="sendNovaMsg()"

<!-- Themes -->
onclick="toggleThemePicker()"
onclick="setTheme('default', this)"
onclick="setTheme('cyber', this)"
...

<!-- Story Viewer (complex) -->
<!-- Multiple inline handlers -->

<!-- Chat Input -->
oninput="autoGrowNova(this)"
onkeydown="if(event.key==='Enter'&&!event.shiftKey)..."
```

**Action**: These functions MUST be exposed on `window` until all HTML is migrated to event listeners.

---

## 🚀 MIGRATION SEQUENCE

### CRITICAL RULE: Do NOT break existing behavior

### Phase Execution Order:

```
Phase 0: Inventory              ✓ THIS PHASE
Phase 1: CSS Extraction         → Extract styles, load via <link>
Phase 2: Core Setup             → Create src/core/ modules
Phase 3: Shared Components      → Reusable UI helpers
Phase 4: Auth Module            → Least risky feature
Phase 5: Home/Feed              → Central feature
Phase 6: Posts                  → Dependent on Home
Phase 7: Reels                  → Can be parallel
Phase 8: Stories                → Can be parallel
Phase 9: Chat                   → Complex realtime
Phase 10: Calls                 → HIGHEST RISK (WebRTC)
Phase 11: Notifications         → Realtime dependent
Phase 12: Profile               → Medium complexity
Phase 13: Search                → Low risk, isolated
Phase 14: Explore               → Low risk, isolated
Phase 15: Settings              → Low risk, isolated
Phase 16: Themes                → Self-contained
Phase 17: Nova AI               → Self-contained
```

---

## ⚠️ RISK ASSESSMENT

### Critical Dependencies Chain:

```
Supabase Init
    ↓
Auth Setup (ME, PROF globals)
    ↓
Realtime Subscriptions
    ├→ Chat realtime
    ├→ Notifications realtime
    ├→ Calls signaling
    └→ Feed updates
    
Navigation System
    ↓
Feature Loading (home, reels, stories, etc.)
    
Media Handling
    ├→ Cloudinary Upload
    └→ Image/Video Processing
```

### Highest Risk Areas:

1. **Calls/WebRTC** 
   - Stateful peer connections
   - Complex signaling flow
   - Realtime requirements
   - **Action**: Extract last (Phase 10)

2. **Realtime Subscriptions**
   - Chat, Notifications, Feed updates
   - Must survive navigation changes
   - **Action**: Extract after core is solid (Phase 9-11)

3. **Navigation/History**
   - Powers tab switching
   - Custom history buffer
   - Affects state persistence
   - **Action**: Extract early but carefully (Phase 2)

4. **Auth State**
   - Powers conditional rendering everywhere
   - Used by every feature
   - **Action**: Extract core auth to Phase 2, UI to Phase 4

---

## ✅ NEXT ACTION

### What's Ready for Phase 1 (CSS Extraction)?

✓ All `<style>` content (LOW RISK)
- No JavaScript dependencies
- Can be extracted to separate files
- HTML can reference via `<link rel="stylesheet">`

### What Needs Phase 2 (Core Setup)?

✓ Supabase initialization
✓ Global state (ME, PROF, db)
✓ Error handlers (already isolated)
✓ Event bus (already isolated)
✓ Offline queue system

### What Can Wait?

- Feature-specific UI
- Navigation logic (has dependencies)
- WebRTC/Calls

---

## 📝 SUMMARY TABLE

| Phase | Task | Risk | Estimated Time | Blocking? |
|-------|------|------|-----------------|-----------|
| **0** | Inventory | - | DONE | No |
| **1** | CSS Extract | LOW | 30 min | No |
| **2** | Core Setup | MEDIUM | 1 hour | YES (blocks all) |
| **3** | Components | LOW | 45 min | No (parallel) |
| **4** | Auth | HIGH | 1.5 hours | Partial (needs core) |
| **5-8** | Features | MEDIUM-HIGH | 3-5 hours each | Partial |
| **9-11** | Realtime | HIGH | 2-3 hours each | Partial |
| **10** | Calls | CRITICAL | 2-3 hours | Last |

---

## 🔍 FILES TO CREATE (Recommended Order)

```
src/
├── core/
│   ├── supabase.js          (Phase 2)
│   ├── state.js             (Phase 2)
│   ├── engine.js            (Phase 2)
│   ├── offline.js           (Phase 2)
│   ├── utils.js             (Phase 2)
│   ├── constants.js         (Phase 2)
│   ├── navigation.js        (Phase 2)
│   └── diagnostics.js       (Phase 2)
│
├── styles/
│   ├── variables.css        (Phase 1)
│   ├── base.css             (Phase 1)
│   ├── animations.css       (Phase 1)
│   ├── layout.css           (Phase 1)
│   ├── components.css       (Phase 1)
│   ├── themes.css           (Phase 1)
│   └── responsive.css       (Phase 1)
│
├── components/
│   ├── toast.js             (Phase 3)
│   ├── modal.js             (Phase 3)
│   ├── avatar.js            (Phase 3)
│   ├── loader.js            (Phase 3)
│   └── buttons.js           (Phase 3)
│
└── features/
    ├── auth/
    ├── home/
    ├── posts/
    ├── reels/
    ├── stories/
    ├── chat/
    ├── calls/
    ├── notifications/
    ├── profile/
    ├── search/
    ├── explore/
    ├── settings/
    ├── themes/
    └── ai/
```

---

## 🎯 READY FOR PHASE 1?

**YES** — CSS extraction is safe and non-blocking.

**Proceed when ready:**
1. ✅ Branch2 created
2. ✅ This inventory complete
3. → Start Phase 1: Extract CSS to separate files
4. → Update index.html to load `src/styles/*.css`
5. → Test that UI still works

---

**Prepared by**: Copilot  
**Status**: Phase 1 complete; ready for Phase 2 after runtime verification

**Next Checkpoint**: Core setup extraction verification


### Smart Feed/Mood Feed and Memories checkpoints — Branch2

At commit `782d6b2`, `src/features/smart-feed.js` extracted `showSmartFeed`, `setMoodFeed`, and `loadMoodFeed`; static validation passed and the live preview exposed all three globals. At commit `aa53d2b`, `src/features/memories.js` extracted `showMemories` while AI Journal remained inline. The cache-busted preview exposed `showMemories`, the Smart Feed globals, and the protected `showAIJournal`, `showAIJournalEntry`, `saveJournalEntry`, `generateAIJournal`, `renderDMs`, `openChat`, `renderReels`, `createPeerConnection`, `openSV`, and `spawnLikeParticles` functions. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`; all changes are on `Branch2`.


### AI Journal and AI Video Editor checkpoints — Branch2

At commit `094c67b`, `src/features/ai-journal.js` extracted `showAIJournal`, `showAIJournalEntry`, `saveJournalEntry`, and `generateAIJournal`; the live preview confirmed those globals, while `showAIVideoEditor` and all protected fragile globals remained callable. At commit `f83b9da`, `src/features/ai-video-editor.js` extracted `showAIVideoEditor`; the live preview confirmed it alongside the prior extracted globals, while `showAvatarCreator`, `showSecurityCenter`, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained callable. Both checkpoints passed syntax, script-order, boundary, and whitespace validation on `Branch2`; remote `main` remains unchanged.


### Avatar Creator checkpoint — Branch2

At commit `6a8e502`, `src/features/avatar-creator.js` extracted `showAvatarCreator` while Security Center, Creator Wallet, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview loaded the login shell and confirmed the extracted Avatar Creator chain plus all protected globals as functions. Static syntax, script-order, boundary, and whitespace checks passed; remote `main` remains unchanged.


### Security Center checkpoint — Branch2

At commit `cbf5f33`, `src/features/security-center.js` extracted `showSecurityCenter`, `setup2FA`, `toggleBiometric`, and `logoutDevice`; the exact next section, Creator Wallet, remained inline. A stale validation assertion for a nonexistent `showUniversalSearch` name was corrected after inspecting the actual section, whose later preserved function is `showNovaUniverseHub`; the corrected static checks passed. The live preview confirmed the extracted Security Center chain and preserved Creator Wallet, Nova Universe Hub, DMs, Reels, Calls, Stories, and `spawnLikeParticles` globals. Remote `main` remains unchanged.


### Creator Wallet checkpoint — Branch2

At commit `f4dead4`, `src/features/creator-wallet.js` extracted `showCreatorWallet`; Universal AI Search and Nova Universe Hub remained inline. The cache-busted preview confirmed the Creator Wallet chain and preserved `showNovaUniverseHub`, `translatePost`, DMs, Reels, Calls, Stories, and `spawnLikeParticles` globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Universal AI Search checkpoint — Branch2

At commit `28f9448`, `src/features/universal-search.js` extracted the actual `universalAISearch` function; there is no `showUniversalSearch` declaration in this codebase. Nova Universe Hub and Voice Assistant remained inline. The cache-busted preview confirmed `universalAISearch`, the previously extracted globals, `showNovaUniverseHub`, `startVoiceAssistant`, DMs, Reels, Calls, Stories, and `spawnLikeParticles` as functions. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Nova Universe Hub checkpoint — Branch2

At commit `8a4d995`, `src/features/nova-universe.js` extracted `showNovaUniverseHub`; Voice Assistant, Scheduled Posts, Live Streaming UI, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted chain and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Voice Assistant checkpoint — Branch2

At commit `590c194`, `src/features/voice-assistant.js` extracted the Voice Assistant and voice-to-voice conversation helpers: `startVoiceAssistant`, `startVoiceConversation`, `startVoiceConvListening`, `processVoiceConversationMsg`, `speakText`, `speakTextAsync`, and `stopVoiceConversation`. AI Auto-Moderation, Scheduled Posts, Live Streaming UI, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed all extracted and protected globals; static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Scheduled Posts checkpoint — Branch2

At commit `82adf91`, `src/features/scheduled-posts.js` extracted the shared `scheduledPosts` state plus `showScheduledPosts` and `deleteScheduledPost`; Live Streaming UI and AI Auto-Moderation remained inline. The cache-busted preview confirmed the extracted Scheduled Posts globals and preserved `moderateContent`, `showLiveStreamUI`, `endLiveStream`, DMs, Reels, Calls, Stories, and `spawnLikeParticles`. Static syntax, script-order, state-boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Live Streaming checkpoint — Branch2

At commit `79c95c5`, `src/features/live-stream.js` extracted `showLiveStreamUI`, `startLiveStream`, and `endLiveStream`; AI Auto-Moderation and Scheduled Posts were already separately guarded. The cache-busted preview confirmed the extracted Live Streaming globals and preserved `moderateContent`, Scheduled Posts, Voice Assistant, Universal Search, DMs, Reels, Calls, Stories, and `spawnLikeParticles`. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### AI Auto-Moderation checkpoint — Branch2

At commit `8d0011d`, `src/features/ai-moderation.js` extracted `moderateContent`, `initUltraFeatures`, and their original pre-inline comment and initialization patch timing. Reels Interactive Poll and the functional Mood Feed remained inline. The cache-busted preview confirmed the extracted moderation/initialization globals and preserved `showReelPoll`, `saveReelPoll`, `applyMoodToFeed`, DMs, Reels, Calls, Stories, and `spawnLikeParticles`. Static syntax, script-order, timing, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Reels Interactive Poll checkpoint — Branch2

At commit `3ac7146`, `src/features/reel-poll.js` extracted only `showReelPoll` and `saveReelPoll`. The protected `renderReels` renderer and swipe system, DMs, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted poll globals and all protected globals. Static syntax, script-order, protected-boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Channels checkpoint — Branch2

At commit `3212c86`, `src/features/channels.js` extracted the localStorage-backed Channels feature: `showChannels`, `createChannel`, `saveChannel`, `openChannel`, `broadcastToChannel`, and `subscribeChannel`. Communities, Voice Rooms, Calendar, Notes, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Channels globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Communities checkpoint — Branch2

At commit `b7c8e4e`, `src/features/communities.js` extracted community navigation and handlers: `showCommunities`, `createCommunity`, `saveCommunity`, `openCommunity`, `showVoiceRoomsForCommunity`, `showCommunityEvents`, `showCommunityMembers`, and `joinCommunity`. Voice Rooms, Calendar, Notes, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Communities globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Voice Rooms checkpoint — Branch2

At commit `572ba27`, `src/features/voice-rooms.js` extracted `showVoiceRooms`, `createVoiceRoom`, and `joinVoiceRoom`; Functional Calendar and Notes remained inline. The cache-busted preview confirmed the extracted Voice Rooms globals and preserved Calendar, Notes, DMs, Reels, Calls, Stories, and `spawnLikeParticles`. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Calendar checkpoint — Branch2

At commit `8be2f56`, `src/features/calendar.js` extracted the Calendar display function `showCalendar`. The existing inline `addCalendarEvent` helper remained in place because it follows the Notes section marker in the source, and `showNotes`/`saveNote` also remained inline. The cache-busted preview confirmed Calendar, Voice Rooms, Communities, Channels, Notes, DMs, Reels, Calls, Stories, and `spawnLikeParticles` globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Notes checkpoint — Branch2

At commit `ee128d9`, `src/features/notes.js` extracted the localStorage-backed `myNotes` state and `showNotes`, `createNote`, and `saveNote`. Marketplace and the inline `addCalendarEvent` helper remained in place. The cache-busted preview confirmed Notes, Calendar, Voice Rooms, Communities, Marketplace, DMs, Reels, Calls, Stories, and `spawnLikeParticles` globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Marketplace checkpoint — Branch2

At commit `af92a84`, `src/features/marketplace.js` extracted `showMarketplace`, `listProduct`, and `buyProduct`; Learning, News Feed, Games, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Marketplace globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Learning checkpoint — Branch2

At commit `1c68bfb`, `src/features/learning.js` extracted `showLearning` and `startCourse`; News Feed, Games, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Learning globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Functional News checkpoint — Branch2

At commit `9e8d345`, `src/features/news.js` extracted the standalone `showNews` feature; the later `showNewsFeed` implementation, Games, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Functional News globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Functional Games checkpoint — Branch2

At commit `93d5a2d`, `src/features/games.js` extracted `showGames`, `startGame`, and the Tic-Tac-Toe helpers `showTicTacToe`, `tttMove`, `checkTTTWin`, and `tttReset`. The Nova Universe update code, News Feed, DMs, Reels, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the extracted Games globals and all preserved globals. Static syntax, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Reels UI Enhancement checkpoint — Branch2

At commit `11b9ec9`, `src/features/reels-enhancement.js` extracted the self-contained `enhanceReelsUI` style injection and preserved its immediate initializer. The protected `renderReels` renderer and swipe system, Smart Feed ranking, DMs, Calls, Stories, and `spawnLikeParticles` remained inline. The cache-busted preview confirmed the enhancement global and all protected globals. Static syntax, initializer-timing, script-order, boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Smart Feed ranking checkpoint — Branch2

At commit `2ab5f96`, `src/features/smart-ranking.js` extracted `calculatePostRank`, `loadRankedFeed`, `updateMyInterests`, and the existing disabled feed-patch block. It loads after the inline application script and immediately before the final `nova-init.js` and `like-effects.js` wrappers, preserving their required last-two order. The cache-busted preview confirmed ranking, wrapper, and all protected globals. Static syntax, post-inline timing, script-order, protected-boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### AI context checkpoint — Branch2

At commit `8f1fbb4`, `src/features/ai-context.js` extracted the shared `novaAIContext` state and `detectUserMood` before the inline application script. The Enhanced Nova AI, local-response, login-interest, and caption patches remained inline, as did Calls/WebRTC, DMs, Reels, Stories, navigation, and the final wrappers. The cache-busted preview confirmed the AI context, patch, wrapper, and protected globals. Static syntax, pre-inline timing, script-order, protected-boundary, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### News Feed checkpoint — Branch2

At commit `d128aae`, `src/features/news-feed.js` extracted the distinct async `showNewsFeed` implementation, while the previously extracted `showNews` remained in `news.js`. The protected calling-system boundary begins immediately afterward and remains inline, including WebRTC and all fragile DMs, Reels, Stories, and navigation code. The cache-busted preview confirmed `showNewsFeed`, prior News/Games globals, the final wrappers, Enhanced AI patches, and all protected globals. Static syntax, script-order, exact-boundary, protected-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Call UI wrappers checkpoint — Branch2

At commit `9fdf630`, `src/features/call-feature.js` extracted only `showCallFeature` and `startNovaCall`, the lightweight modal/navigation wrappers. `initCallingSystem`, `createPeerConnection`, signaling, media setup, and the rest of the WebRTC implementation remain inline and protected. The cache-busted preview confirmed both extracted wrappers, `showNewsFeed`, the Enhanced AI patches, final wrappers, and all protected fragile globals. Static syntax, script-order, exact-boundary, protected-marker, inline-handler, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### External profile view checkpoint — Branch2

At commit `975e210`, `src/features/profile-view.js` extracted the other-user profile rendering and interaction stack: `showUserProfile`, `showProfilePreview`, `openFullProfile`, `showConnectOptions`, `userProfileTab`, `showUserProfileOptions`, and `shareUserProfile`. The bidirectional block query, messaging-block check, block/unblock mutations, blocked-list rendering, and their `.throwOnError()` safeguards remained inline so the critical block system can be validated independently. The cache-busted preview confirmed the extracted profile globals, preserved block helpers, adjacent feature globals, Enhanced AI patches, final wrappers, and all fragile globals. Static syntax, module-order, exact-boundary, block-helper, rate-limit, protected-marker, inline-handler, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Deep-link handlers checkpoint — Branch2

At commit `eca81a6`, `src/features/deep-links.js` extracted `resolveAndOpenProfile` and `processDeepLinks`. The URL parsing, `_pendingDeepLinks` queue initialization, immediate authenticated processing, and delayed post-login callback remain inline so the original sequencing is preserved. Stories, DMs, Reels, WebRTC Calls, and the block system remain protected and inline. Static syntax, deep-link-aware integration, queue-timing, script-order, exact-boundary, protected-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged. The live preview host returned a retryable `SESSION_CONNECT_FAILED` 502 at both the cache-busted and base URLs during this checkpoint, so browser global probing is pending host recovery rather than being claimed as completed.


### Story text helpers checkpoint — Branch2

At commit `bb0eb6b`, `src/features/story-text-helpers.js` extracted only the independent Story Creator helpers `addStoryTextMode`, `prevStoryMedia`, `addStoryText`, `changeStoryTextColor`, and `changeStoryTextSize`. `submitStory`, all Story editor state declarations, `openSV`, `renderSV`, `svTimer`, and the viewer navigation/swipe/timer system remained inline. The cache-busted preview loaded successfully and confirmed the extracted helpers, preserved Story functions, deep-link handlers, adjacent feature globals, and protected DMs, Reels, Calls, and like-effect globals. Static syntax, deep-link-aware integration, exact boundary, protected Stories-state, fragile-marker, script-order, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Notes Bar checkpoint — Branch2

At commit `c4ac667`, `src/features/notes-bar.js` extracted the unchanged Notes Bar helper trio `_fetchNotesBarData`, `_renderNotesBarHtml`, and `loadNotesBar`. The DMs renderer continues to fetch notes data in parallel with conversations, while `_refreshDmsInPlace`, `_silentBackgroundRefresh`, `renderDMs`, and `openChat` remain inline so the non-destructive refresh and scroll-preservation fixes are untouched. The cache-busted preview confirmed the extracted Notes Bar and Notes globals, all protected DMs/Reels/Calls/Stories globals, and prior deep-link/profile/news globals. Static syntax, integration, parallel-split, protected-boundary, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Reels like-helper checkpoint — Branch2

At commit `27965a9`, `src/features/reel-like-helper.js` extracted only the top-level `dblLikeReel` global used by inline double-tap handlers. The nested `dblLikeReel` copy inside `renderReels` remains inline, along with `renderReels`, `_applyReelsVideoWindowing`, `switchReelsView`, the persistent container, `_savedReelIndex`, dynamic reel percentage logic, settle timing, and touch swipe handlers. The cache-busted preview confirmed the extracted helper, preserved nested/renderer/toggle globals, Reels state, and all protected DMs, Stories, Calls, deep-link, profile, News Feed, and like-effect globals. Static syntax, nested-copy, persistent-container, saved-index, swipe/timing, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Chat input helpers checkpoint — Branch2

At commit `4a75de8`, `src/features/chat-input-helpers.js` extracted only `toggleSendBtn` and `autoGrow`, the isolated textarea UI helpers used by the inline chat markup. `renderDMs`, `openChat`, `sendMsg`, chat realtime subscriptions, typing state, message-list scroll behavior, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed the extracted helpers, protected DMs functions, prior Notes/Reels/deep-link/profile globals, and all fragile Stories/Calls globals. Static syntax, inline-handler, DMs/realtime/scroll-protection, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### DM draft helpers checkpoint — Branch2

At commit `28b93b5`, `src/features/dm-drafts.js` extracted only the localStorage-backed `saveDmDraft` and `clearDmDraft` helpers. `sendMsg`, `renderDMs`, `openChat`, realtime subscriptions, block checks, typing state, message-list scrolling, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed the extracted draft helpers, protected DMs functions, prior chat-input/Notes/Reels/Stories/Calls/deep-link/profile globals, and all fragile markers. Static syntax, inline-call-site, DMs/realtime/scroll-protection, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Chat actions checkpoint — Branch2

At commit `9e89474`, `src/features/chat-actions.js` extracted only the `showChatActions` modal/menu helper used by the inline chat header. `clearChat`, `sendMsg`, `renderDMs`, `openChat`, realtime subscriptions, typing state, message loading, block enforcement, message-list scrolling, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed the extracted menu helper, protected DMs functions, prior chat-input/draft/Notes/Reels/Stories/Calls/deep-link/profile globals, and all fragile markers. Static syntax, inline-caller, DMs/realtime/scroll-protection, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Copy invite link checkpoint — Branch2

At commit `766a307`, `src/features/copy-invite-link.js` extracted only the `copyInviteLink` clipboard/toast helper used by Group Info markup. `showGroupInfo`, attachment and location helpers, `clearChat`, `sendMsg`, `renderDMs`, `openChat`, realtime subscriptions, typing state, message loading, block enforcement, message-list scrolling, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed the extracted clipboard helper, preserved Group Info/attachment/location functions, protected DMs functions, prior chat helpers, and all fragile markers. Static syntax, inline-caller, Group Info/DM protection, realtime/scroll, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Message clipboard helpers checkpoint — Branch2

At commit `4d3743c`, `src/features/message-clipboard-helpers.js` extracted only `copyMsg` and `copyMsgFromEnc`, the clipboard paths used by the message menu. `loadMsgs`, `deleteMsgForMe`, `unsendMsg`, `pinMsg`, `pinMsgFromEnc`, `reactMsg`, `sendMsg`, `renderDMs`, `openChat`, realtime subscriptions, typing state, message loading/pagination, block enforcement, message-list scrolling, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed both clipboard helpers, all preserved message actions, protected DMs functions, prior chat helpers, and all fragile markers. Static syntax, inline-caller, DB-action/DM protection, realtime/scroll, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### Favorite message checkpoint — Branch2

At commit `080e45f`, `src/features/favorite-message.js` extracted only the UI-only `favoriteMessage` stub. `deleteMsgForMe`, `unsendMsg`, `pinMsg`, `pinMsgFromEnc`, `reactMsg`, `loadMsgs`, `sendMsg`, `renderDMs`, `openChat`, realtime subscriptions, typing state, message loading/pagination, block enforcement, message-list scrolling, background refresh, and scroll restoration remain inline and unchanged. The cache-busted preview confirmed the extracted favorite helper, preserved clipboard/message actions, protected DMs functions, and all fragile markers. Static syntax, inline-caller, DB/DM/realtime/scroll protection, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.


### DMs core risk-map checkpoint — Branch2

`DM_CORE_RISK_MAP.md` records the remaining high-risk DMs dependency graph and preservation invariants. It explicitly keeps `renderDMs`, `openChat`, `loadMsgs`, `_loadOlderMessages`, `_refreshDmsInPlace`, `_silentBackgroundRefresh`, typing subscriptions/timers, message sending, block enforcement, realtime handling, and scroll restoration inline. The map documents the required extraction order and prohibits mixing these systems with Stories, Reels, or WebRTC work. Live preview startup and protected-global probes passed at the `44a7eb4` analysis baseline; no high-risk application code was moved in this checkpoint.


### DMs verification-readiness checkpoint — Branch2

`DM_VERIFICATION_READINESS.md` defines the non-invasive authenticated smoke sequence required before moving `loadMsgs`, `renderDMs`, `openChat`, or their realtime/typing/scroll dependencies. The sandbox has no authenticated Supabase session even though the My Browser connector is enabled, so no mock user, synthetic session, database seed, or application-code fixture was added. The gate remains: perform read-only authenticated DMs navigation and subscription/scroll observations on the current `Branch2` checkpoint before any high-risk extraction.


### Play-next-audio checkpoint — Branch2

At commit `a9a619a`, `src/features/play-next-audio.js` extracted only the independent `playNextAudio` helper used by inline audio `onended` handlers. `replyMsg`, `cancelReply`, `loadMsgs`, `renderDMs`, `openChat`, realtime subscriptions, typing state, message loading/pagination, block enforcement, message-list scrolling, background refresh, scroll restoration, Stories, Reels, and WebRTC Calls remain inline and unchanged. The cache-busted preview confirmed the extracted audio helper, preserved reply and DMs functions, prior helpers, and all fragile markers. Static syntax, inline-caller, reply/DM/realtime/scroll protection, script-order, fragile-marker, and whitespace checks passed on `Branch2`; remote `main` remains unchanged.

### Settings Support checkpoint — Branch2

At commit `9ecb602`, the isolated `showSettingsSupport` settings-page renderer moved to `src/features/settings-support.js`. The helper remains a classic script global for inline navigation and event-handler compatibility; its referenced actions (`toggleNovaAI`, `showHelpCenter`, `showReportProblem`, and `showAbout`) remain string-based UI callbacks and were not moved. The extraction did not touch settings notifications, push subscription logic, admin functions, DMs, Stories, Reels, Calls, or navigation state.

Static validation passed for JavaScript syntax, integration, script ordering, whitespace, inline-caller preservation, protected-function markers, and deep-link safeguards. The cache-busted preview loaded successfully, and the browser probe confirmed `showSettingsSupport`, `playNextAudio`, reply helpers, the DMs core, Reels, Stories, Calls, and like-effect globals remained callable. Remote `main` remained unchanged.

### Settings Appearance checkpoint — Branch2

At commit `20609dc`, the isolated `showSettingsAppearance` settings-page renderer moved to `src/features/settings-appearance.js`. It remains a classic script global for the existing inline settings navigation, while its existing theme and profile-customizer callbacks remain untouched. No notification/push, admin, DM, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded both settings modules and the browser probe confirmed the new renderer, the previous support renderer, and all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Settings Account checkpoint — Branch2

At commit `5231773`, the isolated `showSettingsAccount` settings-page renderer moved to `src/features/settings-account.js`. It remains a classic script global for existing inline settings navigation, while its account actions (`showEditProfile`, `showPasswordReset`, `showVerificationApply`, `showAccountInfo`, `downloadMyData`, and `showDeleteAccount`) remain in their existing locations. No privacy, notification/push, admin, DM, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded all three extracted settings modules, and the browser probe confirmed the account renderer plus all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Settings Privacy checkpoint — Branch2

At commit `6a56634`, the isolated `showSettingsPrivacy` settings-page renderer moved to `src/features/settings-privacy.js`. It remains a classic script global for existing inline settings navigation and continues to read the existing `PROF` and `ME` state. Its privacy callbacks (`toggleGhostMode`, `toggleReadReceipts`, `showPrivateAccount`, `showBlockedList`, `showCloseFriendsManager`, and `showDisappearingOptions`) remain in their existing locations. No notification/push, admin, DM, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded all four extracted settings modules, and the browser probe confirmed the privacy renderer plus all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Settings Features checkpoint — Branch2

At commit `c0c72a2`, the isolated `showSettingsFeatures` settings-page renderer moved to `src/features/settings-features.js`. It remains a classic script global for existing inline settings navigation, while the existing feature callbacks and the `ME.id` reference remain unchanged. No notification/push, admin, DM, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded all five extracted settings modules, and the browser probe confirmed the features renderer plus all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Toggle Ghost Mode checkpoint — Branch2

At commit `c2b079e`, the isolated `toggleGhostMode` privacy mutation helper moved to `src/features/toggle-ghost-mode.js`. Its behavior remains unchanged: it derives the next mode from `PROF.ghost_mode`, updates the current profile through Supabase using `ME.id`, updates the in-memory profile and status element, and displays the existing toast. No settings-page, notification/push, admin, DM, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the extracted helper and all five settings modules, and the browser probe confirmed the ghost-mode helper plus all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Show Edit checkpoint — Branch2

At commit `9052084`, the self-contained `showEdit` settings modal renderer moved to `src/features/show-edit.js`. Its profile header, six settings cards, admin conditional card, logout button, and existing `PROF`/`ME` state references remain behaviorally unchanged; all callback functions remain at their existing locations. No notification/push, admin logic, DM, Story, Reel, Call, or navigation state code was moved.

The extraction initially hit the repository whitespace gate because template-literal indentation-only lines carried trailing spaces. A targeted cleaner removed only trailing whitespace, after which syntax, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards passed. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed `showEdit`, ghost mode, settings renderers, and all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Change Audio Speed checkpoint — Branch2

At commit `63bf2e7`, the isolated `changeAudioSpeed` helper moved to `src/features/change-audio-speed.js`. Its behavior remains unchanged: it finds the preceding audio element, cycles playback rate through 1x, 1.5x, and 2x, updates the button label, and displays the existing speed toast. Both static inline callers remain in `index.html`; no DMs, Stories, Reels, Calls, navigation, or message-rendering code was moved.

Static checks passed for JavaScript syntax, both inline callers, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the new helper and all prior extracted modules; the browser probe confirmed the audio helper, settings/ghost-mode/show-edit globals, and all protected DMs, Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Show New DM checkpoint — Branch2

At commit `4121ca6`, the isolated `showNewDM` modal renderer moved to `src/features/show-new-dm.js`. It continues to create the New Message modal and invoke the existing inline `searchDM` handler; `searchDM`, `startDM`, `renderDMs`, `openChat`, message loading, realtime subscriptions, block enforcement, and scroll restoration remain inline by design. No group-chat creation, admin, Story, Reel, Call, or navigation state code was moved.

Static checks passed for JavaScript syntax, static New DM callers, DM-core protection, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed `showNewDM`, inline search/start handlers, the protected DMs core, and all protected Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Show Group Chat checkpoint — Branch2

At commit `60d4484`, the isolated `showGC` group-chat modal renderer moved to `src/features/show-gc.js`. It continues to initialize the group-selection state and render the group-name, member-search, results, and create controls while invoking existing inline `searchGC` and `createGC` handlers. `searchGC`, `togGC`, `createGC`, `openChat`, group membership mutations, DMs realtime, message loading, block enforcement, and scroll restoration remain inline. No Story, Reel, Call, admin, or navigation state code was moved.

Static checks passed for JavaScript syntax, the static group-chat caller, group/DM-core protection, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the group-chat renderer, inline mutation handlers, protected DMs/chat core, and all protected Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Show Add Members checkpoint — Branch2

At commit `72422d2`, the isolated `showAddMembers` modal renderer moved to `src/features/show-add-members.js`. It continues to render the member-search field and result container while invoking the existing inline `searchAddMembers` handler; member search, `addMemberToGroup`, conversation membership mutations, DMs realtime, message loading, block enforcement, and scroll restoration remain inline. No Story, Reel, Call, admin, or navigation state code was moved.

Static checks passed for JavaScript syntax, group/DM-core protection, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the Add Members renderer, inline mutation handlers, protected DMs/chat core, and all protected Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Search DM checkpoint — Branch2

At commit `9653cac`, the isolated `searchDM` DM-creation search helper moved to `src/features/search-dm.js`. It continues to query profiles, render selectable results, and invoke the existing inline `startDM` callback. `startDM`, `renderDMs`, `openChat`, message loading, realtime subscriptions, block enforcement, and scroll restoration remain inline by design. No group creation, Story, Reel, Call, admin, or navigation state code was moved.

Static checks passed for JavaScript syntax, the DM-creation caller chain, DM-core protection, integration, script order, whitespace, inline-caller preservation, protected fragile markers, and deep-link safeguards. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the search helper, inline conversation creation, protected DMs/chat core, and all protected Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Toggle Group Chat recovery checkpoint — Branch2

The Phase 79 code commit `d3c20a7` (`togGC` extracted to `src/features/tog-gc.js`) was initially created locally but its first push failed because the GitHub credential had expired. The failure was an authentication issue, not an extraction or `togGC` code issue. GitHub device reauthorization completed successfully, and the existing local commit was pushed only to `Branch2`.

After the push, the cache-busted preview loaded `tog-gc.js` and all prior modules at `readyState: complete`. The browser probe confirmed `togGC`, group/DM helper globals, settings/audio helpers, and protected DMs, Reels, Stories, Calls, reply, and like-effect functions. Remote `main` remained at its prior hash and was not touched.

### Start DM checkpoint — Branch2

At commit `5afc128`, the isolated `startDM` conversation-creation helper moved to `src/features/start-dm.js`. Its existing behavior is preserved: close the modal, find or create a one-to-one conversation, insert both conversation members, and hand off to the existing `openChat` function. `renderDMs`, `openChat`, message loading, realtime subscriptions, block enforcement, and scroll restoration remain inline by design. No group mutation, Story, Reel, Call, admin, or navigation state code was moved.

The initial combined validation command produced false failures because it expected the moved `startDM` declaration and its caller to remain in `index.html`, while both correctly moved into the module/caller chain. The corrected checks passed for syntax, extracted caller chain, remaining DMs core protection, integration, script order, whitespace, fragile markers, and deep-link safeguards. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed `startDM`, protected DMs/chat core, and all protected Reels, Stories, Calls, reply, audio, and like-effect globals. Remote `main` remained unchanged.

### Settings Notifications checkpoint — Branch2

At commit `4183c4c`, the UI-focused `showSettingsNotifications` renderer moved to `src/features/settings-notifications.js`. It continues to load notification preferences, render device push status and in-app notification rows, and invoke the existing inline callbacks. `enablePushFromSettings`, `resetPushFromSettings`, `toggleNotifSetting`, push subscription registration/reset logic, DMs/chat core, and all fragile systems remain inline.

Static checks passed for JavaScript syntax, callback preservation, integration, script order, whitespace, deep-link safeguards, and protected DMs, Reels, Stories, Calls, reply, audio, and like-effect markers. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the notification renderer, inline push/toggle handlers, and protected globals at `readyState: complete` with no runtime error reported. Remote `main` remained unchanged.

### Switch Admin Tab checkpoint — Branch2

At commit `e356617`, the isolated `switchAdminTab` admin-panel UI wrapper moved to `src/features/switch-admin-tab.js`. It continues to update active/inactive tab styles and hand off to the existing inline `loadAdminTab` loader. `showAdminPanel`, `renderAdminPanelUI`, `loadAdminTab`, all admin data/action handlers, protected reply and voice-recording helpers, DMs/chat core, and all fragile Reels, Stories, and Calls systems remain inline.

Static checks passed for JavaScript syntax, admin caller preservation, inline admin-loader protection, script order, whitespace, deep-link safeguards, and protected fragile markers. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed `switchAdminTab`, inline admin loaders, protected DMs/chat, reply/voice helpers, and all protected Reels, Stories, Calls, audio, and like-effect globals at `readyState: complete` with no runtime error reported. Remote `main` remained unchanged.

### Render Admin Panel UI checkpoint — Branch2

At commit `8d45b8b`, the UI-only `renderAdminPanelUI` function moved to `src/features/render-admin-panel-ui.js`. It continues to derive role badges, build role-based admin tabs, render the panel shell, and invoke the existing `switchAdminTab`/`loadAdminTab` callbacks. `showAdminPanel`, `loadAdminTab`, all admin data/action handlers, audit/notification mutations, protected reply and voice-recording helpers, DMs/chat core, and all fragile Reels, Stories, and Calls systems remain inline.

The extraction initially hit the repository whitespace gate on indentation-only template-literal lines. A targeted cleaner removed only trailing whitespace, after which syntax, admin caller preservation, inline loader/action protection, script order, whitespace, deep-link safeguards, and fragile markers passed. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the renderer, inline admin loaders/actions, protected DMs/chat, reply/voice helpers, and all protected Reels, Stories, Calls, audio, and like-effect globals at `readyState: complete` with no runtime error reported. Remote `main` remained unchanged.

### Search Admin Users checkpoint — Branch2

At commit `81867d8`, the lower-risk admin-scoped `searchAdminUsers` helper moved to `src/features/search-admin-users.js`. It preserves the 300 ms debounce, profile query/filter, admin-user list rendering, escaping, role/status badges, and existing `showAdminUserDetail` callback. `showAdminUserDetail`, `showAdminPanel`, `loadAdminTab`, admin data/action mutations, protected reply and voice-recording helpers, DMs/chat core, and all fragile Reels, Stories, and Calls systems remain inline.

Static checks passed for JavaScript syntax, admin caller/detail preservation, inline admin protection, script order, whitespace, deep-link safeguards, and protected fragile markers. The cache-busted preview loaded the new module and all prior extracted modules; the browser probe confirmed the search helper, inline admin detail/actions, protected DMs/chat, and all protected settings, reply, voice, Reels, Stories, Calls, audio, and like-effect globals at `readyState: complete` with no runtime error reported. Remote `main` remained unchanged.

### Post-Phase 84 residual-risk audit — Branch2

At the current Branch2 checkpoint, all lower-risk non-fragile helpers identified in the remaining settings, DM-creation, group UI, notification, and small admin UI clusters have been extracted and smoke-tested. The remaining inline inventory is intentionally risk-controlled.

The protected set remains inline: `renderDMs`, `openChat`, `loadMsgs`, `_loadOlderMessages`, `_refreshDmsInPlace`, `_silentBackgroundRefresh`, `replyMsg`, `cancelReply`, `toggleRecording`, `renderReels`, `submitStory`, `openSV`, and `createPeerConnection`. These functions carry DMs realtime/pagination/typing/block/scroll state, reply composer state, microphone/upload/message delivery, Reels windowing, Stories timers/editor state, or WebRTC state. Admin verification, loaders, data mutations, push subscription handlers, user-detail actions, and admin tab data functions also remain inline.

The final static audit passed across every JavaScript file under `src/`, the deep-link-aware HTML validator, protected marker checks, script ordering, whitespace, and Branch2/main remote-hash verification. Branch2 is clean and synchronized; remote `main` remains unchanged. Further extraction of protected code requires the authenticated chat-level verification sequence in `DM_VERIFICATION_READINESS.md` before proceeding.

### Current authenticated verification gate smoke — Branch2

The current Branch2 preview was reopened at the residual-audit checkpoint. The unauthenticated login shell rendered successfully, and a read-only browser probe reached `readyState: complete`, confirming the extracted settings/admin/DM-creation/group helpers and all protected DMs, message-sending, reply, voice, Reels, Stories, and Calls globals. Subscription state was undefined because no authenticated session was available. No mutation function was invoked and no database or subscription state was changed. The authenticated sequence in `DM_VERIFICATION_READINESS.md` remains the required gate before any protected extraction.

### My Browser availability and current preview probe — Branch2

The current session configuration contains an enabled `My Browser` connector, but the active page remains the unauthenticated sandbox preview. A read-only probe on the current preview reached `readyState: complete`, confirmed the extracted settings/admin/DM-creation/group helpers and protected DMs/message/reply/voice/Reels/Stories/Calls globals, and found the login shell present. No authentication, mutation, message send, database write, or subscription action was invoked. The authenticated DMs verification gate remains open and no protected code was moved.

### Autonomous continuation checkpoint — Branch2

The current autonomous pass revalidated Branch2 and the preview. The remaining inline inventory contains only protected DMs/reply/voice/Stories/Reels/Calls paths and DB-backed admin/push flows. A read-only browser probe reached `readyState: complete`, showed the unauthenticated login shell, and confirmed extracted helper globals plus protected DMs/message/reply/voice/Reels/Stories/Calls globals. No authentication or mutation was available or invoked; the protected extraction gate remains enforced.

### Autonomous final probe checkpoint — Branch2

The autonomous pass rechecked the remaining inline inventory and the readiness gate. Only protected DMs/reply/voice/Stories/Reels/Calls paths and DB-backed admin/push flows remain. The current preview reached `readyState: complete` with the login shell visible; a read-only probe confirmed extracted helpers and protected globals. No authentication or mutation was invoked, so the protected extraction gate remains enforced.


### Authenticated DMs verification and typing cleanup checkpoint — Branch2

At commit `6ed903c`, authenticated read-only verification completed Steps 1–7 from `DM_VERIFICATION_READINESS.md` on the current Branch2 preview: Home shell, DMs list plus Notes Bar, one-to-one first render, back/reopen, history-preserving upward scroll, non-destructive DMs refresh, existing group render, Group Info open/close, and group back navigation. Step 8 account switching was intentionally skipped because the user did not independently request a second-account sign-in. The probe found an active joined `typingSub` after chat exit, so no protected DMs renderer was moved. A minimal cleanup was added to both existing chat-exit paths to remove the typing channel and clear `window.typingSub`; `renderDMs`, `openChat`, `loadMsgs`, `_loadOlderMessages`, `_refreshDmsInPlace`, `_silentBackgroundRefresh`, and message-rendering/realtime code remained inline. Static checks passed, the authenticated post-push regression confirmed `typingSub: null` and no remaining typing channel after back navigation, and remote `main` remained `ef418007c9b9a797488b4825be5f0c807da22369`.

### Reply preview helpers checkpoint — Branch2

At commit `e79c830`, the cohesive UI-only pair `replyMsg` and `cancelReply` moved to `src/features/reply-helpers.js` and was linked before the inline application script. The module preserves the reply-preview HTML, media labels, focus behavior, scroll-button offset adjustment, reply state, and reset behavior exactly; both functions remain classic-script globals for inline handlers. The authenticated `suspense` chat smoke test confirmed both globals, rendered and cancelled a synthetic local reply preview without database mutation, restored `window.replyToId`/`window.replyToText`, and returned through the real chat back path with DMs and typing cleanup intact. Static JavaScript, inline-script, deep-link, boundary, script-order, whitespace, and protected-marker checks passed. `renderDMs`, `openChat`, `loadMsgs`, `_loadOlderMessages`, `renderReels`, `submitStory`, `openSV`, and `createPeerConnection` remain inline; remote `main` remains unchanged.


### Full authenticated regression pass — Branch2

At the `40dea5f` checkpoint, the authorized authenticated account completed a controlled regression pass across Home, DMs, one-to-one chat, an existing group chat, Group Info, Explore, Profile, Reels, Calls UI, the comment composer, and navigation cleanup. Reversible like/unlike, follow/unfollow, marked message send/app unsend, Reels swipe forward/back, reply preview render/cancel, DMs history/back/refresh, and typing-subscription cleanup all passed. The comment composer was opened and verified without submission because the app has no reversible delete-comment handler; Calls UI was opened without starting WebRTC; no Story viewer target was exposed in the current Home DOM, so no Story mutation was invoked. Final static checks passed and remote `main` remained unchanged.

### Message Info helper checkpoint — Branch2

At commit `7e07cbf`, the read-only `showMsgInfo` helper moved to `src/features/message-info.js` and was loaded after `reply-helpers.js` before the inline application script. It preserves the sent/delivered/read-status queries and Message Info modal rendering, and remains available as a classic-script global for the existing inline message-menu handler. JavaScript syntax, inline-script syntax, deep-link validation, protected markers, script ordering, exact boundary checks, and whitespace checks passed. Authenticated smoke testing on an existing `suspense` message rendered Sent, Delivered, and Not read yet details; modal and chat back navigation restored DMs with `chatSubscription: null` and `typingSub: null`. Remote `main` remains unchanged.


### Stale DMs preview after unsend — Branch2

At commit `c30138d`, authenticated regression exposed a denormalized preview defect: an unsent message row was correctly marked `deleted=true` and cleared, but `conversations.last_message` retained the deleted text, so DMs refresh continued showing it. The existing protected DMs renderer and in-place refresh were not replaced. Instead, `unsendMsg` now captures `conversation_id`, clears the message, finds the newest non-deleted prior message, and updates `conversations.last_message` and `last_message_at`. Preview cleanup is best-effort and cannot undo message deletion.

The live reversible regression passed: a marked message was sent, confirmed in the conversation preview, unsent through the app flow, and the DMs preview returned to the prior active message `Hi`; the deleted probe text was absent from both the conversation database field and rendered DMs item. Post-push verification at `c30138d` passed. Remote `main` remains unchanged.


### Message sticker favorite-toggle extraction — Branch2

At commit `61addf7`, the standalone `toggleFavFromMsg` helper moved to `src/features/message-favorite-toggle.js`. It preserves the `fav_stickers` localStorage round-trip, toast feedback, modal close, and classic-script global used by the inline message menu. The extraction was guarded for Branch2, validated for JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace. Authenticated live testing before and after push added and removed a synthetic favorite URL and restored the original localStorage array exactly. No database, message, like, follow, or account state was changed. Remote `main` remains unchanged.


### Theme-system extraction — Branch2

At commit `e6a1702`, the cohesive theme helper trio—`toggleThemePicker`, `setTheme`, and `loadSavedTheme`—moved to `src/features/theme-system.js`. The module preserves the inline HTML globals, theme-panel class toggling, HTML/body data-theme attributes, `nova-theme` localStorage persistence, active-option styling, toast feedback, and saved-theme loading. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push opened and closed the picker, applied Cyberpunk, verified persistence, and restored the original theme and panel state exactly. Remote `main` remains unchanged.


### FAB customization extraction — Branch2

At commit `846943d`, the standalone `changeFabSize` and `changeFabStyle` helpers moved to `src/features/fab-customization.js`. The module preserves the inline settings handlers, `fabSize`/`fabStyle` state, visible FAB dimensions and styling, `nova-fab-size`/`nova-fab-style` localStorage persistence, toast feedback, and long-press-menu close behavior. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push opened the FAB long-press menu, cycled size to 60px and style to glass mode, verified persisted values and menu closure, and restored the original FAB style, storage, menu, and Home state exactly. Remote `main` remains unchanged.


### FAB long-press menu extraction — Branch2

At commit `2153727`, the standalone `showFabLongPressMenu` and `closeFabLongPressMenu` helpers moved to `src/features/fab-longpress-menu.js`. The outside-tap document listener remains inline and continues to call the extracted global close helper. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push opened the menu with animation, verified CSS-pixel placement inside the 5120×4400 browser viewport, confirmed outside-tap dismissal and explicit close, and restored the original menu and Home state. The large coordinate values are valid because the browser uses `devicePixelRatio=0.25`; no positioning defect was found. Remote `main` remains unchanged.


### FAB speed-dial extraction — Branch2

At commit `96560b9`, the standalone `toggleFabMenu` and `closeFabMenu` helpers moved to `src/features/fab-speed-dial.js`. The module preserves dynamic Post, Reel, Story, Live, and Drafts item rendering, `ico` integration, viewport-aware positioning, FAB rotation/glass styling, and close/reset behavior. The outside-tap document listener and `initFabSystem` remain inline. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push opened the speed-dial, verified all five labels and in-viewport placement, confirmed rotation and glass styling, exercised outside-tap and explicit close, and restored the original menu, icon, FAB, and Home state exactly. Remote `main` remains unchanged.


### New-posts indicator extraction — Branch2

At commit `21462a0`, the standalone `showNewPostsIndicator` helper moved to `src/features/new-posts-indicator.js`. Its duplicate guard, fixed pill styling, `invalidateTabCache('home')` and `go('home')` click callback, and eight-second auto-dismiss behavior are preserved. The `_silentBackgroundRefresh` caller and protected DMs refresh logic remain inline. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push rendered the `↑ New posts` pill, confirmed exactly one instance on repeated calls, verified the guarded click callback, confirmed timed dismissal, and kept the Home shell stable without account/database mutation. Remote `main` remains unchanged.


### Avatar action-sheet extraction — Branch2

At commit `597bf0a`, the standalone `showAvatarActionSheet` helper moved to `src/features/avatar-action-sheet.js`. Its profile-dependent View Photo option, Change Photo `avpick` handler, Cancel action, fixed bottom-sheet styling, duplicate replacement, and outside-overlay cleanup are preserved. Upload and crop logic remain inline. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated live testing before and after push rendered the current View Photo, Change Photo, and Cancel options, confirmed exactly one sheet on repeated invocation, verified Cancel and outside-tap dismissal, and avoided any upload/profile/database mutation. Remote `main` remains unchanged.


### Video-length options extraction — Branch2

At commit `c081e35`, the standalone `showVideoLengthOptions` helper moved to `src/features/video-length-options.js`. The inline `MAX_VIDEO_LEN`, `selectVideoLen`, and `trimVideo` logic remain in the application script. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated pre-push and post-push testing used a temporary in-memory picker harness because Home had no active media-create picker: 75-second input rendered 15s, 30s, 60s, and Full (75s), Full selection set `_videoTrimTo='full'`, and 240-second input emitted the over-limit toast, rendered through 180s, and default-selected 180 seconds. Temporary DOM, toast, and trim state were restored exactly; no upload, account, or database mutation occurred. Remote `main` remains unchanged.


### Filter-tray extraction — Branch2

At commit `a1cf6cc`, the standalone `showFilterTray` helper moved to `src/features/filter-tray.js`. Inline `selectFilter`, `FILTERS`, and `AI_FILTERS` definitions remain in the application script. Guarded extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, script order, exact boundaries, and whitespace checks passed. Authenticated pre-push and post-push testing used a temporary in-memory tray/media harness because Home had no active create-media picker: 24 chips rendered, media URLs produced 24 preview images, no-media mode produced placeholders, and selecting the second chip updated `_selectedFilter`, applied the CSS filter, highlighted the chip and label, and emitted the expected toast. Temporary DOM, selection state, and toast state were restored exactly; no account or database mutation occurred. Remote `main` remains unchanged.

### Sticker-tab checkpoint — Branch2
At commit `b073ab5`, `showStickerTab` moved to `src/features/sticker-tab.js`. The inline `openStickerPicker`, `stickerSend`, `stickerToggleFav`, and `searchGiphy` actions remain in the application script so message insertion, favorite mutation, and GIF search behavior are preserved. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. Authenticated pre-push and post-push cache-busted browser tests used a temporary sticker-picker harness: Recent, Favorites, and Search rendered correctly, active styles and `_stickerUrls` updated, Search invoked `searchGiphy('trending')`, and all temporary localStorage, DOM, search stub, and state values were restored exactly without sending a sticker or mutating the account/database. The DMs, Reels, Stories, Calls, navigation, voice recording, admin, push-subscription, and `spawnLikeParticles` protected systems remain inline. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

**Next low-risk candidates:** `toggleVanishMode`, `toggleReelsMute`, `showReportModal`/`submitReport` review, `showBlockedList`, `toggleAttachmentSheet`, account-switcher/note creator UI, and cohesive note-music helpers. Protected DMs/chat, Reels swipe, Stories viewer/editor, Calls/WebRTC, voice recording, admin actions, and push-subscription handlers remain deferred.

### Vanish-mode checkpoint — Branch2
At commit `885987e`, the standalone `toggleVanishMode` helper moved to `src/features/toggle-vanish-mode.js`. Its global `window._vanishMode` toggle, `vanish-btn` icon update, `mlist` background update, and ON/OFF toast messages are preserved; the adjacent `toggleReelsMute` helper and all DMs/chat rendering remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test toggled a temporary chat-like harness on and off, confirmed both visual states and toasts, preserved the protected DMs/Reels/Stories/Calls globals, and restored temporary DOM, toast, and state exactly without account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Reels-mute checkpoint — Branch2
At commit `89a081f`, the UI-only `toggleReelsMute` helper moved to `src/features/toggle-reels-mute.js`. The existing `reelsMuted` and `currentReelIdx` state, current-video lookup, guarded play call, `.mute-icon` updates, `ico` rendering, and mute/sound toasts are preserved; the protected `renderReels` swipe system remains inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test used a temporary video/icon harness and confirmed both directions, one play call on sound-on, protected DMs/Stories/Calls globals, and exact restoration of temporary DOM, toast, and Reels state without account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Report-modal checkpoint — Branch2
At commit `51b3da6`, the standalone `showReportModal` renderer moved to `src/features/show-report-modal.js`. The inline `REPORT_REASONS` state, `submitReport` database mutation, and `reportUser` caller remain in the application script; the renderer still delegates both click and touch events to `submitReport` and preserves hover styling and Cancel behavior. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test rendered all eight reasons in a temporary modal, exercised hover, click, touch, and Cancel paths, confirmed protected DMs/Reels/Stories/Calls globals, and restored all temporary stubs and DOM exactly without submitting a report or mutating the account/database. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Attachment-sheet checkpoint — Branch2
At commit `fe81251`, the standalone `toggleAttachmentSheet` renderer moved to `src/features/attachment-sheet.js`. The generated Gallery/Camera file inputs, `sendMediaMsg` onchange handlers, Location delegation to inline `shareLocation`, and Sticker delegation to inline `openStickerPicker` remain behaviorally unchanged; the protected DMs/chat message and realtime core remains inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test rendered exactly four tiles, verified file input accept/capture attributes and handlers, exercised temporary Location and Sticker delegates, confirmed protected DMs/Reels/Calls globals, and restored all temporary stubs and DOM exactly without upload, location, sticker, message, or database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Note-creator checkpoint — Branch2
At commit `5ef537e`, the standalone `openNoteCreator` note-composer renderer moved to `src/features/open-note-creator.js`. Inline `_myActiveNote` state, `selectNoteVisibility`, `renderNoteMusicSection`, `submitNote`, and `deleteMyNote` remain in the application script; the renderer preserves new/edit titles, draft initialization, music metadata initialization, visibility buttons, character counting, and persistence handlers. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered New and Edit modes, draft input, character count, visibility selection, music-section delegation, protected DMs/Reels/Stories/Calls globals, and exact restoration of all temporary stubs, state, and DOM without saving or deleting a note or mutating the account/database. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Note-visibility checkpoint — Branch2
At commit `d062c11`, the standalone `selectNoteVisibility` helper moved to `src/features/select-note-visibility.js`. Its global `_noteVisibility` update and active/inactive styling for Everyone, Followers, and Close Friends are preserved; note music and persistence helpers remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test selected all three visibility values in a temporary harness, confirmed matching active styles and inactive resets, preserved note/DMs/Reels/Stories/Calls globals, and restored temporary DOM and state exactly without note or database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Note-music renderer checkpoint — Branch2
At commit `8c9548a`, the standalone `renderNoteMusicSection` UI renderer moved to `src/features/render-note-music-section.js`. Empty Add a song state, selected track metadata/artwork state, remove-and-rerender behavior, and inline `openMusicSearch` delegation are preserved; search, selection, preview audio, and note persistence helpers remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered empty and selected states, artwork/metadata, remove behavior, protected note/music/DMs/Reels/Calls globals, and exact restoration of temporary DOM and state without network search, note save, or database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Preview-icon checkpoint — Branch2
At commit `da6fbec`, the standalone `resetPreviewIcon` helper moved to `src/features/reset-preview-icon.js`. Its play-triangle SVG restoration and missing-element no-op behavior are preserved; inline preview-audio state, playback, cleanup, and note selection remain unchanged. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test verified triangle restoration, safe missing-element behavior, protected preview/music/note/DMs/Reels/Calls globals, and exact temporary DOM cleanup without audio playback or note/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Preview-audio cleanup checkpoint — Branch2
At commit `2466507`, the standalone `stopAllPreviewAudio` cleanup helper moved to `src/features/stop-all-preview-audio.js`. Its pause, `_previewAudio=null`, and `_previewPlayingIdx=null` behavior is preserved; inline preview state declarations, playback, reset-icon, and note selection remain unchanged. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test verified pause/reset behavior, idempotent second invocation, protected preview/music/note/DMs/Reels/Calls globals, and exact restoration of temporary state without real audio playback or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Preview-play checkpoint — Branch2
At commit `e2a8093`, the standalone `togglePreviewPlay` controller moved to `src/features/toggle-preview-play.js`. Missing-URL handling, same-track pause, track switching, Audio creation/play, pause-bar and play-triangle icon transitions, and ended-event cleanup are preserved; inline preview state declarations and note selection remain unchanged. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test exercised missing URL, play, same-track pause, track switching, `onended`, protected music/note/DMs/Reels/Calls globals, and exact restoration of fake Audio, toast, preview state, and temporary DOM without real playback or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Note-music selection checkpoint — Branch2
At commit `1a07d62`, the standalone `selectNoteMusicResult` helper moved to `src/features/select-note-music-result.js`. No-preview attachment, panel removal, `_noteMusic` initialization, rerender, recent persistence delegation, and preview-path segment-picker delegation are preserved; recent storage and segment-picker UI remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered both no-preview and preview paths, expected state/handler arguments, cleanup, protected music/note/DMs/Reels/Calls globals, and exact restoration of temporary state without real note save, account/database mutation, or network search. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Recent-music persistence checkpoint — Branch2
At commit `1faf1ce`, the standalone `saveRecentMusic` localStorage helper moved to `src/features/save-recent-music.js`. Its `nova_recent_music` key, title/artist deduplication, newest-first insertion, eight-item cap, serialized persistence, and no-throw catch behavior are preserved; recent rendering and segment-picker UI remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test verified ordering, duplicate replacement, eight-item cap, malformed-JSON no-throw behavior, protected music/note/DMs/Reels/Calls globals, and exact isolated-storage restoration. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Recent-suggestions renderer checkpoint — Branch2
At commit `2164c6d`, the standalone `renderRecentMusicSuggestions` UI renderer moved to `src/features/render-recent-music-suggestions.js`. Empty prompt, RECENTLY USED header, recent rows, artwork/fallback presentation, and inline `selectNoteMusicResult` handlers are preserved; search, selection, recent storage, and note persistence remain appropriately separated. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered empty and populated states, artwork/fallback rows, selection handlers, protected music/note/DMs/Reels/Calls globals, and exact restoration of isolated storage and temporary DOM without selection or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Segment-picker cancellation checkpoint — Branch2
At commit `3383252`, the standalone `cancelSegmentPicker` cleanup helper moved to `src/features/cancel-segment-picker.js`. Segment-audio pause/null cleanup and optional `music-segment-panel` removal are preserved; preview playback and note confirmation remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test verified pause/reset behavior, panel removal, idempotent repeat invocation, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without note or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Segment-confirmation checkpoint — Branch2
At commit `aaf0cf2`, the standalone `confirmMusicSegment` helper moved to `src/features/confirm-music-segment.js`. Segment-audio pause/reset, `_noteMusic` creation with the selected start offset, panel removal, note-render delegation, and recent-persistence delegation are preserved; segment preview and note submission remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test verified all confirmation effects, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without real note save or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Segment-preview controller checkpoint — Branch2
At commit `302ecb0`, the standalone `toggleSegmentPreview` audio-preview controller moved to `src/features/toggle-segment-preview.js`. Pause/play branching, segment start offset, icon transitions, audio reuse, play failure delegation, and `onended` reset are preserved; segment cancellation, confirmation, and note submission remain separated. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered play, pause, reuse, offset, ended-icon reset, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without real playback or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Segment-picker renderer checkpoint — Branch2
At commit `0b49ab4`, the standalone `showMusicSegmentPicker` renderer moved to `src/features/show-music-segment-picker.js`. Search-panel cleanup, panel styling/markup, title/artist/artwork, waveform bars, drag window/time label, initial segment offset, and cancel/confirm/preview inline handlers are preserved; drag-window mechanics remain inline. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered panel replacement, metadata/artwork, 50-bar waveform, controls, handler delegation, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without playback, network, or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Drag-window interaction checkpoint — Branch2
At commit `50f8768`, the standalone `setupSegmentDragWindow` helper moved to `src/features/setup-segment-drag-window.js`. Initial clamping, 8-second/30-second window math, time-label updates, touchstart/touchmove/touchend listeners, live-audio seeking, and cursor state are preserved; inline segment audio state and note submission remain untouched. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered initial state, a synthetic 50% touch drag, label/audio updates, default prevention, cursor reset, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without playback or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Music-search panel checkpoint — Branch2
At commit `9db9138`, the standalone `openMusicSearch` panel renderer moved to `src/features/open-music-search.js`. Search-panel markup, cleanup handler, input delegation, results container, focus/scroll behavior, and recent-suggestions delegation are preserved; the inline search API remains untouched. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered panel/input/results markup, focus, recent delegation, cleanup-handler markup, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without network or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Search-controller checkpoint — Branch2
At commit `73197dd`, the standalone `searchMusicForNote` controller moved to `src/features/search-music-for-note.js`. Debounce handling, empty/recent branch, Searching/No songs found/Search failed states, iTunes fetch, result row markup, preview/play delegation, and note-music selection delegation are preserved; inline audio state and note submission remain untouched. Guarded Branch2-only extraction, JavaScript syntax, inline syntax, deep-link safeguards, protected markers, exact script order, global availability, and whitespace checks passed. The cache-busted authenticated post-push test covered all controller branches with fake fetch, protected music/note/DMs/Reels/Calls globals, and exact temporary-state restoration without network or account/database mutation. Remote `main` remains unchanged at `ef418007c9b9a797488b4825be5f0c807da22369`.

### Phase 117 — `openMoreEmojiPicker` — COMPLETE

Moved the note native-emoji bottom-sheet renderer to `src/features/open-more-emoji-picker.js`. The module preserves the `more-emoji-panel` overlay, native emoji input and phone-keyboard focus trigger, note-specific inline `submitNativeEmojiReaction` handler, Send Reaction control, Cancel control, and outside-click dismissal. The persistence boundary remains inline: `submitNativeEmojiReaction`, `reactToNote`, and `loadNoteReactorsList` were not extracted. All static validators, syntax checks, protected-function checks, exact script order checks, and whitespace checks passed. Commit `47084d9bd859eeee5bd0b0eb169726dd90e76a89` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push UI smoke testing verified global availability, markup, note-ID delegation, focus, outside-click dismissal, Cancel dismissal, protected inline reaction globals, and complete temporary-state restoration without a real reaction or database mutation.

### Phase 118 — `showAccountSwitcher` — COMPLETE

Moved the account-switcher modal renderer to `src/features/show-account-switcher.js`. The module preserves current-account synchronization, saved-account list rendering, current-row highlighting, avatar/icon rendering, switch/remove inline handlers, and the Add Account row. Authentication/session mutation remains inline: `switchToAccount`, `removeAccountFromSwitcher`, and `addNewAccount` were not extracted. Static syntax, deep-link, protected-function, script-order, dependency-boundary, and whitespace checks passed. Commit `d2fd550d00fa94efd94989613ea589548d7886ad` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated isolated smoke testing verified global availability, awaited sync and list reads, current/other account row behavior, preserved handlers, icons/avatars, protected inline helpers, unchanged active identity/localStorage, and no session switch, reload, or database mutation. The preview’s `closeModal` window binding was already undefined before restoration and remains unrelated to this renderer extraction; the original inline `closeModal()` handler strings were preserved exactly.

### Phase 119 — `removeAccountFromSwitcher` — COMPLETE

Moved the saved-account removal helper to `src/features/remove-account-from-switcher.js`. The module preserves the current-account guard toast, delegates non-current deletion to `removeAccountSession`, and refreshes the account-switcher renderer through `showAccountSwitcher`. Authentication/session switching and new-account bootstrap remain inline: `switchToAccount` and `addNewAccount` were not extracted. The full static validation chain, including updated cross-validator module-boundary assertions, passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `64cc78f80dcf9d962aa77fc52ec3468ce987754c` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing covered both current and non-current branches with reversible stubs, verified protected globals, and restored all stubs, active identity, and `nova_accounts` localStorage without account/session, reload, or database mutation.

### Phase 120 — `addNewAccount` — COMPLETE

Moved the new-account login transition helper to `src/features/add-new-account.js`. The module preserves the maximum saved-account guard, `_addingNewAccount` background-session flag, ME/PROF identity reset, account-scoped UI reset, root/auth screen transition, login-mode selection, and Hindi prompt toast. Authentication session switching remains inline: `switchToAccount` was not extracted. The full static validation chain, including updated cross-validator module-boundary assertions, passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `4137c1e4a76c9569c9935a27c2336d0812d55e04` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing covered both max-account rejection and allowed transition branches with reversible stubs, verified protected globals, and restored all stubs, identity objects, UI styles, background-session flag, and localStorage without starting login or changing auth/database state.

### Phase 121 — `switchToAccount` — COMPLETE

Moved the saved-account authentication switch helper to `src/features/switch-to-account.js`. The module preserves saved-target lookup, missing-account guard, access/refresh token delegation to `db.auth.setSession`, success modal close and delayed reload, failure toast, and failed-target session cleanup. The full static validation chain, including updated cross-validator module-boundary assertions, passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `c4a2f9ed81911ea3977176c762704a876640ae02` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing used only reversible stubs and covered missing target, successful token delegation, and synthetic auth failure; it verified protected globals and restored the Supabase method, UI/account helpers, timer, identity, localStorage, and window bindings without changing the real session, reloading, or mutating the database.

### Phase 122 — `showBlockedList` — COMPLETE

Moved the blocked-accounts list renderer to `src/features/show-blocked-list.js`. The module preserves the modal/loading state, `blocks` read with profile join and active-user filter, empty-state message, avatar rendering, user rows, and inline `unblockUser` handlers. Block/unblock mutation helpers remain inline: `blockUser` and `unblockUser` were not extracted. The full static validation chain passed, including the updated profile validator using the deep-link-aware HTML checker and the new blocked-list boundary checks for syntax, protected systems, script order, dependencies, and whitespace. Commit `b9a65742a85d5354d33cd91b1c48703c0d98d421` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing used stubbed read/modal/avatar dependencies and covered empty and populated states, preserved unblock handlers, query shape, protected globals, and exact restoration without any block/unblock mutation or database write.

### Phase 123 — `setupSelfProfileRealtimeSync` — COMPLETE

Moved the self-profile realtime subscription setup to `src/features/setup-self-profile-realtime-sync.js`. The module preserves prior-channel teardown, active-user channel naming and filter, `postgres_changes` UPDATE registration for `profiles`, PROF merge behavior, messaging ban/unban toasts, ban toast, delayed logout scheduling, and subscription activation. The full static validation chain passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `2dfbc17483d2b20e8ba1049f19c16f7e4138fd95` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing used stubbed channel, timer, toast, logout, and profile state dependencies and verified teardown, channel/filter wiring, update branches, delayed logout callback, protected globals, and exact restoration without creating a realtime subscription, logging out, or mutating the database. Two test-harness-only syntax/field typos were recovered by reloading the same commit before the successful corrected run; no application code was affected.

### Phase 124 — `getBlockedList` — COMPLETE

Moved the one-directional blocked-user ID reader to `src/features/get-blocked-list.js`. The module preserves the `blocks` query, `blocked_id` selection, active-user filter, and `Set` return contract used by profile/block controls. Bidirectional content-hiding and messaging checks remain inline: `getBlockedBothWaysSet` and `isMessagingBlocked` were not extracted, and block/unblock mutations also remain inline. The full static validation chain passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `7b54aed972bfe87e27e90ded72466a5b9c856ba2` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing used a stubbed read-only query and covered empty/populated Set results, exact query parameters, protected globals, and complete restoration without any database write or block mutation.

### Phase 125 — `getBlockedBothWaysSet` — COMPLETE

Moved the pure bidirectional blocked-user ID reader to `src/features/get-blocked-both-ways-set.js`. The module preserves the parallel `blocks` queries for users I blocked and users who blocked me, then returns the deduplicated `Set` used by feed filtering, explore/search filtering, profile gating, and content hiding. Messaging checks and mutations remain inline: `isMessagingBlocked`, `blockUser`, and `unblockUser` were not extracted. Cross-validators were updated to require the module tag while preserving the inline protected boundaries. The full static validation chain passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `b987ea979fafbd57551b03bb4c5335e5745b717f` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing used two stubbed read paths and verified query direction/filters, union/deduplication, protected globals, and exact restoration without chat operations, block mutation, or database writes.

### Phase 126 — `getLocalStickers` — COMPLETE

Moved the pure localStorage sticker-list reader to `src/features/get-local-stickers.js`. The module preserves JSON parsing for `<type>_stickers`, malformed-data cleanup by removing the invalid key, and the empty-array fallback. Sticker favorites, picker rendering, sticker sending, and DM/database mutation flows remain inline. The extracted file received the required trailing-whitespace cleanup after the first validator pass. The full static validation chain then passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `7b6f5504fe846440fb342a2772186a1c888bcdc5` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing covered valid JSON retrieval and malformed JSON cleanup, verified protected sticker/DM/Reels globals, and restored all temporary localStorage fixtures without sending a sticker or writing to the database.

### Phase 127 — `saveLocalSticker` — COMPLETE

Moved the local-only sticker recents persistence helper to `src/features/save-local-sticker.js`. The module preserves newest-first insertion, duplicate suppression, the 20-item maximum, and conditional localStorage persistence while leaving favorites, picker rendering, sticker sending, and DM/database mutations inline. The full static validation chain passed for syntax, inline syntax, deep links, protected systems, script order, dependencies, and whitespace. Commit `e46aa050e3fa8bbd9fa4806409fccc564752d315` is pushed to Branch2; `main` remains untouched at `ef418007c9b9a797488b4825be5f0c807da22369`. Authenticated post-push testing covered new insertion, duplicate suppression, cap eviction, protected sticker/DM/Reels globals, and exact localStorage restoration without sending a sticker or writing to the database.
