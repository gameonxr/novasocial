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
| 2 — Core Setup | In progress | 9 classic core scripts extracted; syntax, script-order, marker-preservation, and whitespace checks passed; DMs/chat-screen cache-refresh guard added after regression report; shared UI, settings, and profile feature modules now extracted; account-switch cache isolation fix added after regression report; Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, and Nova Init/FAB feature modules now extracted with static checks passing; protected deep-link handlers remain in index.html; full profile, main Story viewer/editor, DMs, Reels, and Calls remain inline; runtime click-through pending |

**Checkpoint**: Phase 2 core extraction and shared components (`modal.js`, `shared-ui.js`) are isolated on `Branch2`. The `main` branch has not been modified. Static checks pass; account-switch reset now covers startup, logout, and add-account transitions; Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, and Nova Init/FAB module order/syntax checks pass; `nova-init.js` intentionally loads after the inline app script so its `showApp` wrapper sees the existing function; protected `resolveAndOpenProfile`/`processDeepLinks` remain in index.html per critical safeguards; full profile, main Story viewer/editor, DMs, Reels, and Calls remain inline for later careful extraction; modal, navigation, haptic, overlay, FAB, settings, profile, account-switch, Auth, Home/Feed, Posts presentation, Post actions/share, Post detail, Create entry, Mention/support, Notifications, Explore/Search, Trending/hashtag, Follow List, Profile Customizer, Close Friends, Voice helper, Disappearing Messages, Read Receipts, Collaboration, Smart Replies, Story Highlights, AI Caption/Hashtag, and Nova Init/FAB click-through remain required before additional feature extraction.

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