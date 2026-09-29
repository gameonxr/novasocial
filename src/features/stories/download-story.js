// downloadStory — extracted from index.html
// Owner SHA-256: c6c96968f472488829615e4f35478ef4f0ac15958b90821b18d6800c4e0be9bc
// Classic script — exposes window.downloadStory

window.downloadStory = async function downloadStory(storyId) {
  try {
    closeModal();
    toast('Downloading...');
    const { data: story } = await db.from('stories').select('media_url, media_type').eq('id', storyId).single();
    if(!story) return toast('Story not found');

    const response = await fetch(story.media_url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'novasocial_story.' + (story.media_type === 'video' ? 'mp4' : 'jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast('Downloaded! 📥');
  } catch(e) { toast('Download failed'); }
};
