// reactToStory — extracted from index.html
// Owner SHA-256: cfdfd31911e2e682cf85d5d4b6076f7e09b3832ac2fe0bea23b29bab82207320
// Classic script — exposes window.reactToStory

window.reactToStory = async function reactToStory(uid, emoji, storyId) {
  await sendStoryReply(uid, emoji, storyId);
  try { await sendNotif(uid, 'story_reaction', {message: emoji+' reacted to your story', story_id: storyId}); } catch(e) {}
  toast('Reaction sent! ' + emoji);
};
