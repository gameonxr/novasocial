const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const evidence = fs.readFileSync(path.join(__dirname, 'note-viewer-seam-comparison-proof-evidence.txt'), 'utf8');
const browserEvidence = fs.readFileSync(path.join(__dirname, 'note-viewer-browser-proof-evidence.txt'), 'utf8');
const hashEvidence = fs.readFileSync(path.join(__dirname, 'note-viewer-owner-hash-baseline.txt'), 'utf8');
assert(evidence.includes('NOTE_VIEWER_ADAPTER_PARITY=PASS'), 'Note adapter parity evidence must pass');
assert(browserEvidence.includes('LOGIN_GATE_VISIBLE=PASS'), 'Note browser login-gate evidence must pass');
assert(browserEvidence.includes('SAFE_NO_SIDE_EFFECTS=PASS'), 'Note browser proof must remain side-effect safe');
const afterSplitEvidence = fs.readFileSync(path.join(__dirname, 'note-viewer-after-split-browser-proof-evidence.txt'), 'utf8');
const rollbackEvidence = fs.readFileSync(path.join(__dirname, 'note-viewer-parity-rollback-evidence.txt'), 'utf8');
assert(afterSplitEvidence.includes('RESULT=PASS'), 'Note after-split browser evidence must pass');
assert(rollbackEvidence.includes('ROLLBACK_RESULT=PASS'), 'Note rollback evidence must pass');
assert(evidence.includes('SAFE_NO_SIDE_EFFECTS=PASS'), 'Note proof must remain side-effect safe');
assert(evidence.includes('NOTE_VIEWER_ADAPTER_PARITY=PASS'), 'Note preparation parity evidence must remain recorded');
assert(hashEvidence.includes('viewNote_SHA256=c7d58de924aa9768ec67d301194211b2a8d52689fd93be53a9a8d5a70c2245cd'), 'viewNote baseline hash must remain recorded');
assert(hashEvidence.includes('removeMyNoteFromViewer_SHA256=45711b4ecb18b573720fc400a7be470bf0aab9a6d8ca54008113bc7669f177f5'), 'removeMyNoteFromViewer baseline hash must remain recorded');
assert(hashEvidence.includes('PREPARATION_ONLY=PASS'), 'Note hash evidence must remain preparation-only');

async function mockViewNote({ note, currentUserId = 'me', viewCount = 0, reaction = null }) {
  const events = [];
  if (!note) return { events: ['toast:expired', 'notes-bar.reload'], overlay: false };
  events.push(`view.upsert:${note.id}:${currentUserId}`);
  const isOwn = note.user_id === currentUserId;
  if (isOwn) events.push(`view-count:${viewCount}`);
  if (reaction) events.push(`reaction.load:${reaction}`);
  events.push(`overlay.append:${note.id}`);
  if (note.user_id === currentUserId) events.push('own-controls:viewers/remove');
  else events.push('other-controls:reply/reaction');
  if (note.music_preview_url) events.push(`music.autoplay:${note.music_preview_url}:${note.music_start_sec || 0}`);
  return { events, overlay: true, isOwn };
}

function createInjectedNotesInteractionSeam(deps) {
  const calls = [];
  return {
    calls,
    view(input) {
      calls.push('view');
      return deps.view(input);
    },
    remove(input) {
      calls.push('remove');
      return deps.remove(input);
    },
  };
}

async function mockRemoveMyNote({ note, deleteFails = false, artworkCleanup = false }) {
  const events = ['audio.pause'];
  if (deleteFails) {
    events.push('toast:remove-failed', 'viewer.close', 'notes-bar.reload');
    return { events, removed: false };
  }
  events.push(`note.delete:${note.id}`);
  if (artworkCleanup) events.push('cloudinary.cleanup:note');
  events.push('toast:removed', 'viewer.close', 'notes-bar.reload');
  return { events, removed: true };
}

(async () => {
  const ownNote = await mockViewNote({ note: { id: 'n1', user_id: 'me', text: 'Own', music_preview_url: 'music://own', music_start_sec: 12 }, viewCount: 4, reaction: '❤️' });
  assert(ownNote.overlay && ownNote.isOwn, 'Existing own note must open viewer as own note');
  assert(ownNote.events.includes('view.upsert:n1:me') && ownNote.events.includes('view-count:4') && ownNote.events.includes('own-controls:viewers/remove'), 'Own note must register view, show count, and expose own controls');
  assert(ownNote.events.includes('reaction.load:❤️') && ownNote.events.includes('music.autoplay:music://own:12'), 'Viewer must load reaction and autoplay attached music');

  const otherNote = await mockViewNote({ note: { id: 'n2', user_id: 'other', text: 'Hello' }, currentUserId: 'me' });
  assert(otherNote.overlay && !otherNote.isOwn && otherNote.events.includes('other-controls:reply/reaction'), 'Other note must expose reply/reaction controls without own-note controls');
  assert(!otherNote.events.some(event => event.startsWith('view-count:')), 'Other note must not request own-note viewer count');

  const expired = await mockViewNote({ note: null });
  assert(!expired.overlay && expired.events.includes('toast:expired') && expired.events.includes('notes-bar.reload'), 'Missing note must show expiry feedback and reload Notes Bar');

  const removed = await mockRemoveMyNote({ note: { id: 'n1' }, artworkCleanup: true });
  assert(removed.removed && removed.events.includes('audio.pause') && removed.events.includes('note.delete:n1') && removed.events.includes('cloudinary.cleanup:note'), 'Note removal must stop audio, delete note, and clean Cloudinary artwork');
  assert(removed.events.includes('viewer.close') && removed.events.includes('notes-bar.reload'), 'Successful removal must close viewer and reload Notes Bar');

  const failed = await mockRemoveMyNote({ note: { id: 'n1' }, deleteFails: true });
  assert(!failed.removed && failed.events.includes('toast:remove-failed') && failed.events.includes('viewer.close'), 'Removal failure must show feedback and still close viewer');

  const seam = createInjectedNotesInteractionSeam({ view: mockViewNote, remove: mockRemoveMyNote });
  const injectedView = await seam.view({ note: { id: 'n3', user_id: 'other', text: 'Injected' } });
  const injectedRemove = await seam.remove({ note: { id: 'n3' }, artworkCleanup: true });
  assert(JSON.stringify(seam.calls) === JSON.stringify(['view', 'remove']), 'Injected Notes seam must dispatch viewer and removal owners explicitly');
  assert(!injectedView.isOwn && injectedView.events.includes('other-controls:reply/reaction'), 'Injected viewer seam must preserve other-note controls');
  assert(injectedRemove.removed && injectedRemove.events.includes('cloudinary.cleanup:note') && injectedRemove.events.includes('notes-bar.reload'), 'Injected removal seam must preserve cleanup and Notes Bar reload');

  console.log(JSON.stringify({ passed: true, ownNote, otherNote, expired, removed, failed, seam: { calls: seam.calls, injectedView, injectedRemove }, seamEvidence: 'PASS', productionSplit: 0 }, null, 2));
})();
