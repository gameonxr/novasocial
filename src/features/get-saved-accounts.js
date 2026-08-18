// Pure saved-account local-storage reader.
function getSavedAccounts(){
  try{ return JSON.parse(localStorage.getItem('nova_accounts')||'[]'); }
  catch(e){ return []; }
}
