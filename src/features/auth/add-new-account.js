// New-account login transition helper.
function addNewAccount(){
  const accounts = getSavedAccounts();
  if(accounts.length >= MAX_ACCOUNTS){
    toast(`Max ${MAX_ACCOUNTS} accounts allowed`);
    return;
  }
  // Current session ko background mein rakho, sirf UI ko logout-jaisa dikhao
  // taaki naya login ho sake bina purane account ka session delete kiye
  window._addingNewAccount = true;
  // The Supabase client has one active session. Clear the in-memory identity
  // so the next auth event runs the normal new-account bootstrap path.
  ME = null;
  PROF = null;
  resetAccountScopedUiState(null);
  document.getElementById('root').style.display='none';
  document.getElementById('auth').style.display='flex';
  setMode('login');
  toast('Naya account login karo');
}
