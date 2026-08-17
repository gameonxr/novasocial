// Inline mention insertion UI helper.
function insertMention(username, inpId) {
  const inp = document.getElementById(inpId);
  let words = inp.value.split(' ');
  words[words.length - 1] = '@' + username + ' ';
  inp.value = words.join(' ');
  document.getElementById('mention-list')?.remove();
  inp.focus();
}
