// saveAccountSession — extracted from index.html
// Owner SHA-256: 54faee4a63d305c1c8a61cccc0dfff1157aad817c5e4640009d6663f717921af
// Classic script — exposes window.saveAccountSession
// Includes module-local MAX_ACCOUNTS const (was inline, only used by this function)

const MAX_ACCOUNTS = 5;

window.saveAccountSession = function saveAccountSession(userId, username, avatarUrl, session){
  let accounts = getSavedAccounts();
  accounts = accounts.filter(a => a.userId !== userId); // duplicate hatao
  accounts.unshift({
    userId, username, avatarUrl,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    savedAt: Date.now()
  });
  if(accounts.length > MAX_ACCOUNTS) accounts = accounts.slice(0, MAX_ACCOUNTS);
  localStorage.setItem('nova_accounts', JSON.stringify(accounts));
};


window.removeAccountSession = function removeAccountSession(userId){
  let accounts = getSavedAccounts().filter(a => a.userId !== userId);
  localStorage.setItem('nova_accounts', JSON.stringify(accounts));
};
