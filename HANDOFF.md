# NovaSocial — Canonical Engineering Handoff

**Repository:** `gameonxr/novasocial`
**Canonical working branch:** `Branch2` only
**Current remote checkpoint:** `ceba76f76a4cb32aa64d9b97a2268ffafa2f1788`
**Immutable protected reference:** `origin/main` = `ef418007c9b9a797488b4825be5f0c807da22369`
**Document owner:** Manus AI
**Purpose:** This file is the continuation contract for every future human or AI agent working on NovaSocial.

> **Hinglish operating rule:** Jo bhi agent yeh project continue kare, pehle `HANDOFF.md`, `MIGRATION_MAP.md`, aur relevant contract/evidence files padhe. Kaam ke dauran handoff ko saath-saath update kare. Feature complete hone ke baad handoff update, tests, commit, push, aur final status record kiye bina task complete nahi maana jayega.

## 1. Project mission and current architecture

NovaSocial is a browser application whose primary application source remains in `index.html`, supported by classic JavaScript feature files under `src/` and `src/features/`, CSS files under `src/`, a service worker in `sw.js`, and PWA metadata in `manifest.json`. The application deliberately uses **classic scripts and global `window` owners**, not ES modules. Inline HTML handlers and the existing inline application script are still part of the runtime contract.

The modularization objective is to reduce the protected inline surface safely, one explicitly authorized owner at a time. The objective is **not** to rewrite the application, convert it to ES modules, rename globals, redesign the database, or perform broad refactors. Every split must preserve caller behavior, global names, payloads, script order, timing, cleanup, and excluded systems.

The repository is operated conservatively because several systems are high-risk: authentication/bootstrap, realtime chat and notifications, Notes realtime, media/upload, Push and service-worker flows, navigation/history, Stories, Reels swipe/playback, and Calls/WebRTC. These systems must remain protected unless their own dependency map, authorization, proof dossier, and rollback evidence are complete.

## 2. Non-negotiable safety rules

| Rule | Required behavior |
|---|---|
| Branch isolation | Work only on `Branch2`. Never modify or force-push `main` or `origin/main`. |
| Origin protection | Before and after every bounded task, verify `git rev-parse origin/main` equals `ef418007c9b9a797488b4825be5f0c807da22369`. |
| Authorization | Independent proof does not authorize production extraction. A separate exact-scope production authorization addendum and exact owner approval are required. |
| Scope | Move one owner only. No unrelated refactor, caller rewrite, schema change, dependency upgrade, or product behavior change. |
| Architecture | Use external **classic scripts** with `window` assignments. Do not introduce `import`, `export`, `type="module"`, `defer`, or uncontrolled async script ordering. |
| Validation | Use synthetic mocks and observation-only browser checks. Do not invoke live actions during validation. |
| Live systems | Do not perform real Note, database, storage, upload, media, permission, service-worker, Push, VAPID, realtime, network-side-effect, account, or authentication actions unless the user separately gives an appropriately scoped instruction and the task explicitly requires it. |
| Reversibility | Every split needs a disposable reverse-state proof that restores the exact pre-split bytes and confirms immutable `origin/main`. |
| Publication | Do not call a feature complete until the full published harness suite passes, the worktree is clean, local HEAD equals `origin/Branch2`, and the evidence is committed and pushed. |

## 3. Current repository checkpoint

At the time this handoff was created, the recovered `Branch2` checkout is clean at `ceba76f`. The last published browser-proof checkpoint records the Notes submission browser observation. The expected inventory is approximately **233 source JavaScript files, 222 feature JavaScript files, 18 CSS files, 330 Markdown documents, and 319 harness files**; always measure the current checkout rather than relying on this prose when a contract asserts an exact number.

The standard validation suite is a collection of standalone Node.js harnesses in `docs/`. The current published suite contains 319 `*-harness.js` files. A passing suite is reported as `TOTAL=319 PASSED=319 FAILED=0`. If a new document or harness is added, update the relevant inventory contracts deliberately; never weaken a contract merely to make a test pass.

## 4. Completed protected-owner work

The canonical detailed ledger is `MIGRATION_MAP.md`; the readiness classification is `docs/high-risk-seam-readiness-matrix-contract.md`. The current Branch2 checkpoint includes the following bounded classic-script owner extractions and proof packages, subject to the exact files and wording in those authoritative records:

| Owner/system | External owner/module | Evidence expectation |
|---|---|---|
| Particle effects | `src/features/spawn-like-particles.js` | Synthetic behavior and protected caller handoff preserved. |
| Deletion fallback | `src/features/sync-local-deletion-fallback.js` | Detached lifecycle and rollback evidence present. |
| Push settings enable/reset | `src/features/push-settings.js` | Permission and Push side effects excluded from proof. |
| Note viewer owners | `src/features/note-viewer-owners.js` | Viewer behavior preserved; live Note/account actions excluded. |
| Note deletion | `src/features/note-deletion-owner.js` | Synthetic deletion proof and rollback evidence required/present. |
| Story editor owners | `src/features/story-editor-owners.js` | Story editor boundaries remain separate from polls/media systems. |
| Reels windowing helper | `src/features/reels-video-windowing.js` | Helper is bounded; swipe, playback, navigation, and media-policy systems remain protected. |
| Notes reactor list | `src/features/note-reactors-list-owner.js` | Read-only interaction boundary only. |
| DMs renderer | `src/features/dms-renderer-owner.js` | Renderer owner only; realtime/chat ownership remains protected. |
| Reels renderer | `src/features/reels-renderer-owner.js` | Renderer only; swipe/playback/navigation remain protected. |
| Notes reaction | `src/features/notes-reaction-owner.js` | Invocation remains unperformed in browser-safe validation. |
| Silent Push resubscribe | `src/features/push-silent-resubscribe-owner.js` | Push, service-worker, subscription, VAPID, and permission actions remain excluded. |
| Notes submission | `src/features/notes-submission-owner.js` | `window.submitNote`; synthetic insert/update proof; no live Note/database action. |

The readiness matrix is authoritative if a count or historical label in this summary differs from the current contract. Do not infer authorization for a neighboring owner from a completed owner.

## 5. Notes submission completion checkpoint

`submitNote()` was extracted only after the project-owner approval recorded in `docs/notes-submission-owner-production-authorization-addendum.md`. The owner moved from the exact inline boundary recorded there into `src/features/notes-submission-owner.js` as `window.submitNote`, with one classic-script linkage and no caller/schema change.

The Notes submission proof package includes:

- `docs/notes-submission-owner-dependency-map.md`
- `docs/notes-submission-owner-independent-authorization-addendum.md`
- `docs/notes-submission-owner-independent-proof-contract.md`
- `docs/notes-submission-owner-independent-proof-contract-harness.js`
- `docs/notes-submission-owner-production-authorization-addendum.md`
- `docs/notes-submission-owner-production-split-contract.md`
- `docs/notes-submission-owner-production-split-contract-harness.js`
- `docs/notes-submission-owner-parity-rollback-evidence.txt`
- `docs/notes-submission-owner-after-split-browser-proof-evidence.txt`

The required synthetic cases are empty validation, insert success, update success, insert error, and update error, including exact payloads, visibility, expiry, UI ordering, cleanup, and error behavior. The current closing result is **319/319 harnesses PASS**, disposable rollback PASS, browser observation PASS, clean Branch2, remote alignment PASS, and immutable `origin/main` PASS.

## 6. Pending and explicitly blocked systems

The remaining systems must not be extracted merely because a nearby owner was extracted. The canonical matrix and the relevant dossier control each decision. In particular, broader Notes/realtime ownership, Notes editor construction, reactions and reactor-list expansion, Note viewer audio, media/music selection and upload, expiry cleanup, navigation/history, Reels swipe/playback/media policy, Stories polls/recording, chat/realtime, notifications/realtime, Push subscription and permission flows, service-worker behavior, Calls/WebRTC, authentication/bootstrap, moderation, database schema/policies, and Supabase Edge Functions remain separately gated or excluded unless their own authorization says otherwise.

A blocked candidate needs preparation, not production mutation. The safe next action is to create or update its dependency map, independent authorization/proof contract, detached synthetic before-proof, and handoff entry. Do not create a production module or change `index.html` for a blocked candidate.

## 7. A-to-Z workflow for splitting any protected owner

### A. Inventory and identify one owner

Start by locating the exact inline declaration in `index.html`. Record its current line range, complete balanced function body, callers, globals read/written, DOM IDs/classes, external APIs, timing, cleanup, and neighboring script boundaries. Confirm that the candidate is one owner rather than a coupled system.

### B. Confirm branch and immutable baseline

Run:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git rev-parse origin/Branch2
git rev-parse origin/main
```

Stop if the branch is not `Branch2`, the worktree is unexpectedly dirty, the remote Branch2 state is unclear, or `origin/main` differs from the protected immutable SHA. Fetch before comparing remote refs:

```bash
git fetch origin Branch2 main
git rev-parse origin/main
```

### C. Create the dependency map

Create `docs/<owner>-dependency-map.md`. It must state the exact owner boundary, callers, globals, DOM dependencies, database/storage/network dependencies, timing and cleanup, script-order requirements, excluded neighbors, and all synthetic mock boundaries. It must explicitly state whether the document is preparation-only or production-authorized.

### D. Create independent authorization and proof contract

For a blocked candidate, create an independent authorization addendum with `PRODUCTION_DECISION=BLOCKED` and `EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`. Create a standalone harness that loads the owner in a detached VM/synthetic DOM and proves the relevant behavior without live APIs. This is a prerequisite, not production approval.

### E. Run the detached before-proof

Run the candidate’s independent harness directly and record its output/evidence. The before-proof must cover all documented branches and assert zero live effects. If it fails, diagnose the exact assertion; do not bypass it and do not extract the owner.

### F. Obtain exact production authorization

Create a separate `docs/<owner>-production-authorization-addendum.md` for review. It must state repository, Branch2 restriction, baseline, exact owner range, proposed module/global/linkage, exclusions, proof gates, rollback requirements, browser-safe rules, and explicit approval wording. Do not treat a review draft, a generic “continue,” or independent authorization as production approval.

### G. Record approval before source mutation

Only after the user sends an explicit exact-scope approval may the production extraction start. Update the addendum from review-only to authorized state without changing the owner scope or exclusions. Record `PRODUCTION_CHANGE=0` until the guarded extractor has passed all pre-write guards.

### H. Build a guarded extractor

Use a temporary script saved under `/tmp` or `docs/` that:

1. Reads current `index.html` and immutable `origin/main:index.html` with a sufficient buffer.
2. Extracts the balanced owner body, not a nested callback or partial tail.
3. Normalizes only the approved wrapper difference and compares exact owner parity.
4. Asserts one exact owner boundary, one linkage, no duplicate module/global, and no unrelated source change.
5. Writes only the new module and the one `index.html` linkage/removal after every guard passes.
6. Aborts before writing on any mismatch.

The module must be an external classic script, for example:

```javascript
window.exampleOwner = async function exampleOwner() {
  // exact approved body; no unrelated rewrite
};
```

### I. Preserve script order and globals

Place the new linkage where the owner’s dependencies and callers remain valid. Verify the global name, function arity, return behavior, closure visibility, `window` ownership, inline handler resolution, and load order. Never add `type="module"`, `defer`, or an asynchronous loading strategy to a classic owner split.

### J. Generate the production split contract

Create `docs/<owner>-production-split-contract.md` and a paired `*-contract-harness.js`. The production harness must verify current external ownership against immutable origin, one linkage, zero inline owner, synthetic scenarios identical to the independent harness, zero live effects, and the authorized exclusions. Reuse scenario logic only when ownership checks remain explicit.

### K. Prove exact parity and lifecycle behavior

Run the production harness. It must cover successful and failing paths, payloads, DOM/UI ordering, timers, cleanup, callbacks, visibility/expiry, and any owner-specific state. A passing static owner check is not enough.

### L. Prove rollback in a disposable directory

Use a temporary disposable copy or worktree. Reverse only the new module, linkage, and exact owner boundary. Assert byte-for-byte restoration to the pre-split baseline, exact baseline commit/hash, no mutation to the live Branch2 checkout, and immutable origin/main preservation. Save the evidence file under `docs/`.

### M. Synchronize contracts deliberately

A new module, harness, Markdown file, evidence file, or matrix row changes repository inventories. Update only the exact stale expectations caused by the authorized change. Do not perform broad numeric replacement. Keep historical independent contracts meaningful: change only their current-owner reader or approved-state expectation when the established pattern requires it; preserve their synthetic scenarios.

### N. Run syntax and full regression

Use:

```bash
for f in docs/*harness.js; do node --check "$f" || exit 1; done

total=0; passed=0; failed=0
for f in docs/*harness.js; do
  total=$((total+1))
  if node "$f"; then passed=$((passed+1)); else failed=$((failed+1)); fi
done
printf 'TOTAL=%s PASSED=%s FAILED=%s\n' "$total" "$passed" "$failed"
```

Every harness must pass. Never delete a failing harness, reduce its scope, or mark a failure as expected without a documented contract reason and owner review.

### O. Perform browser-safe observation only

Open the Branch2 preview after deployment. Observation may verify that the page reaches its safe boundary, the external module returns HTTP 200, the classic global exists, and no owner invocation occurred. Do not log in, submit forms, invoke the owner, create/update Notes, touch database/storage/upload, request permissions, access Push/service-worker APIs, or mutate account state. Save exact results to `docs/<owner>-after-split-browser-proof-evidence.txt`.

### P. Update canonical records

Update `MIGRATION_MAP.md`, `docs/high-risk-seam-readiness-matrix-contract.md`, the owner’s authorization/proof/contract files, and this `HANDOFF.md`. Record baseline, owner hash, module/linkage, gates, exclusions, browser evidence, regression count, commit IDs, and next blocked/authorized state.

### Q. Review diff and stage only intended files

Run:

```bash
git diff --check
git status --short
git diff --stat
git diff -- index.html src/features/<owner-module>.js
```

Review every changed file. Revert unrelated edits. Stage only the authorized source change and its evidence/contracts.

### R. Commit with a specific message

Use a focused commit such as:

```bash
git add index.html src/features/<owner-module>.js docs MIGRATION_MAP.md HANDOFF.md
git diff --cached --check
git commit -m "Extract authorized <owner> owner"
```

If a later contract-only fix is required, use a separate precise commit and explain why it changed.

### S. Push Branch2 and verify remote alignment

```bash
git push origin Branch2
git fetch origin Branch2 main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/Branch2)"
test "$(git branch --show-current)" = Branch2
test "$(git rev-parse origin/main)" = ef418007c9b9a797488b4825be5f0c807da22369
test -z "$(git status --porcelain)"
```

### T. Re-run the published post-push suite

Run all harnesses again from the clean pushed checkout. The final published result must include the exact total, pass count, commit, remote alignment, immutable origin/main, browser evidence, and rollback evidence. If any gate fails, remain in remediation; do not report completion.

### U. Update this handoff immediately

The handoff update is part of the feature completion, not an optional later task. Add a dated checkpoint with what changed, why, exact owner/module, proof results, exclusions, commit/push refs, current inventory, and next action. Also update the “Future agent continuation log” below.

## 8. Standard validation commands

| Purpose | Command |
|---|---|
| Branch/worktree | `git branch --show-current && git status --short` |
| Immutable refs | `git rev-parse origin/main && git rev-parse origin/Branch2` |
| HTML owner search | `grep -n -E 'function <name>|window\.<name>|src/features/<module>' index.html` |
| Module syntax | `node --check src/features/<module>.js` |
| Harness syntax | `for f in docs/*harness.js; do node --check "$f" || exit 1; done` |
| Independent proof | `node docs/<owner>-independent-proof-contract-harness.js` |
| Production proof | `node docs/<owner>-production-split-contract-harness.js` |
| Rollback proof | `node /tmp/run_<owner>_rollback.js` or the committed owner-specific rollback harness |
| Full regression | `for f in docs/*harness.js; do node "$f" || exit 1; done` |
| Diff safety | `git diff --check && git diff --stat` |
| Remote safety | `git fetch origin Branch2 main` plus the alignment tests in section 7 |

## 9. Evidence and contract naming convention

Use stable, searchable names:

```text
docs/<owner>-dependency-map.md
docs/<owner>-independent-authorization-addendum.md
docs/<owner>-independent-proof-contract.md
docs/<owner>-independent-proof-contract-harness.js
docs/<owner>-production-authorization-addendum.md
docs/<owner>-production-split-contract.md
docs/<owner>-production-split-contract-harness.js
docs/<owner>-parity-rollback-evidence.txt
docs/<owner>-after-split-browser-proof-evidence.txt
src/features/<owner-module>.js
```

The exact owner name should be stable across all files. Do not create near-duplicate filenames or silently replace an existing dossier. If a historical name differs, record the mapping in `MIGRATION_MAP.md` and this handoff.

## 10. What a future AI agent must do first

1. Read this entire file, `MIGRATION_MAP.md`, and `docs/high-risk-seam-readiness-matrix-contract.md`.
2. Check `git branch --show-current`, `git status --short`, `git rev-parse HEAD`, `git rev-parse origin/Branch2`, and `git rev-parse origin/main`.
3. Locate the candidate’s dependency map, authorization addendum, proof contract, and evidence files.
4. Decide whether the candidate is **blocked preparation-only**, **explicitly production-authorized**, or **complete**.
5. Do not infer approval from prior work on another feature.
6. If blocked, perform only independent mapping/proof/documentation.
7. If authorized, follow the full A-to-Z sequence and stop on the first failed gate.
8. Update this file before final reporting and include exact commit/push/regression results.

## 11. Mandatory handoff update protocol for every future change

Every future agent must append a dated entry to the **Future agent continuation log** after each meaningful checkpoint. At minimum, update it after candidate selection, dependency-map completion, before-proof, authorization, extraction, post-split proof, rollback, browser observation, regression, commit, and push.

Each entry must include:

| Field | Required content |
|---|---|
| Date/time | UTC or clearly identified timezone. |
| Agent/task | Agent identity and feature/task name. |
| Branch/HEAD | Branch name and commit before/after the checkpoint. |
| Scope | Exact owner/files touched; explicitly state exclusions. |
| Result | PASS, BLOCKED, or FAIL with the first failing assertion if applicable. |
| Evidence | Exact contract, harness, rollback, browser, or ledger path. |
| Side effects | State whether live actions were zero. |
| Next action | One concrete continuation step and its authorization requirement. |

Do not rewrite history in a way that removes prior checkpoint meaning. Correct factual errors with a dated correction entry. If another agent changes the project, it must update this file in the same commit or in the immediately following documentation commit before claiming completion.

## 12. Future agent continuation log

### 2026-09-02 — Notes submission owner completion and handoff creation

- **Agent/task:** Manus AI; bounded `submitNote()` extraction followed by canonical handoff creation.
- **Branch/HEAD:** `Branch2`; published Notes/browser checkpoint `ceba76f`; immutable `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.
- **Scope:** Extracted only `submitNote()` to `src/features/notes-submission-owner.js`; no live Note/database/storage/upload/media/permission/service-worker/Push/network/account action.
- **Result:** Exact parity PASS, synthetic production proof PASS, disposable rollback PASS, observation-only browser proof PASS, full regression `319/319 PASS`.
- **Evidence:** Notes submission production authorization, production contract/harness, parity/rollback evidence, browser evidence, `MIGRATION_MAP.md`, and readiness matrix.
- **Next action:** Review this handoff before starting another candidate. For any new production split, obtain that owner’s exact authorization and follow sections 7 and 11.

### 2026-09-02 — Handoff publication verification

- **Agent/task:** Manus AI; canonical handoff publication and continuation-contract verification.
- **Branch/HEAD:** `Branch2`; handoff commit `59e099d` published to `origin/Branch2`; local/remote alignment PASS; immutable `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.
- **Scope:** Added root `HANDOFF.md` and updated only the Branch2 safety allowlist to permit the canonical handoff checkpoint.
- **Authorization state:** Documentation/process update only; no new feature extraction authorized or performed.
- **Result:** Syntax checks PASS; final published regression `319/319 PASS`; worktree clean; Branch2-only and immutable-origin checks PASS.
- **Evidence:** `HANDOFF.md`, `docs/branch2-only-safety-contract-harness.js`, and `/tmp/handoff-regression.log` from the closing run.
- **Side effects:** Zero live application, database, storage, upload, permission, Push, service-worker, network, account, or authentication actions.
- **Next action:** Read this handoff before selecting the next candidate; maintain the mandatory update protocol in section 11.

### 2026-09-02 — Push subscription owner independent preparation

- **Agent/task:** Manus AI; next-candidate selection and preparation for bounded `subscribeToPushNotifications()` owner.
- **Branch/HEAD:** `Branch2`; current clean checkpoint before preparation commit; immutable `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.
- **Scope:** Created `docs/push-subscription-owner-dependency-map.md` only; no `index.html` extraction, module creation, caller rewrite, schema change, or live Push action.
- **Authorization state:** Independent proof only. Production extraction remains explicitly blocked; a separate production authorization addendum and exact owner approval are required.
- **Result:** Independent before-proof PASS. Exact owner parity SHA-256 `b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4`; unsupported, missing-user, existing/new subscription, VAPID/options, payload/conflict policy, subscribe/database/get-subscription failures, and device-info truncation all PASS.
- **Evidence:** `docs/push-subscription-owner-dependency-map.md`, `docs/push-subscription-owner-independent-authorization-addendum.md`, `docs/push-subscription-owner-independent-proof-contract.md`, `docs/push-subscription-owner-independent-proof-contract-harness.js`, and `docs/push-subscription-owner-independent-proof-rollback-evidence.txt`.
- **Side effects:** Live permission requests, service-worker access, PushManager access, database writes, storage writes, network side effects, account mutations, and production changes remained zero; database behavior was mock-only.
- **Next action:** Commit and push the preparation map with synchronized handoff/inventory contracts. Do not extract this owner until explicit production authorization is received.

### 2026-09-02 — Push subscription preparation publication verification

- **Agent/task:** Manus AI; published preparation-only checkpoint for `subscribeToPushNotifications()`.
- **Branch/HEAD:** `Branch2`; final preparation commit `a24cad2` pushed to `origin/Branch2`; clean worktree and local/remote alignment PASS; immutable `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`.
- **Scope:** Dependency map and readiness inventory synchronization only; no production module, `index.html` extraction, caller rewrite, schema change, or live Push/service-worker/database/account action.
- **Authorization state:** `INDEPENDENT_PROOF_ONLY`; production extraction remains `BLOCKED` and requires a new exact-scope production authorization addendum plus explicit approval.
- **Result:** Independent before-proof PASS; final published regression `319/319 PASS`; syntax, Branch2-only, clean-worktree, remote-alignment, and immutable-origin checks PASS.
- **Evidence:** `docs/push-subscription-owner-dependency-map.md`, existing Push subscription independent authorization/proof/rollback files, `docs/branch2-final-readiness-contract-harness.js`, and `MIGRATION_MAP.md`.
- **Side effects:** Zero live permission, service-worker, PushManager, database, storage, network, account, authentication, or browser actions; persistence was mock-only.
- **Next action:** Review/approve a separate Push subscription production authorization addendum before any source extraction. Until then, keep `subscribeToPushNotifications()` inline and continue respecting the exclusions in the dependency map.

### Template for the next agent

```text
### YYYY-MM-DD — <feature/task> checkpoint

- **Agent/task:**
- **Branch/HEAD:**
- **Scope:**
- **Authorization state:**
- **Result:**
- **Evidence:**
- **Side effects:**
- **Next action:**
```

## 13. Authoritative local references

The following files are the source of truth for specific decisions:

| File | Authority |
|---|---|
| `HANDOFF.md` | Cross-agent continuation protocol and current operational summary. |
| `MIGRATION_MAP.md` | Chronological migration ledger and historical evidence. |
| `docs/high-risk-seam-readiness-matrix-contract.md` | Protected-system readiness, completed/blocked classification, and inventory contract. |
| `docs/branch2-final-readiness-contract-harness.js` | Published Branch2 readiness and inventory assertions. |
| `docs/branch2-only-safety-contract-harness.js` | Branch restriction, immutable origin, clean-worktree, and allowed-checkpoint safety assertions. |
| `docs/<owner>-dependency-map.md` | Exact dependency and boundary map for one owner. |
| `docs/<owner>-independent-authorization-addendum.md` | Preparation-only authorization and independent proof scope. |
| `docs/<owner>-production-authorization-addendum.md` | Exact owner-specific production authorization and exclusions. |
| `docs/<owner>-production-split-contract.md` and harness | Post-split behavior, ownership, and gate contract. |
| `docs/<owner>-parity-rollback-evidence.txt` | Disposable rollback and parity evidence. |
| `docs/<owner>-after-split-browser-proof-evidence.txt` | Observation-only deployment evidence. |

This handoff is an internal project record. It intentionally contains no credentials, tokens, secrets, or live account data.
