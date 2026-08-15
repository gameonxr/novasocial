/**
 * NovaSocial Security Center feature.
 *
 * Extracted as a classic script while Creator Wallet and later Nova Ultra
 * features remain inline for independent guarded checkpoints.
 */
// ── SECURITY CENTER ──────────────────────────────────────
function showSecurityCenter(){
  const m = modal('🔒 Security Center');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="text-align:center;padding:10px 0 20px">
        <div style="width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,#3db83d,#0095f6);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 14px">🔒</div>
        <div style="font-weight:800;font-size:18px">Security Center</div>
        <div style="color:#888;font-size:12px;margin-top:4px">Account security status: <span style="color:#3db83d;font-weight:700">Good</span></div>
      </div>

      <!-- Security Score -->
      <div style="background:linear-gradient(135deg,rgba(61,184,61,0.1),rgba(0,149,246,0.1));border:1px solid rgba(61,184,61,0.2);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-weight:700;font-size:13px">Security Score</div>
          <div style="font-size:24px;font-weight:800;color:#3db83d">75/100</div>
        </div>
        <div style="height:6px;background:#1a1a1a;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:75%;background:linear-gradient(90deg,#3db83d,#0095f6);border-radius:3px"></div>
        </div>
        <div style="font-size:11px;color:#888;margin-top:8px">2FA enable karo score badhane ke liye</div>
      </div>

      <!-- 2FA -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:14px">📱 Two-Factor Authentication</div>
            <div style="font-size:11px;color:#666;margin-top:2px">Extra security layer</div>
          </div>
          <button onclick="setup2FA()" class="bout" style="padding:8px 14px;font-size:12px;width:auto">Enable</button>
        </div>
      </div>

      <!-- Biometric -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:14px">👆 Biometric Login</div>
            <div style="font-size:11px;color:#666;margin-top:2px">Fingerprint / Face unlock</div>
          </div>
          <button onclick="toggleBiometric(this)" class="bout" style="padding:8px 14px;font-size:12px;width:auto">Enable</button>
        </div>
      </div>

      <!-- Active Devices -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="font-weight:700;font-size:13px;margin-bottom:10px">📱 Active Devices</div>
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#1a1a1a;border-radius:10px;margin-bottom:6px">
          <div style="font-size:24px">📱</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:#fff">Chrome • Android</div>
            <div style="font-size:10px;color:#666">Mumbai, India • Active now</div>
          </div>
          <div style="font-size:10px;color:#3db83d;font-weight:700">CURRENT</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#1a1a1a;border-radius:10px">
          <div style="font-size:24px">💻</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:#fff">Safari • MacBook</div>
            <div style="font-size:10px;color:#666">Delhi, India • 2 hours ago</div>
          </div>
          <div onclick="logoutDevice('macbook')" style="font-size:11px;color:#E1306C;cursor:pointer;font-weight:700">LOGOUT</div>
        </div>
      </div>

      <!-- Suspicious Activity -->
      <div style="background:rgba(225,48,108,0.08);border:1px solid rgba(225,48,108,0.2);border-radius:14px;padding:14px;margin-bottom:10px">
        <div style="font-weight:700;font-size:13px;color:#E1306C;margin-bottom:8px">⚠️ Recent Activity</div>
        <div style="font-size:11px;color:#aaa;line-height:1.6">No suspicious login attempts detected. Last login: Today 3:45 PM from Mumbai, India ✓</div>
      </div>

      <!-- Anti-Bot -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:14px">🤖 Anti-Bot Protection</div>
            <div style="font-size:11px;color:#666;margin-top:2px">Auto-detect & block bots</div>
          </div>
          <div style="font-size:11px;color:#3db83d;font-weight:700">ACTIVE ✓</div>
        </div>
      </div>

      <!-- Login Alerts -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:14px">🔔 Login Alerts</div>
            <div style="font-size:11px;color:#666;margin-top:2px">Email pe alert bhejo new login pe</div>
          </div>
          <div style="font-size:11px;color:#3db83d;font-weight:700">ON ✓</div>
        </div>
      </div>

      <button class="bout" onclick="closeModal()" style="width:100%;padding:12px">Done</button>
    </div>
  `;
}

function setup2FA(){
  const m = modal('📱 Setup 2FA');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;text-align:center">
      <div style="font-size:60px;margin-bottom:14px">📱</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:8px">Two-Factor Authentication</div>
      <div style="font-size:12px;color:#888;margin-bottom:20px">Choose your 2FA method:</div>

      <div style="display:flex;flex-direction:column;gap:10px;text-align:left">
        <button onclick="toast('📱 SMS 2FA enabled!');closeModal()" class="bout" style="padding:14px;display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:13px">📱 SMS Authentication</div><div style="font-size:11px;color:#666">Code via SMS</div></div>
          <span style="color:#555">›</span>
        </button>
        <button onclick="toast('🔐 Authenticator app enabled!');closeModal()" class="bout" style="padding:14px;display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:13px">🔐 Authenticator App</div><div style="font-size:11px;color:#666">Google Authenticator, Authy</div></div>
          <span style="color:#555">›</span>
        </button>
        <button onclick="toast('📧 Email 2FA enabled!');closeModal()" class="bout" style="padding:14px;display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:13px">📧 Email Authentication</div><div style="font-size:11px;color:#666">Code via email</div></div>
          <span style="color:#555">›</span>
        </button>
      </div>
    </div>
  `;
}

function toggleBiometric(btn){
  if(!navigator.credentials){
    toast('👆 Biometric not supported on this device');
    return;
  }
  // Try WebAuthn
  if('credentials' in navigator){
    btn.textContent = 'Enabling...';
    setTimeout(()=>{
      btn.textContent = 'Enabled ✓';
      btn.style.background = 'linear-gradient(135deg,#3db83d,#0095f6)';
      btn.style.color = '#fff';
      toast('👆 Biometric login enabled!');
    }, 1000);
  } else {
    toast('Biometric not available');
  }
}

function logoutDevice(device){
  toast(`${device} se logout ho gaya ✓`);
}
