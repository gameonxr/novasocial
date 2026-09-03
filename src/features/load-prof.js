// loadProf — extracted from index.html
// Owner SHA-256: 7902cf29130c2f9f591f65deef16e99f5ade93870b263c5b3053d17d25949e20
// Classic script — exposes window.loadProf

window.loadProf = async function loadProf(){
  const {data}=await db.from('profiles').select('*').eq('id',ME.id).single();
  PROF=data||{};

  // 🛡️ BAN CHECK — if user is banned, show suspended screen with appeal option
  // DON'T sign out yet — let them submit an appeal first
  if(PROF.is_banned === true){
    const reason = PROF.ban_reason || 'Violation of community guidelines';
    const bannedUserId = ME.id;
    const bannedUserEmail = ME.email;
    // Show ban screen — user is still signed in, can submit appeal
    showBanScreen(reason, bannedUserId);
    // Don't auto-sign-out. User can appeal. They'll be signed out after appeal submit
    // or if they click OK without appealing
    return;
  }

  updateLastSeen();
  const el=document.getElementById('nav-av');
  if(el){
    const fallbackLetter = (PROF.username||ME.email||'?')[0].toUpperCase();
    if(PROF.avatar_url){
      el.innerHTML=`<img src="${PROF.avatar_url}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.textContent='${fallbackLetter}'">`;
    } else {
      el.textContent = fallbackLetter;
    }
    el.style.borderColor='#fff';
  }
  checkUnreadNotifs();
};
