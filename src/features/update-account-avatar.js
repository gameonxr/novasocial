// Isolated account-session avatar updater.
function updateAccountAvatar(userId, avatarUrl){
  let accounts = getSavedAccounts();
  const acc = accounts.find(a => a.userId === userId);
  if(acc){ acc.avatarUrl = avatarUrl; localStorage.setItem('nova_accounts', JSON.stringify(accounts)); }
}
