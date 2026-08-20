# NovaSocial Clipboard Interaction Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the current copy-link and copy-message interaction surface during further modularization.

## Contract

The application surface currently contains seven `navigator.clipboard.writeText(...)` calls and one legacy `document.execCommand('copy')` fallback. These surfaces cover messages, invite links, story links, profile links, post links, and settings links. The extracted message helper retains both its awaited handled path and its existing Promise-chain path.

This audit freezes the current behavior only. It does not normalize synchronous versus asynchronous error handling, add a permissions probe, change toast text, introduce a fallback helper, or alter clipboard permissions. Those may be separate product/bug-fix decisions and are not safe speculative modularization changes.

## Harness coverage

`docs/clipboard-interaction-contract-harness.js` statically scans `index.html` and `src/**/*.js`. It asserts the current operation counts, required helper names, the legacy post-link fallback, and the existing message helper handling markers. It does not request clipboard permission, read clipboard contents, authenticate, or display toasts.

| Check | Expected behavior | Result |
|---|---:|---|
| Async Clipboard API | 7 existing `writeText` calls | PASS |
| Legacy fallback | 1 `execCommand('copy')` call | PASS |
| Message copy helper | Awaited handled path and existing Promise-chain path retained | PASS |
| Copy helper coverage | Invite, story, profile, post, settings, and message surfaces remain | PASS |
| Production behavior | No copy/error-handling changes | PASS |

## Safe boundary

No production logic is changed by this audit. The contract records the clipboard surface so future extraction cannot silently drop a copy action or rewrite fragile permission/error behavior.

## References

1. [`src/features/message-clipboard-helpers.js`](../src/features/message-clipboard-helpers.js)
2. [`src/features/copy-invite-link.js`](../src/features/copy-invite-link.js)
3. [`src/features/copy-story-link.js`](../src/features/copy-story-link.js)
4. [`src/features/post-actions.js`](../src/features/post-actions.js)
5. [`index.html`](../index.html)

