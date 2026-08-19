# NovaSocial Credential-Surface Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Detect accidental publication of high-confidence private credentials while allowing the app's documented public browser configuration and ordinary password-field UI text.

## Contract

Tracked application and documentation files must not contain private-key blocks, GitHub personal access tokens, OpenAI secret-key prefixes, Supabase service-role markers, AWS secret-key assignments, or Cloudinary API-secret assignments. Public browser configuration such as a Supabase URL or publishable/anon client key is not classified as a private credential by this static audit.

## Harness coverage

`docs/credential-surface-contract-harness.js` scans 384 tracked text files in `index.html`, `src/`, `sw.js`, `manifest.json`, `docs/`, and the migration documentation for high-confidence secret signatures, excluding only its own pattern-definition file. It reports only pattern names and file paths, never matching credential content.

| Check | Expected behavior | Result |
|---|---|---|
| Private-key blocks | Zero PEM private-key headers | PASS |
| GitHub PATs | Zero `github_pat_` or `ghp_` tokens | PASS |
| OpenAI secret prefixes | Zero `sk-` secret-key prefixes | PASS |
| Supabase service role | Zero service-role secret markers | PASS |
| Cloudinary/AWS secrets | Zero high-confidence secret assignments | PASS |
| Disclosure safety | Harness output redacts matching contents | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not authenticate, call external services, print secret values, modify source code, or rotate credentials.

## References

1. [`src/core/supabase.js`](../src/core/supabase.js)
2. [`index.html`](../index.html)
3. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)

