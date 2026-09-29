// signOutBanned — extracted from index.html
// Owner SHA-256: da16f3bb3643cc816d749dd920ccd30006eb15f50f8d8e0a0de0b4f3994679aa
// Classic script — exposes window.signOutBanned

window.signOutBanned = async function signOutBanned(){
  try { await db.auth.signOut(); } catch(e) {}
  ME = null; PROF = null;
  document.getElementById('ban-screen')?.remove();
  document.getElementById('root').style.display = 'none';
  document.getElementById('auth').style.display = 'flex';
};
