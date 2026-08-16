// Isolated group invite-link clipboard helper extracted from index.html.
function copyInviteLink(link) {
  try {
    navigator.clipboard.writeText(link);
    toast('Invite link copied! 📋');
  } catch(e) { toast('Could not copy'); }
}
