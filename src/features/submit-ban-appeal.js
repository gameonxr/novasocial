// submitBanAppeal — extracted from index.html
// Owner SHA-256: e5c38e2613ad698896e181c246c2ac088e9e27f6bec386fea4fbd409f3441032
// Classic script — exposes window.submitBanAppeal

window.submitBanAppeal = async function submitBanAppeal(userId){
  const reason = document.getElementById('appeal-reason')?.value.trim();
  if(!reason){ toast('Please provide a reason'); return; }
  if(!userId){ toast('Could not identify your account.'); return; }
  try {
    const { error } = await db.from('ban_appeals').insert({ user_id: userId, appeal_reason: reason, status: 'pending' });
    if(error) throw error;
    toast('✅ Appeal submitted. Admin will review.');
    closeModal();
    // Now sign out the banned user
    setTimeout(async () => {
      try { await db.auth.signOut(); } catch(e) {}
      ME = null; PROF = null;
      const banScreen = document.getElementById('ban-screen');
      if(banScreen) banScreen.remove();
      document.getElementById('root').style.display = 'none';
      document.getElementById('auth').style.display = 'flex';
    }, 1500);
  } catch(e) {
    console.error('Appeal submit failed:', e);
    if(e.message && e.message.includes('does not exist')) toast('⚠️ Appeals table not set up. Run the SQL first.');
    else if(e.message && (e.message.includes('duplicate') || e.message.includes('unique'))) toast('⚠️ You already have a pending appeal');
    else if(e.message && e.message.includes('row-level security')) toast('⚠️ RLS policy blocking. Run nova_fix_appeals_rls.sql');
    else toast('❌ Appeal failed: ' + (e.message || 'error'));
  }
};
