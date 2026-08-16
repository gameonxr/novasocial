# NovaSocial DMs Core Risk Map

This document records the dependency and preservation requirements for the remaining DMs/chat core on `Branch2`. It is an analysis checkpoint, not permission to move the protected functions without a separate guarded extraction and live verification.

## Current protected core

| System | Current role | Key dependencies and invariants | Extraction decision |
|---|---|---|---|
| `renderDMs` | Builds the primary DMs list and Notes Bar | Parallel `Promise.all` fetch of conversations, unread messages, and `_fetchNotesBarData`; `_renderGeneration` race guard; `data-cid` markers consumed by `_refreshDmsInPlace`; cache and scroll behavior | Keep inline until a complete replacement boundary and authenticated smoke test exist |
| `openChat` | Opens a conversation and builds the chat screen | `pushNavState`; `_chatScreenActive`; `_renderGeneration`; member/conversation queries; `isMessagingBlocked`; draft restoration; `loadMsgs`; `startTypingWatcher`; `chatSubscription`; near-bottom versus history-preserving realtime behavior | Keep inline; highest DMs risk |
| `loadMsgs` | Loads and renders the latest message page | Message/profile/reply/media queries; initial bottom scroll; message event handlers; pagination handoff; message-list DOM identity | Keep inline; pagination and scroll invariants must remain together |
| `_loadOlderMessages` | Prepends older pages while preserving viewport | Existing message-list identity; `oldScrollTop`; `oldScrollHeight`; post-prepend offset correction; pagination flags | Keep inline with `loadMsgs` until tested as one unit |
| `_refreshDmsInPlace` | Non-destructive DMs background refresh | Notes Bar refresh; conversation item patching; `_chatScreenActive` guard; no replacement of `#screen`; no scroll jump | Keep inline; this is the fix for the prior DMs opening/scroll regression |
| `_silentBackgroundRefresh` | Tab-revisit background refresh coordinator | `_renderGeneration`; cache expiry; DMs special path; Reels special path; `requestAnimationFrame` fade/scroll behavior | Keep inline with navigation/cache coordinator |
| `startTypingWatcher` / `setTyping` | Typing state and realtime typing indicator | `typingSub`; DOM `#typing-indicator`; timer lifecycle; profile realtime updates; chat identity | Keep inline; realtime/timer coupling |
| `sendMsg` / `sendMediaMsg` | Sends text/media and updates UI | `isMessagingBlocked`; optimistic append; draft clearing; Supabase inserts; realtime backstop; current chat/list identity | Keep inline; DB and optimistic rendering coupling |

## Invariants that must not change

The DMs refresh path must not replace the active chat DOM while a chat is open. `window._chatScreenActive` and `_renderGeneration` prevent stale async results from painting over a newer navigation state. The primary DMs renderer must retain its parallel conversation/unread/Notes Bar fetch and its generation guard.

The chat realtime subscription must continue to distinguish a user near the bottom from a user browsing history. Near-bottom messages may reload the latest page; history browsing must preserve loaded older messages and show `_showNewMessagePill` instead. The message-list scroll correction in `_loadOlderMessages` must continue to use the old height and old scroll position to preserve the visible message.

The chat back path must remove `chatSubscription`, clear `_chatScreenActive`, restore the DMs route, and preserve the navigation stack. Typing subscriptions and timers must be replaced or cleared when switching conversations. One-to-one message sending must continue to enforce the bidirectional `isMessagingBlocked` check before inserts, with the server-side blocked-message error handling retained as a backstop.

## Recommended future extraction order

The safe helper layer is now substantially modularized. The next work should be analysis-only for the core functions, followed by a dedicated test fixture or authenticated smoke path before any movement. If extraction proceeds later, keep `loadMsgs` together with `_loadOlderMessages` and the message-rendering helpers, keep `openChat` together with its subscription and typing setup, and leave `renderDMs` plus `_refreshDmsInPlace` together with the navigation/cache coordinator. WebRTC Calls, Stories viewer state, and Reels swipe/persistent-container code remain separate protected areas and must not be mixed into a DMs extraction.

## Checkpoint status

The risk map was prepared on clean `Branch2` at commit `44a7eb4` before any high-risk DMs movement. The live preview login shell loaded successfully, and probes confirmed all protected DMs functions and safeguards are callable before authentication. The corresponding code remains inline.
