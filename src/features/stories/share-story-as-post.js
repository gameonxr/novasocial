// shareStoryAsPost — extracted from index.html
// Owner SHA-256: 96a4f2c96dcbf38d0baae4d2a8ee0a60c3620b366f881f62e9d4f57c4aaf659f
// Classic script — exposes window.shareStoryAsPost

window.shareStoryAsPost = async function shareStoryAsPost(storyId) {
  try {
    toast('Creating post...');
    const { data: story } = await db.from('stories').select('media_url, media_type').eq('id', storyId).single();
    if(!story) return toast('Story not found');

    await db.from('posts').insert({
      user_id: ME.id,
      media_url: story.media_url,
      media_type: story.media_type,
      is_reel: false,
      caption: ''
    });

    toast('Shared as Post! 🎉');
    closeModal();
    closeSV();
    go('home');
  } catch(e) { toast('Failed to share'); }
};
