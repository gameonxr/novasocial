// Auth feature — classic script, preserves legacy inline-handler globals.
// ── AUTH ──────────────────────────────────────
function setMode(m){
  amode=m;
  document.getElementById('at-login').className='atab'+(m==='login'?' on':'');
  document.getElementById('at-signup').className='atab'+(m==='signup'?' on':'');
  document.getElementById('sf').style.display=m==='signup'?'flex':'none';
  document.getElementById('abtn').textContent=m==='login'?'Log In':'Create Account';
  document.getElementById('aswt').textContent=m==='login'?'Naya account? ':'Already account hai? ';
  document.getElementById('aswl').textContent=m==='login'?'Sign Up':'Log In';
  document.getElementById('aerr').style.display='none';
  // 📧 PART B: "Password bhool gaye?" link sirf login mode mein dikhao
  const forgotLink = document.getElementById('forgot-pass-link');
  if(forgotLink) forgotLink.style.display = m==='login' ? 'block' : 'none';
}

async function doAuth(){
  const email=document.getElementById('i-email').value.trim();
  const pass=document.getElementById('i-pass').value;
  const err=document.getElementById('aerr');
  const btn=document.getElementById('abtn');
  if(!email||!pass){showErr('Email aur password daalo');return;}
  btn.textContent='Please wait...';btn.disabled=true;err.style.display='none';
  try{
    if(amode==='login'){
      const{data,error}=await db.auth.signInWithPassword({email,password:pass});
      if(error){
        // 📧 PART A STEP 4: Friendly error for "Email not confirmed"
        if(error.message.includes('Email not confirmed')){
          showErr('Pehle apna email verify karo — inbox check karo 📧');
        } else if(error.message.includes('Invalid')){
          showErr('Email ya password galat hai');
        } else {
          showErr(error.message);
        }
        btn.textContent='Log In';btn.disabled=false;return;
      }

      // 👥 MULTI-ACCOUNT: Agar ye "Add Account" flow tha, to naya session set ho gaya hai
      if(window._addingNewAccount){
        window._addingNewAccount = false;
        ME = data.user;
        await loadProf();
        await syncCurrentAccountToSavedList();
        showApp();
        toast('Account added! ✅');
        btn.textContent='Log In';btn.disabled=false;
        return;
      }
    }else{
      const uname=document.getElementById('i-user').value.trim().toLowerCase().replace(/\s/g,'_');
      const fname=document.getElementById('i-name').value.trim();
      if(!uname){showErr('Username daalo');btn.textContent='Create Account';btn.disabled=false;return;}
      // 📧 PART A STEP 2: Email verification mandatory — show verification screen if session not returned
      const{data,error}=await db.auth.signUp({email,password:pass,options:{data:{username:uname,full_name:fname}}});
      if(error){ showErr(error.message); btn.textContent='Create Account'; btn.disabled=false; return; }

      if(data?.user && !data?.session){
        // Email confirmation zaroori hai — session nahi mila matlab verify pending hai
        showEmailVerificationScreen(email);
        btn.textContent='Create Account'; btn.disabled=false;
        return;
      }
    }
  }catch(e){showErr('Network error. Internet check karo.');}
  btn.textContent=amode==='login'?'Log In':'Create Account';btn.disabled=false;
}
function showErr(m){const e=document.getElementById('aerr');e.textContent=m;e.style.display='block';}

// ═══════════════════════════════════════════════════════════════
// 📧 EMAIL VERIFICATION SCREEN (shown after signup when email confirm is required)
// ═══════════════════════════════════════════════════════════════
function showEmailVerificationScreen(email){
  document.getElementById('auth').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center">
      <div style="width:80px;height:80px;border-radius:50%;background:rgba(225,48,108,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:24px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/><polyline points="22 6 12 13 2 6"/></svg>
      </div>
      <div style="font-weight:800;font-size:20px;color:#fff;margin-bottom:10px">Check your email</div>
      <div style="color:#999;font-size:14px;line-height:1.6;margin-bottom:8px">Humne ek verification link bheja hai</div>
      <div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:24px">${email}</div>
      <div style="color:#666;font-size:13px;line-height:1.6;margin-bottom:28px">Link pe click karke apna email verify karo, phir wapas aake login karo.</div>
      <button onclick="location.reload()" class="bgrd" style="width:100%;max-width:280px">Login pe wapas jao</button>
      <div onclick="resendVerificationEmail('${email}')" style="margin-top:16px;color:#E1306C;font-size:13px;cursor:pointer;font-weight:600">Email dobara bhejo</div>
    </div>`;
}

async function resendVerificationEmail(email){
  try{
    const{error} = await db.auth.resend({type:'signup', email});
    if(error) throw error;
    toast('Email dobara bhej diya ✅');
  }catch(e){ toast('Failed: '+e.message); }
}

// ═══════════════════════════════════════════════════════════════
// 🔐 FORGOT PASSWORD FLOW — reset link bhejo + naya password set karo
// ═══════════════════════════════════════════════════════════════

function showForgotPasswordScreen(){
  document.getElementById('auth').innerHTML = `
    <div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:32px">
      <div onclick="location.reload()" style="cursor:pointer;margin-bottom:24px">${ico('back','#fff',22)}</div>
      <div style="font-weight:800;font-size:22px;color:#fff;margin-bottom:8px">Password Reset karo</div>
      <div style="color:#888;font-size:14px;margin-bottom:24px">Apna email daalo, hum reset link bhej denge</div>
      <input id="reset-email" type="email" placeholder="Email" class="inp" style="margin-bottom:16px">
      <button onclick="sendPasswordResetEmail()" class="bgrd">Reset Link Bhejo</button>
    </div>`;
}

async function sendPasswordResetEmail(){
  const email = document.getElementById('reset-email')?.value?.trim();
  if(!email){ toast('Email daalo'); return; }
  try{
    const{error} = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '?reset=true'
    });
    if(error) throw error;
    toast('Reset link bhej diya ✅ Email check karo');
    setTimeout(()=>location.reload(), 2000);
  }catch(e){ toast('Failed: '+e.message); }
}

function showSetNewPasswordScreen(){
  document.getElementById('splash')?.classList.add('hide');
  document.getElementById('auth').style.display='flex';
  document.getElementById('root').style.display='none';
  document.getElementById('auth').innerHTML = `
    <div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:32px">
      <div style="font-weight:800;font-size:22px;color:#fff;margin-bottom:8px">Naya Password Set Karo</div>
      <div style="color:#888;font-size:14px;margin-bottom:24px">Apna naya password daalo</div>
      <div style="position:relative;margin-bottom:16px">
        <input id="new-pass" type="password" placeholder="Naya Password" class="inp" style="padding-right:48px">
        <div onclick="togglePasswordVisibility('new-pass', this)" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer">${ico('eye','#666',18)}</div>
      </div>
      <div style="position:relative;margin-bottom:20px">
        <input id="confirm-pass" type="password" placeholder="Password Confirm Karo" class="inp" style="padding-right:48px">
        <div onclick="togglePasswordVisibility('confirm-pass', this)" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer">${ico('eye','#666',18)}</div>
      </div>
      <button onclick="submitNewPassword()" class="bgrd">Password Update Karo</button>
    </div>`;
}

async function submitNewPassword(){
  const newPass = document.getElementById('new-pass')?.value;
  const confirmPass = document.getElementById('confirm-pass')?.value;
  if(!newPass || newPass.length < 6){ toast('Password kam se kam 6 characters ka ho'); return; }
  if(newPass !== confirmPass){ toast('Passwords match nahi kar rahe'); return; }
  try{
    const{error} = await db.auth.updateUser({password: newPass});
    if(error) throw error;
    toast('Password update ho gaya ✅ Login karo');
    setTimeout(()=>{ window.location.href = window.location.origin + window.location.pathname; }, 1500);
  }catch(e){ toast('Failed: '+e.message); }
}

// ═══════════════════════════════════════════════════════════════
// 👁️ SHOW/HIDE PASSWORD TOGGLE — universal function for all password fields
// ═══════════════════════════════════════════════════════════════
function togglePasswordVisibility(inputId, iconEl){
  const inp = document.getElementById(inputId);
  if(!inp) return;
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  iconEl.innerHTML = isHidden
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
}
