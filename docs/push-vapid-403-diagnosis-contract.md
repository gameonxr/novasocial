# Push 403 / VAPID Curve Diagnosis Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `CONFIGURATION_BLOCKED`; no production code correction is applied.

## Observed evidence

The user-provided Supabase Edge Function log shows `subscriptions found=7`, repeated `statusCode=403`, repeated `Push failed with status 403`, and the response body `permission denied: VAPID public key must be on the P-256 curve`. The same execution reports `FINAL sent=0/7`. A second execution shows the same 403 and P-256 error pattern. Endpoint URLs and private-key values are intentionally not copied into this repository.

The log also reports VAPID public length `87` and private length `43`, but it does not provide the private key value. Therefore the server-side key pair cannot be independently reconstructed from the log alone.

## Local Branch2 finding

The only tracked client VAPID public key is the constant embedded in `index.html`. It is 87 Base64URL characters, decodes to 65 bytes with the uncompressed-point prefix `0x04`, but its `(x,y)` point fails the NIST P-256 curve equation. This independently reproduces the Edge Function’s stated curve failure. The Base64URL helper only decodes and copies bytes; it does not correct or validate curve membership.

The diagnosis is therefore **not a modularization regression** and does not imply that the `web-push` generator is faulty. The user reports using `npx web-push generate-vapid-keys`; an independent disposable reproduction of that command produced a public key that passed Node’s native P-256 parser. The value currently embedded in Branch2 does not pass that parser. The most likely causes are that a different/altered public value was copied into `index.html`, the Edge Function secret was copied or encoded differently, or the preview and Edge Function are using different key material. Because the Edge Function source and private secret are not present in this repository, matching-pair verification requires the Supabase project owner to inspect secrets without sharing private material.

## Safe remediation boundary

Do not invent or randomly replace the public key in `index.html`, and do not commit a private VAPID key. The owner should compare the original generator output against the exact value in Branch2 and the public value configured for the Edge Function, checking for copy/paste alteration, quotes, whitespace, URL-safe encoding, and preview deployment staleness. If necessary, generate one fresh valid P-256 VAPID pair, set the private key and subject in the Edge Function secrets, and update the client public key with the matching uncompressed P-256 public key in Base64URL form. Existing browser subscriptions may need controlled staging reset/resubscribe after a key rotation.

The first safe verification is offline curve validation of the public key and a staging-only subscription/send test. Production Push extraction and production notification testing remain blocked until the key pair is corrected and the controlled staging evidence is clean.

## Gate status

| Gate | Result |
|---|---|
| Log classification | PASS: repeated 403 with explicit P-256 curve error |
| Client public-key decode | PASS: 87 characters / 65 decoded bytes / `0x04` prefix |
| Client P-256 curve validity | FAIL: point is not on P-256 |
| Standard generator control | PASS: disposable `npx web-push generate-vapid-keys` output parsed as valid P-256 |
| Server private-key inspection | BLOCKED: secret not present and must not be shared |
| Safe repository auto-fix | BLOCKED: no trustworthy matching key pair available |
| Production Push extraction | BLOCKED |
| Production database/account mutation | 0 |

## References

1. User-provided redacted Supabase Edge Function log attachment: `pasted_content.txt` (local evidence only; endpoints/private values not committed)
2. [`index.html`](../index.html)
3. [`url-base64-to-uint8-array.js`](../src/features/url-base64-to-uint8-array.js)
4. [`push-permission-resubscribe-protected-readiness-contract.md`](./push-permission-resubscribe-protected-readiness-contract.md)
5. [`push-subscription-owner-independent-proof-contract.md`](./push-subscription-owner-independent-proof-contract.md)
