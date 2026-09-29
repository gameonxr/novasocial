// Saved-account authentication switch helper.
async function switchToAccount(userId){
  const accounts = getSavedAccounts();
  const target = accounts.find(a => a.userId === userId);
  if(!target){ toast('Account nahi mila'); return; }

  toast('Switching account...');
  try{
    const{data,error} = await db.auth.setSession({
      access_token: target.access_token,
      refresh_token: target.refresh_token
    });
    if(error) throw error;
    closeModal();
    // Poori app reload karo taaki naya account ka data fresh load ho
    setTimeout(()=>{ window.location.reload(); }, 300);
  }catch(e){
    toast('Switch fail hua, dobara login karna padega');
    removeAccountSession(userId);
  }
}
