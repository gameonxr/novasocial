// unmuteUser — extracted from index.html
// Owner SHA-256: 12f80372b94e820443b6adfd99fbb030c13decde7542a88133c397eaf6ee1e1b
// Classic script — exposes window.unmuteUser

window.unmuteUser = async function unmuteUser(userId, btn) {
  try {
    // Part 12 pattern: .throwOnError() — see muteUser() comment above
    await db.from('mutes').delete().eq('muter_id', ME.id).eq('muted_id', userId).throwOnError();
  } catch(e) {
    console.error('Unmute failed:', e);
    toast('Could not unmute user — please try again 😕');
    return; // don't update button state if the delete actually failed
  }
  toast('User unmuted 🔊');
  if(btn) { btn.textContent = 'Mute User 🔇'; btn.setAttribute('onclick', `muteUser('${userId}', this)`); }
};
