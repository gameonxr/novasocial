// Profile avatar action-sheet renderer and cleanup helper.
function showAvatarActionSheet() {
  document.getElementById('avatar-action-sheet')?.remove();

  const sheet = document.createElement('div');
  sheet.id = 'avatar-action-sheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;';
  sheet.innerHTML = `
    <div style="width:100%;background:#0A0A0A;border-radius:20px 20px 0 0;padding:8px 16px 30px;border-top:1px solid rgba(255,255,255,0.08)">
      ${PROF?.avatar_url ? `
        <div onclick="document.getElementById('avatar-action-sheet').remove();viewAvatarFullscreen('${PROF.avatar_url}','${esc(PROF.username)||''}')" style="padding:16px;text-align:center;color:#fff;font-weight:600;font-size:15px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.06)">
          👁 View Photo
        </div>
      ` : ''}
      <div onclick="document.getElementById('avatar-action-sheet').remove();document.getElementById('avpick').click()" style="padding:16px;text-align:center;color:#FF2D7A;font-weight:700;font-size:15px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.06)">
        📷 Change Photo
      </div>
      <div onclick="document.getElementById('avatar-action-sheet').remove()" style="padding:16px;text-align:center;color:#8A8A8A;font-weight:600;font-size:15px;cursor:pointer">
        Cancel
      </div>
    </div>`;
  sheet.onclick = (e) => { if(e.target === sheet) sheet.remove(); };
  document.body.appendChild(sheet);
}
