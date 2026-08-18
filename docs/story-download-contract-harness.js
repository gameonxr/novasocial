function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockDownloadStory({ story = null, fetchFails = false }) {
  const events = ['modal.close', 'toast:Downloading'];
  if (!story) {
    events.push('toast:Story not found');
    return { events, downloaded: false };
  }
  if (fetchFails) {
    events.push('fetch.failed', 'toast:Download failed');
    return { events, downloaded: false };
  }
  const filename = `novasocial_story.${story.media_type === 'video' ? 'mp4' : 'jpg'}`;
  events.push(`fetch:${story.media_url}`, 'blob.read', `object-url.create:${filename}`, 'link.append', `link.click:${filename}`, 'link.remove', 'object-url.revoke', 'toast:Downloaded');
  return { events, downloaded: true, filename };
}

(async () => {
  const video = await mockDownloadStory({ story: { media_url: 'https://cdn/story-video', media_type: 'video' } });
  const image = await mockDownloadStory({ story: { media_url: 'https://cdn/story-image', media_type: 'image' } });
  const missing = await mockDownloadStory({ story: null });
  const failed = await mockDownloadStory({ story: { media_url: 'https://cdn/story-video', media_type: 'video' }, fetchFails: true });

  assert(video.downloaded && video.filename === 'novasocial_story.mp4' && video.events.includes('object-url.revoke'), 'Video Story must download as mp4 and revoke object URL');
  assert(image.downloaded && image.filename === 'novasocial_story.jpg' && image.events.includes('link.click:novasocial_story.jpg'), 'Image Story must download as jpg');
  assert(!missing.downloaded && missing.events.includes('toast:Story not found'), 'Missing Story must stop with not-found feedback');
  assert(!failed.downloaded && failed.events.includes('toast:Download failed'), 'Fetch/blob failure must show download failure feedback');
  assert(video.events[0] === 'modal.close' && video.events[1] === 'toast:Downloading', 'Download must close action modal and show progress feedback first');

  console.log(JSON.stringify({ passed: true, video, image, missing, failed }, null, 2));
})();
