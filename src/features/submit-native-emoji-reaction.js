// submitNativeEmojiReaction — extracted from index.html
// Owner SHA-256: f3960e24dfdb390ecbb7dc71602261cc849a0a445fd104f5818d664bd348dd38
// Classic script — exposes window.submitNativeEmojiReaction

window.submitNativeEmojiReaction = function submitNativeEmojiReaction(noteId){
  const inp = document.getElementById('native-emoji-inp');
  const emoji = inp?.value?.trim();
  if(!emoji){ toast('Ek emoji type karo'); return; }
  document.getElementById('more-emoji-panel')?.remove();
  reactToNote(noteId, emoji, null);
};
