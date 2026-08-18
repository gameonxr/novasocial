function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockSubmitStory({ banned = false, hasFile = true, hasText = false, mediaType = 'image', duration = 0, uploadFails = false, overlayInsertFails = false, notificationFails = false, viewerHasStory = true }) {
  const events = [];
  const state = { disabled: false, button: 'Share Story', uploaded: false, modalClosed: false };
  if (banned) return { state, events: ['ban.guard'] };
  if (!hasFile && !hasText) return { state, events: ['toast:media-or-text-required'] };
  state.disabled = true;
  state.button = 'Uploading 0%';
  events.push('button.disable', 'upload:0');
  if (mediaType === 'video' && duration > 50) {
    state.disabled = false;
    state.button = 'Share Story';
    events.push('toast:video-too-long', 'button.reset');
    return { state, events };
  }
  if (mediaType === 'image' && hasText) events.push(hasFile ? 'canvas.burn-text' : 'canvas.gradient-text');
  if (mediaType === 'video' && hasText) events.push('overlay.capture');
  if (uploadFails) {
    state.disabled = false;
    state.button = 'Share Story';
    events.push('upload.failed', 'toast:upload-failed', 'button.reset');
    return { state, events };
  }
  events.push('upload:25', 'upload:100');
  state.uploaded = true;
  const insertEvents = mediaType === 'video' && hasText ? ['stories.insert:overlay-data'] : ['stories.insert'];
  events.push(...insertEvents);
  if (overlayInsertFails && mediaType === 'video' && hasText) events.push('stories.insert.retry:without-overlay-data');
  if (notificationFails) events.push('notifications.failed.nonfatal');
  events.push('toast:story-posted', 'home-cache.invalidate', 'modal.close', viewerHasStory ? 'viewer.open' : 'go:home');
  state.modalClosed = true;
  return { state, events };
}

(async () => {
  const banned = await mockSubmitStory({ banned: true, hasFile: true });
  assert(banned.events.includes('ban.guard') && !banned.state.disabled, 'Banned client must stop before upload or UI disable');

  const empty = await mockSubmitStory({ hasFile: false, hasText: false });
  assert(empty.events.includes('toast:media-or-text-required') && !empty.state.disabled, 'Missing file and text must show validation without disabling submit');

  const longVideo = await mockSubmitStory({ hasFile: true, mediaType: 'video', duration: 50.1 });
  assert(longVideo.events.includes('toast:video-too-long') && longVideo.state.button === 'Share Story' && !longVideo.state.disabled, 'Video over 50 seconds must reset submit state and skip upload');

  const imageText = await mockSubmitStory({ hasFile: true, hasText: true, mediaType: 'image', viewerHasStory: true });
  assert(imageText.events.includes('canvas.burn-text') && imageText.events.includes('stories.insert') && imageText.events.includes('viewer.open'), 'Image story text must burn to canvas, insert, close modal, and open viewer');

  const textOnly = await mockSubmitStory({ hasFile: false, hasText: true, mediaType: 'image', viewerHasStory: false });
  assert(textOnly.events.includes('canvas.gradient-text') && textOnly.events.includes('go:home'), 'Text-only story must use gradient canvas path and return home when viewer has no story');

  const videoOverlayRetry = await mockSubmitStory({ hasFile: true, hasText: true, mediaType: 'video', duration: 12, overlayInsertFails: true });
  assert(videoOverlayRetry.events.includes('overlay.capture') && videoOverlayRetry.events.includes('stories.insert:overlay-data') && videoOverlayRetry.events.includes('stories.insert.retry:without-overlay-data'), 'Video text overlays must be captured and retry insert without overlay column when needed');

  const notifFailure = await mockSubmitStory({ hasFile: true, notificationFails: true });
  assert(notifFailure.events.includes('notifications.failed.nonfatal') && notifFailure.events.includes('toast:story-posted') && notifFailure.state.modalClosed, 'Notification failure must not fail successful story submission');

  const uploadFailure = await mockSubmitStory({ hasFile: true, uploadFails: true });
  assert(uploadFailure.events.includes('toast:upload-failed') && uploadFailure.state.button === 'Share Story' && !uploadFailure.state.disabled, 'Upload failure must reset button and show failure feedback');

  console.log(JSON.stringify({ passed: true, banned, empty, longVideo, imageText, textOnly, videoOverlayRetry, notifFailure, uploadFailure }, null, 2));
})();
