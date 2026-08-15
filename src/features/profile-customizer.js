/**
 * NovaSocial Profile Customizer feature.
 *
 * Extracted as a classic script so theme and Verified Plus actions remain
 * window-global; full-profile/block enforcement remains in its original code.
 */
// PROFILE CUSTOMIZER (Gradient themes for profile)
// ═══════════════════════════════════════════════════════════════════════
const PROFILE_THEMES = [
  {name:'Default', grad:'linear-gradient(135deg,#833AB4,#E1306C,#F77737)'},
  {name:'Cyber', grad:'linear-gradient(135deg,#ff00ff,#00ffff)'},
  {name:'Sunset', grad:'linear-gradient(135deg,#ff6b35,#f7931e,#ffcc00)'},
  {name:'Ocean', grad:'linear-gradient(135deg,#0095f6,#00d4ff)'},
  {name:'Aurora', grad:'linear-gradient(135deg,#00ff88,#00ddff)'},
  {name:'Royal', grad:'linear-gradient(135deg,#a855f7,#6366f1)'},
  {name:'Fire', grad:'linear-gradient(135deg,#ff3030,#ffaa00)'},
  {name:'Mono', grad:'linear-gradient(135deg,#fff,#888)'},
];

function showProfileCustomizer(){
  const m = modal('🎨 Customize Profile');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="font-size:13px;color:#888;margin-bottom:12px;font-weight:600">Choose your profile gradient theme:</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
        ${PROFILE_THEMES.map((t,i)=>`
          <div onclick="setProfileTheme(${i})" style="cursor:pointer;border-radius:14px;overflow:hidden;border:1px solid #222;background:#0f0f0f">
            <div style="height:60px;background:${t.grad}"></div>
            <div style="padding:10px;font-size:12px;font-weight:600;color:#ccc;text-align:center">${t.name}</div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid #1a1a1a">
        <div style="font-size:13px;color:#888;margin-bottom:10px;font-weight:600">Verified Plus Badge (Premium):</div>
        <button class="bgrd" onclick="claimVerifiedPlus()" style="width:100%;padding:12px">💎 Get Verified Plus</button>
        <div style="font-size:11px;color:#666;margin-top:8px;text-align:center">Golden badge on your profile • Priority support • Exclusive features</div>
      </div>
    </div>
  `;
}

async function setProfileTheme(idx){
  const theme = PROFILE_THEMES[idx];
  if(!theme) return;
  try {
    await db.from('profiles').update({profile_theme: idx}).eq('id', ME.id);
    PROF.profile_theme = idx;
    toast(theme.name + ' theme applied! 🎨');
    closeModal();
    renderProfile();
  } catch(e) {
    toast('Error: ' + e.message);
  }
}

async function claimVerifiedPlus(){
  toast('💎 Verified Plus activation started...');
  // Simulate activation
  try {
    await db.from('profiles').update({is_verified_plus: true}).eq('id', ME.id);
    PROF.is_verified_plus = true;
    toast('💎 You are now Verified Plus!');
    closeModal();
    renderProfile();
  } catch(e) {
    toast('Error activating. Try again later.');
  }
}

// ═══════════════════════════════════════════════════════════════════════
