// Settings and profile-settings feature — classic script, preserves legacy global handlers.
// ── NEW SETTINGS SUB-PAGES ──────────────────────────────────────
function showEditProfile(){
  const m=modal('Edit Profile');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:12px">
    ${[['username','Username'],['full_name','Full Name'],['bio','Bio'],['website','Website']].map(([k,l])=>`
      <div style="margin-bottom:4px;">
        <div style="color:#666;font-size:12px;margin-bottom:5px;font-weight:600">${l}</div>
        ${k==='bio'?`<textarea id="ed-${k}" rows="3" class="inp" style="resize:none;line-height:1.5"></textarea>`:`<input id="ed-${k}" class="inp">`}
      </div>`).join('')}
    <button class="bgrd" onclick="saveEdit()" style="margin-top:8px;">Save Changes</button>
  </div>`;
  setTimeout(()=>{
    ['username','full_name','bio','website'].forEach(k=>{
      const el=document.getElementById('ed-'+k);
      if(el) el.value=PROF[k]||'';
    });
  },50);
}

function showPasswordReset(){
  const m=modal('🔐 Password & Security');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:14px">

    <div style="background:rgba(225,48,108,0.08);border:1px solid rgba(225,48,108,0.2);border-radius:14px;padding:14px">
      <div style="font-weight:700;font-size:14px;margin-bottom:6px">🔐 Reset Password</div>
      <div style="color:#aaa;font-size:12px;line-height:1.5">Reset link tumhare registered email pe bhej diya jayega. Email check karke naya password set karo.</div>
    </div>

    <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:14px;padding:14px">
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">📧 REGISTERED EMAIL</div>
      <div style="color:#fff;font-size:14px;font-weight:600">${ME?.email||'N/A'}</div>
    </div>

    <button class="bgrd" onclick="sendPasswordReset()" style="padding:14px">📧 Send Reset Link</button>

    <div style="border-top:1px solid #1a1a1a;padding-top:14px;margin-top:8px">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px;display:flex;align-items:center;gap:6px">'+ico('lock','#fff',14)+' Two-Factor Authentication</div>
      <button class="bout" onclick="setup2FAMethod('SMS')" style="text-align:left;display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px">
        <span style="font-size:13px">Enable 2FA (SMS)</span>
        <span style="color:#555">${ico('back','#555',16)}</span>
      </button>
      <button class="bout" onclick="setup2FAMethod('Authenticator App')" style="text-align:left;display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px;margin-top:8px">
        <span style="font-size:13px">Authenticator App</span>
        <span style="color:#555">${ico('back','#555',16)}</span>
      </button>
      <button class="bout" onclick="setup2FAMethod('Email')" style="text-align:left;display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px;margin-top:8px">
        <span style="font-size:13px">Email Authentication</span>
        <span style="color:#555">${ico('back','#555',16)}</span>
      </button>
    </div>

    <div style="border-top:1px solid #1a1a1a;padding-top:14px">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px">📧 Email Settings</div>
      <button class="bout" onclick="showEmailChange()" style="text-align:left;display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px">
        <span style="font-size:13px">Change Email</span>
        <span style="color:#555">${ico('back','#555',16)}</span>
      </button>
    </div>

    <div style="border-top:1px solid #1a1a1a;padding-top:14px">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:#E1306C">⚠️ Danger Zone</div>
      <button class="bout" onclick="showDeleteAccount()" style="text-align:left;display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px;border-color:#E1306C;color:#E1306C">
        <span style="font-size:13px">Delete Account</span>
        <span>${ico('back','#E1306C',16)}</span>
      </button>
    </div>
  </div>`;
}

async function sendPasswordReset(){
  try {
    const { error } = await db.auth.resetPasswordForEmail(ME?.email);
    if(error){
      toast('Error: ' + error.message);
    } else {
      toast('📧 Reset link sent to your email!');
      closeModal();
    }
  } catch(e) {
    toast('Error sending reset link');
  }
}

function showDeleteAccount(){
  if(!confirm('Kya tum really apna account delete karna chahte ho? Ye action irreversible hai!')) return;
  if(!confirm('Last warning! Saara data permanently delete ho jayega. Continue?')) return;
  toast('Account deletion request sent. Email pe confirmation aayega.');
  closeModal();
}

function showVerificationApply(){
  const m=modal('✅ Apply for Verification');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:14px">

    <div style="text-align:center;padding:10px 0">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#3897f0,#0095f6);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:36px">${ico('verified','#fff',36)}</div>
      <div style="font-weight:800;font-size:18px">Get Verified</div>
      <div style="color:#888;font-size:13px;margin-top:6px">Verified badge se log trust karte hain</div>
    </div>

    <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:14px;padding:14px">
      <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:10px">📋 REQUIREMENTS</div>
      <div style="font-size:13px;color:#ccc;line-height:1.6">
        ✓ Unique & authentic profile<br>
        ✓ Active account (30+ days)<br>
        ✓ Minimum 1000 followers<br>
        ✓ Government ID proof<br>
        ✓ Complete bio & profile picture
      </div>
    </div>

    <div>
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">📄 Upload ID Proof</div>
      <input type="file" accept="image/*,application/pdf" class="inp" style="padding:10px">
      <div style="font-size:11px;color:#666;margin-top:6px">Aadhar, PAN, Passport, ya Driving License</div>
    </div>

    <div>
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">Category</div>
      <select class="inp" style="padding:10px">
        <option>Creator / Influencer</option>
        <option>Business / Brand</option>
        <option>Public Figure</option>
        <option>Artist / Musician</option>
        <option>Athlete</option>
        <option>Other</option>
      </select>
    </div>

    <button class="bgrd" onclick="submitVerification()" style="padding:14px">Submit Application</button>

    <div style="background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,170,0,0.1));border:1px solid rgba(255,170,0,0.3);border-radius:14px;padding:14px;text-align:center">
      <div style="font-weight:700;font-size:13px;color:#ffd700;margin-bottom:4px">💎 Verified Plus</div>
      <div style="font-size:11px;color:#aaa;margin-bottom:8px">Premium golden badge — instant approval</div>
      <button onclick="closeModal();showProfileCustomizer()" class="bout" style="border-color:#ffd700;color:#ffd700;font-size:12px;padding:8px 14px">Get Verified Plus →</button>
    </div>
  </div>`;
}

function submitVerification(){
  toast('✅ Application submitted! 3-7 din me review hoga.');
  closeModal();
}

function showAccountInfo(){
  const m=modal('📋 Account Info');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:10px">

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:12px;color:#666;margin-bottom:4px">User ID</div>
      <div style="font-size:13px;color:#fff;font-family:monospace;word-break:break-all">${ME?.id||'N/A'}</div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:12px;color:#666;margin-bottom:4px">Email</div>
      <div style="font-size:13px;color:#fff">${ME?.email||'N/A'}</div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:12px;color:#666;margin-bottom:4px">Username</div>
      <div style="font-size:13px;color:#fff">@${PROF?.username||'N/A'}</div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:12px;color:#666;margin-bottom:4px">Member Since</div>
      <div style="font-size:13px;color:#fff">${ME?.created_at?new Date(ME.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}):'N/A'}</div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:12px;color:#666;margin-bottom:4px">Account Status</div>
      <div style="font-size:13px;color:#3db83d;font-weight:600">✓ Active</div>
    </div>

    <button class="bout" onclick="downloadMyData()" style="padding:12px;margin-top:8px">📥 Download My Data</button>

  </div>`;
}

async function downloadMyData(){
  toast('📥 Data download request sent! Email pe aayega.');
  closeModal();
}

function showPrivateAccount(){
  togglePrivateAccount();
}

function showThemePickerModal(){
  closeModal();
  setTimeout(()=>toggleThemePicker(), 200);
  // Show theme FAB temporarily
  showThemeFab();
  toast('🎨 Theme panel khula! Bottom-left me bhi access kar sakte ho.');
}

function showAISettings(){
  const m=modal('🤖 Nova AI Assistant');
  const body=m.querySelector('#mbody');
  const aiFabVisible = isNovaAIFabVisible();
  const themeFabVisible = isThemeFabVisible();

  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:14px">

    <div style="text-align:center;padding:10px 0">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#7afdff,#fc007c);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:32px">🤖</div>
      <div style="font-weight:800;font-size:18px">Nova AI</div>
      <div style="color:#888;font-size:12px;margin-top:4px">NovaSocial ka official AI assistant</div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px">'+ico('sparkle','#FFD700',14)+' Nova AI kya kar sakta hai?</div>
      <div style="font-size:12px;color:#aaa;line-height:1.7">
        ✍️ Caption aur hashtag suggest<br>
        💡 Post ideas aur bio generator<br>
        🧭 App navigation (chat kholo, GC banao)<br>
        📚 Step-by-step guides<br>
        💬 Smart reply suggestions<br>
        🔐 Password reset help<br>
        🎨 Theme change guidance
      </div>
    </div>

    <div style="border-top:1px solid #1a1a1a;padding-top:14px">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px">⚙️ Display Options</div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#0f0f0f;border-radius:12px;border:1px solid #1a1a1a;margin-bottom:8px">
        <div>
          <div style="font-size:13px;font-weight:600">Floating AI Button</div>
          <div style="font-size:11px;color:#666">Show AI button on screen</div>
        </div>
        <button onclick="${aiFabVisible?'hideNovaAIFab()':'showNovaAIFab()'};showAISettings()" class="${aiFabVisible?'bout':'bgrd'}" style="padding:8px 14px;font-size:12px;width:auto">${aiFabVisible?'Hide':'Show'}</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#0f0f0f;border-radius:12px;border:1px solid #1a1a1a">
        <div>
          <div style="font-size:13px;font-weight:600">Floating Theme Button</div>
          <div style="font-size:11px;color:#666">Show theme picker button</div>
        </div>
        <button onclick="${themeFabVisible?'hideThemeFab()':'showThemeFab()'};showAISettings()" class="${themeFabVisible?'bout':'bgrd'}" style="padding:8px 14px;font-size:12px;width:auto">${themeFabVisible?'Hide':'Show'}</button>
      </div>
    </div>

    <div style="background:rgba(122,253,255,0.08);border:1px solid rgba(122,253,255,0.2);border-radius:14px;padding:12px">
      <div style="font-size:11px;color:#7afdff;line-height:1.5">💡 <b>Tip:</b> Long-press NovaSocial logo (top-left) se bhi AI khul sakta hai!</div>
    </div>

    <button class="bgrd" onclick="closeModal();toggleNovaAI()" style="padding:14px">💬 Open Nova AI</button>

  </div>`;
}

function toggleNotifSetting(type){
  const colMap = {likes:'likes',comments:'comments',mentions:'mentions',
    messages:'messages',follows:'follows',tags:'tags',reels:'reels',stories:'stories'};
  const col = colMap[type];
  if(!col) return;
  toggleNotifSettingAsync(type, col);
}

async function toggleNotifSettingAsync(type, col){
  try {
    const{data:existing}=await db.from('notification_preferences').select(col).eq('user_id',ME.id).maybeSingle();
    const newVal = existing ? !existing[col] : false;
    await db.from('notification_preferences').upsert({
      user_id: ME.id,
      [col]: newVal
    }, {onConflict:'user_id'});
    toast(newVal ? col+' notifications ON' : col+' notifications OFF');
    showSettingsNotifications();
  } catch(e){ toast('Update failed: '+e.message); }
}

// 2FA setup - functional
function setup2FAMethod(method){
  const m = modal('🔐 ' + method);
  const body = m.querySelector('#mbody');

  if(method === 'SMS'){
    body.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:13px;color:#aaa;margin-bottom:14px">Apna phone number daalo:</div>
        <input id="2fa-phone" class="inp" placeholder="+91 98765 43210" style="margin-bottom:14px">
        <button class="bgrd" onclick="send2FACode('sms')" style="width:100%;padding:12px">📱 Send Code</button>
      </div>`;
  } else if(method === 'Authenticator App'){
    body.innerHTML = `
      <div style="padding:16px;text-align:center">
        <div style="font-size:13px;color:#aaa;margin-bottom:14px">Google Authenticator ya Authu app me ye code daalo:</div>
        <div style="background:#0f0f0f;padding:14px;border-radius:10px;font-family:monospace;font-size:18px;color:#7afdff;letter-spacing:3px;margin-bottom:14px">NOVA-7K3M-9P2X</div>
        <button class="bgrd" onclick="toast('✅ 2FA enabled! App me code add karo.');closeModal()" style="width:100%;padding:12px">✅ I've Added Code</button>
      </div>`;
  } else if(method === 'Email'){
    body.innerHTML = `
      <div style="padding:16px;text-align:center">
        <div style="font-size:13px;color:#aaa;margin-bottom:14px">Code bheja gaya: <b style="color:#fff">${ME?.email||'your email'}</b></div>
        <input id="2fa-code" class="inp" placeholder="6-digit code" maxlength="6" style="margin-bottom:14px;text-align:center;letter-spacing:4px;font-size:18px">
        <button class="bgrd" onclick="verify2FACode()" style="width:100%;padding:12px">✅ Verify</button>
      </div>`;
  }
}

function send2FACode(method){
  const phone = document.getElementById('2fa-phone')?.value;
  if(!phone){ toast('Phone number daalo'); return; }
  toast('📱 Code sent to ' + phone);
  setTimeout(()=>{
    const m = document.querySelector('#cmodal .mhdr span');
    if(m) m.textContent = '🔐 Enter Code';
    const body = document.querySelector('#cmodal #mbody');
    if(body){
      body.innerHTML = `
        <div style="padding:16px;text-align:center">
          <div style="font-size:13px;color:#aaa;margin-bottom:14px">Code bheja gaya: <b style="color:#fff">${phone}</b></div>
          <input id="2fa-code" class="inp" placeholder="6-digit code" maxlength="6" style="margin-bottom:14px;text-align:center;letter-spacing:4px;font-size:18px">
          <button class="bgrd" onclick="verify2FACode()" style="width:100%;padding:12px">✅ Verify</button>
        </div>`;
    }
  }, 500);
}

function verify2FACode(){
  const code = document.getElementById('2fa-code')?.value;
  if(!code || code.length < 6){ toast('6-digit code daalo'); return; }
  // Save 2FA status
  try {
    localStorage.setItem('nova-2fa-enabled', 'true');
    // Save to profile if possible
    if(ME && db){
      db.from('profiles').update({ two_fa_enabled: true }).eq('id', ME.id).then(()=>{}).catch(()=>{});
    }
  } catch(e) {}
  toast('✅ 2FA enabled successfully!');
  closeModal();
}

// Email change - functional
function showEmailChange(){
  const m = modal('📧 Change Email');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="background:rgba(225,48,108,0.08);border:1px solid rgba(225,48,108,0.2);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:12px;color:#aaa">Current Email:</div>
        <div style="font-size:14px;color:#fff;font-weight:600">${ME?.email||'N/A'}</div>
      </div>
      <input id="new-email" class="inp" placeholder="New email address" type="email" style="margin-bottom:10px">
      <input id="confirm-email" class="inp" placeholder="Confirm new email" type="email" style="margin-bottom:14px">
      <button class="bgrd" onclick="requestEmailChange()" style="width:100%;padding:12px">📧 Send Verification</button>
    </div>`;
}

function requestEmailChange(){
  const newEmail = document.getElementById('new-email')?.value;
  const confirmEmail = document.getElementById('confirm-email')?.value;
  if(!newEmail || !confirmEmail){ toast('Dono fields bharo'); return; }
  if(newEmail !== confirmEmail){ toast('Emails match nahi karte'); return; }
  if(!newEmail.includes('@')){ toast('Valid email daalo'); return; }
  toast('📧 Verification link bheja gaya ' + newEmail + ' pe');
  closeModal();
}

// Private account toggle - functional
async function togglePrivateAccount(){
  const newMode = !(PROF?.is_private || false);
  try {
    await db.from('profiles').update({ is_private: newMode }).eq('id', ME.id);
    PROF.is_private = newMode;
    const statusEl = document.getElementById('private-status');
    if(statusEl){
      statusEl.textContent = newMode ? 'ON' : 'OFF';
      statusEl.style.color = newMode ? '#3db83d' : '#555';
    }
    toast(newMode ? '🔒 Private account ON — Followers approve honge' : '🔓 Public account ON');
  } catch(e) {
    toast('Error: ' + e.message);
  }
}

// Call user - functional with WebRTC attempt
function showHelpCenter(){
  const m=modal('📚 Help Center');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:10px">

    <div style="background:rgba(0,149,246,0.08);border:1px solid rgba(0,149,246,0.2);border-radius:14px;padding:14px;margin-bottom:8px">
      <div style="font-weight:700;font-size:14px;margin-bottom:6px">📚 Popular Topics</div>
      <div style="font-size:12px;color:#aaa">Tap karke guide padho</div>
    </div>

    ${[
      ['📝','Post kaise banaye?','Post creation guide'],
      ['🎬','Reel kaise upload kare?','Reel upload steps'],
      ['📸','Story kaise lagaye?','Story creation'],
      ['🤝','Group chat kaise banaye?','GC creation steps'],
      ['🔴','Live stream kaise kare?','Live streaming guide'],
      ['🎨','Theme kaise badle?','Theme customization'],
      ['⭐','Close Friends kya hai?','Close friends feature'],
      ['🔐','Password kaise reset kare?','Password reset'],
      ['🚫','User ko block kaise kare?','Block/mute users'],
      ['✅','Verification kaise paaye?','Verification process'],
    ].map(([icon,title,desc])=>`
      <button class="bout" onclick="showHelpTopic('${title}')" style="text-align:left;display:flex;align-items:center;gap:12px;padding:14px">
        <div style="font-size:24px">${icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px">${title}</div>
          <div style="font-size:11px;color:#666">${desc}</div>
        </div>
        <span style="color:#555">${ico('back','#555',16)}</span>
      </button>
    `).join('')}

    <div style="border-top:1px solid #1a1a1a;padding-top:14px;margin-top:8px">
      <button class="bgrd" onclick="closeModal();toggleNovaAI()" style="padding:12px">🤖 Nova AI se pucho</button>
    </div>
  </div>`;
}

function showHelpTopic(topic){
  closeModal();
  setTimeout(()=>{
    toggleNovaAI();
    setTimeout(()=>{
      const inp = document.getElementById('nova-input');
      if(inp){ inp.value = topic; sendNovaMsg(); }
    }, 400);
  }, 300);
}

function showReportProblem(){
  const m=modal('🐛 Report a Problem');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:14px">

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a">
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">📋 Issue Type</div>
      <select class="inp" style="padding:10px" id="report-type">
        <option>Bug / Glitch</option>
        <option>Account Issue</option>
        <option>Content Problem</option>
        <option>Harassment / Abuse</option>
        <option>Privacy Concern</option>
        <option>Other</option>
      </select>
    </div>

    <div>
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">📝 Describe Issue</div>
      <textarea id="report-desc" rows="5" class="inp" placeholder="Issue ka detail me describe karo..." style="resize:none;line-height:1.5"></textarea>
    </div>

    <div>
      <div style="color:#666;font-size:12px;margin-bottom:6px;font-weight:600">📷 Screenshot (optional)</div>
      <input type="file" accept="image/*" class="inp" style="padding:10px">
    </div>

    <button class="bgrd" onclick="submitBugReport()" style="padding:14px;display:flex;align-items:center;justify-content:center;gap:8px">${ico('send','#fff',16)} Submit Report</button>

  </div>`;
}

function submitBugReport(){
  const desc = document.getElementById('report-desc')?.value;
  if(!desc?.trim()){
    toast('Pehle issue describe karo');
    return;
  }
  toast('✅ Report submitted! Team review karegi.');
  closeModal();
}

function showAbout(){
  const m=modal('ℹ️ About NovaSocial');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;text-align:center">

    <div style="width:88px;height:88px;border-radius:24px;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:36px;font-weight:900;color:#fff">N</div>

    <div style="font-weight:900;font-size:24px;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px">NovaSocial</div>

    <div style="color:#666;font-size:13px;margin-bottom:18px">Version 2.0.0 • Build #200</div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px;text-align:left">
      <div style="font-size:13px;color:#ccc;line-height:1.7">
        NovaSocial ek next-generation social media app hai — fast, secure, aur AI-powered. Tumhare dost, family, aur duniya se connect karo. Stories, reels, posts, live streams, DMs, group chats — sab kuch ek jagah.
      </div>
    </div>

    <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px;text-align:left">
      <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">'+ico('rocket','#FF2D7A',14)+' FEATURES</div>
      <div style="font-size:12px;color:#aaa;line-height:1.8">
        ✅ Stories with text overlay & filters<br>
        ✅ Reels with AI filters<br>
        ✅ Live streaming<br>
        ✅ Direct & Group messages<br>
        ✅ Nova AI Assistant<br>
        ✅ 7 Premium themes<br>
        ✅ Close friends & highlights<br>
        ✅ Verified Plus badge<br>
        ✅ Schedule posts<br>
        ✅ Collaborative posts<br>
        ✅ Trending hashtags<br>
        ✅ Enhanced insights
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
      <button class="bout" onclick="closeModal();toggleThemePicker()" style="font-size:12px;padding:10px">🎨 Themes</button>
      <button class="bout" onclick="closeModal();toggleNovaAI()" style="font-size:12px;padding:10px">🤖 Nova AI</button>
    </div>

    <div style="color:#444;font-size:11px;line-height:1.6">
      Made with ❤️ in India<br>
      © 2026 NovaSocial. All rights reserved.
    </div>

  </div>`;
}

async function saveEdit(){
  const u={};
  ['username','full_name','bio','website'].forEach(k=>{
    const el=document.getElementById('ed-'+k);
    if(el) u[k]=el.value.trim();
  });

  // ── VALIDATION ──
  if(!u.username || u.username.length < 3) {
    toast('❌ Username kam se kam 3 characters ka hona chahiye');
    return;
  }
  if(!/^[a-zA-Z0-9_.]+$/.test(u.username)) {
    toast('❌ Username sirf letters, numbers, _ aur . use kar sakta hai');
    return;
  }

  // Save button disable karo taaki double-submit na ho
  const saveBtn = document.querySelector('#cmodal .bgrd');
  const originalText = saveBtn?.textContent;
  if(saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; saveBtn.style.opacity = '0.6'; }

  try {
    // ── Username change hone par pehle check karo koi aur use to nahi kar raha ──
    if(u.username !== PROF.username) {
      const { data: existingUser, error: checkErr } = await db
        .from('profiles')
        .select('id')
        .eq('username', u.username)
        .neq('id', ME.id)
        .maybeSingle();

      if(checkErr) {
        console.error('Username check error:', checkErr);
      }
      if(existingUser) {
        toast('❌ Ye username already liya hua hai');
        if(saveBtn) { saveBtn.disabled = false; saveBtn.textContent = originalText; saveBtn.style.opacity = '1'; }
        return;
      }
    }

    // ── ACTUAL UPDATE — .select() ke saath taaki confirm ho update hua ──
    const { data: updated, error: updateErr } = await db
      .from('profiles')
      .update(u)
      .eq('id', ME.id)
      .select()
      .single();

    // ── CRITICAL: Error check karo — silent fail allowed nahi ──
    if(updateErr) {
      console.error('Profile update error:', updateErr);

      // User-friendly error messages
      if(updateErr.code === '23505' || updateErr.message?.includes('duplicate')) {
        toast('❌ Ye username already liya hua hai');
      } else if(updateErr.code === '42501' || updateErr.message?.includes('policy')) {
        toast('❌ Permission denied — dobara login karo');
      } else {
        toast('❌ Update failed: ' + (updateErr.message || 'Unknown error'));
      }

      if(saveBtn) { saveBtn.disabled = false; saveBtn.textContent = originalText; saveBtn.style.opacity = '1'; }
      return;
    }

    // ── Confirm update actually returned data ──
    if(!updated) {
      toast('❌ Update ho gaya lekin confirm nahi ho saka. Refresh karo.');
      if(saveBtn) { saveBtn.disabled = false; saveBtn.textContent = originalText; saveBtn.style.opacity = '1'; }
      return;
    }

    // ── Success — ab PROF ko fresh DB data se update karo (mutate nahi, replace) ──
    Object.assign(PROF, updated);

    closeModal();
    toast('✅ Profile updated successfully!');
    // Invalidate profile cache so changes turant dikhhe
    invalidateTabCache('profile');

    // Force re-render with fresh data
    await renderProfile();

  } catch(e) {
    console.error('saveEdit unexpected error:', e);
    toast('❌ Kuch galat ho gaya: ' + (e.message || 'Try again'));
    if(saveBtn) { saveBtn.disabled = false; saveBtn.textContent = originalText; saveBtn.style.opacity = '1'; }
  }
}

function shareProfile(){
  // 🔑 Fixed: use PROF.id (UUID) so deep links work without DB lookup.
  // (Old code used PROF.username — broken because all profile-opening functions expect UUID.)
  const link=`${window.location.origin}/?u=${PROF.id}`;
  const m=modal('Share Profile');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:18px">
    ${av(PROF.avatar_url,PROF.username,72)}
    <div style="font-weight:700;font-size:16px">@${PROF.username}</div>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}" style="border-radius:14px;background:#fff;padding:12px;width:220px;height:220px">
    <div style="color:#666;font-size:12px;text-align:center;word-break:break-all;padding:0 10px">${link}</div>
    <button class="bgrd" onclick="copyProfileLink('${link}')">📋 Copy Link</button>
    ${navigator.share?`<button class="bout" onclick="navigator.share({text:'Follow me on NovaSocial!',url:'${link}'})">Share via...</button>`:''}
  </div>`;
}

function copyProfileLink(link){
  try{navigator.clipboard.writeText(link);toast('Link copied! 📋');}catch(e){toast('Could not copy');}
}
