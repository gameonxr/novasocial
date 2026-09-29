// Saved-account removal helper.
function removeAccountFromSwitcher(userId){
  if(userId === ME?.id){ toast('Current account remove nahi kar sakte, pehle switch karo'); return; }
  removeAccountSession(userId);
  showAccountSwitcher(); // refresh list
}
