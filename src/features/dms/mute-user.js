// muteUser — extracted from index.html
// Owner SHA-256: dc34fa3ec0c8228d10c984b59eee72783f90da4c5523be8edd575ebe5a350c5f
// Classic script — exposes window.muteUser

window.muteUser = async function muteUser(userId, btn) {
  try {
    // Part 12 pattern: .throwOnError() — without this, a silent DB failure would still
    // show the "User muted 🔇" success toast and flip the button (misleading UX)
    await db.from('mutes').insert({ muter_id: ME.id, muted_id: userId }).throwOnError();
  } catch(e) {
    console.error('Mute failed:', e);
    toast('Could not mute user — please try again 😕');
    return; // don't update button state if the insert actually failed
  }
  toast('User muted 🔇');
  if(btn) { btn.textContent = 'Unmute User 🔊'; btn.setAttribute('onclick', `unmuteUser('${userId}', this)`); }
};
