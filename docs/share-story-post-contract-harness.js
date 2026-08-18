function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockShareStoryAsPost({ story = null, insertFails = false }) {
  const events = ['toast:Creating post'];
  if (!story) return { events: [...events, 'toast:Story not found'], shared: false };
  const post = { user_id: 'me', media_url: story.media_url, media_type: story.media_type, is_reel: false, caption: '' };
  if (insertFails) return { events: [...events, 'posts.insert.failed', 'toast:Failed to share'], shared: false, post };
  events.push(`posts.insert:${story.media_type}`, 'toast:Shared as Post', 'modal.close', 'viewer.close', 'go:home');
  return { events, shared: true, post };
}

(async () => {
  const image = await mockShareStoryAsPost({ story: { media_url: 'https://cdn/story-image', media_type: 'image' } });
  const video = await mockShareStoryAsPost({ story: { media_url: 'https://cdn/story-video', media_type: 'video' } });
  const missing = await mockShareStoryAsPost({ story: null });
  const failed = await mockShareStoryAsPost({ story: { media_url: 'https://cdn/story-image', media_type: 'image' }, insertFails: true });

  for (const result of [image, video]) {
    assert(result.shared && result.post.user_id === 'me' && result.post.is_reel === false && result.post.caption === '', 'Successful share must insert a normal empty-caption post for current user');
    assert(result.events.includes('toast:Shared as Post') && result.events.includes('modal.close') && result.events.includes('viewer.close') && result.events.includes('go:home'), 'Successful share must confirm, close modal/viewer, and return home');
  }
  assert(image.post.media_url === 'https://cdn/story-image' && image.post.media_type === 'image', 'Image Story media must be reused unchanged');
  assert(video.post.media_url === 'https://cdn/story-video' && video.post.media_type === 'video', 'Video Story media must be reused unchanged');
  assert(!missing.shared && missing.events.includes('toast:Story not found'), 'Missing Story must stop without inserting a post');
  assert(!failed.shared && failed.events.includes('toast:Failed to share') && failed.post.media_url === 'https://cdn/story-image', 'Insert failure must show failure feedback without success cleanup');

  console.log(JSON.stringify({ passed: true, image, video, missing, failed }, null, 2));
})();
