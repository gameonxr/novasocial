// Story Mention selection and editor-element helper.
function seSelectMentionUser(userId, username){
  storyEditorElements.push({
    id: 'el_' + Date.now(),
    type: 'mention',
    text: '@' + username,
    userId: userId,
    username: username,
    x: 50, y: 40, scale: 1, rotate: 0,
    fontSize: 18,
    color: '#00E5FF',
    fontWeight: 700,
    fontFamily: '-apple-system, sans-serif',
    bg: 'rgba(0,229,255,0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
  });
  renderStoryElements();
  closeSeAddon();
  toast('Mentioned @' + username);
}
