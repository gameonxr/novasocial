// startBanRecheck — extracted from index.html
// Owner SHA-256: 9a9f3529424b7b02af8e34dfa106252209f619ba77a6b9ed476a282ec6d4db73
// Classic script — exposes window.startBanRecheck

window.startBanRecheck = function startBanRecheck(){
  if(_banRecheckTimer) clearInterval(_banRecheckTimer);
  _banRecheckTimer = setInterval(async () => {
    if(!ME || !db) return;
    try {
      const { data, error } = await db.from('profiles').select('is_banned, ban_reason').eq('id', ME.id).single();
      if(error) return;
      if(data?.is_banned === true){
        const reason = data.ban_reason || 'Violation of community guidelines';
        showBanScreen(reason, ME.id);
        try { await db.auth.signOut(); } catch(e) {}
        ME = null; PROF = null;
        document.getElementById('root').style.display = 'none';
        document.getElementById('auth').style.display = 'flex';
        clearInterval(_banRecheckTimer);
      }
    } catch(e) {}
  }, 5 * 60 * 1000);
};
