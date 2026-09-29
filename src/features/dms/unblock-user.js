// unblockUser — extracted from index.html
// Owner SHA-256: 741b87e28ceed27a8856f403bbe7cfbb7f00dbc60445e461e726cbce340fa4b9
// Classic script — exposes window.unblockUser

window.unblockUser = async function unblockUser(userId, btn) {
  try {
    // Part 12 pattern: .throwOnError() — see blockUser() comment above
    await db.from('blocks').delete().eq('blocker_id', ME.id).eq('blocked_id', userId).throwOnError();
  } catch(e) {
    console.error('Unblock failed:', e);
    toast('Could not unblock user — please try again 😕');
    return; // don't update button state if the delete actually failed
  }
  toast('User unblocked ✅');
  if(btn) {
    btn.textContent = 'Block';
    btn.setAttribute('onclick', `blockUser('${userId}', this)`);
  }
};
