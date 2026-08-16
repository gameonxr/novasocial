# DMs Runtime Verification Readiness

This document defines the safe authenticated smoke-test procedure for the remaining DMs core. No fixture, mock user, synthetic session, database seed, or application-code hook is added because the available preview is unauthenticated and the DMs code depends on real Supabase membership, message, profile, block, typing, and realtime state.

## Current limitation

The sandbox preview renders the NovaSocial login shell, but it has no authenticated Supabase session. The My Browser connector is enabled in session configuration, yet the active page remains the sandbox browser and exposes no authenticated client/session. Therefore, automated authenticated click-through is not claimed in this checkpoint, and no credentials are requested or handled.

## Safe verification sequence after an authenticated session is available

| Sequence | Observation only; do not mutate data |
|---|---|
| 1 | Sign in through the user’s normal SSO path and confirm the Home shell loads. |
| 2 | Open **Messages** once and record whether the Notes Bar and conversation list appear together without a visible stagger. |
| 3 | Open one existing one-to-one conversation and confirm the first render reaches the message list without a blank or header-only state. |
| 4 | Press back to DMs and reopen the same conversation. Confirm the prior chat subscription is replaced rather than duplicated and the list remains usable. |
| 5 | Scroll upward in a conversation, wait for a new-message event if naturally available, and confirm history is not replaced; the New Message indicator should be used instead. Do not send a test message. |
| 6 | Leave chat, revisit DMs, and confirm the background refresh does not replace the active chat DOM or jump the DMs scroll position. |
| 7 | Open a group conversation only if an existing group is already present. Confirm Group Info opens and back navigation restores DMs. |
| 8 | Log out and sign in with another already-authorized account only if the user independently chooses to do so; verify no previous account’s chat or Notes Bar state leaks. |

## Console probes

The following read-only probes are appropriate after login. They inspect function availability and current subscription state without invoking any mutation:

```js
({
  core: ['loadMsgs','renderDMs','openChat','sendMsg','sendMediaMsg','startTypingWatcher','setTyping'],
  safeguards: ['_refreshDmsInPlace','_silentBackgroundRefresh','isMessagingBlocked','_showNewMessagePill'],
  state: ['chatSubscription','typingSub','_chatScreenActive','_curChatId','_curIsGrp']
}).core.concat([])
```

The probe should be followed by a visual check of the message list and navigation state. It must not call `sendMsg`, `sendMediaMsg`, `clearChat`, `unsendMsg`, `pinMsg`, `reactMsg`, or any database mutation.

## Extraction gate

No movement of `loadMsgs`, `renderDMs`, `openChat`, `_refreshDmsInPlace`, `_silentBackgroundRefresh`, realtime subscriptions, typing watcher, or message-rendering helpers is approved until the authenticated sequence above passes at least once on the current `Branch2` checkpoint. After that, extraction must begin with one cohesive unit only, retain all globals used by inline HTML, and repeat syntax, protected-marker, live preview, console, and navigation checks before the next unit.

The current Branch2 code remains unchanged by this readiness document. The next extraction decision is intentionally blocked on authenticated runtime verification rather than guessed from unauthenticated startup.
