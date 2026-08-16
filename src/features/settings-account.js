// Extracted from index.html during Phase 69.
function showSettingsAccount(){
  const m=modal('Account'); m.querySelector('#mbody').innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:8px">
    <div onclick="showEditProfile()" class="nova-setting-row">${ico('edit','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Edit Profile</div><div style="font-size:11px;color:#8A8A8A">Username, name, bio, website</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showPasswordReset()" class="nova-setting-row">${ico('lock','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Password & Security</div><div style="font-size:11px;color:#8A8A8A">Reset password, 2FA, change email</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showVerificationApply()" class="nova-setting-row">${ico('verified','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Verification</div><div style="font-size:11px;color:#8A8A8A">Apply for verified badge</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showAccountInfo()" class="nova-setting-row">${ico('info','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Account Information</div><div style="font-size:11px;color:#8A8A8A">User ID, email, member since</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="downloadMyData()" class="nova-setting-row">${ico('download','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Download Data</div><div style="font-size:11px;color:#8A8A8A">Export your account data</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showDeleteAccount()" class="nova-setting-row" style="border-color:rgba(255,45,122,0.2)">${ico('trash','#FF2D7A',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#FF2D7A">Deactivate Account</div><div style="font-size:11px;color:#8A8A8A">Permanently delete your account</div></div>${ico('chevron_right','#FF2D7A',16)}</div>
  </div>`;
}
