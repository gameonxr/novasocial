// Isolated avatar fullscreen viewer UI helper.
function viewAvatarFullscreen(avatarUrl, username) {
  if(!avatarUrl) {
    toast('Koi profile photo nahi hai');
    return;
  }

  document.getElementById('nova-avatar-viewer')?.remove();

  const modal = document.createElement('div');
  modal.id = 'nova-avatar-viewer';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;animation:novaFadeIn 0.2s ease';

  modal.innerHTML = `
    <div onclick="document.getElementById('nova-avatar-viewer').remove()" style="position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2">
      ${ico('close', '#fff', 22)}
    </div>
    <div style="position:absolute;top:20px;left:20px;color:#fff;font-weight:700;font-size:16px;z-index:2">
      @${esc(username) || ''}
    </div>
    <img src="${avatarUrl}" style="width:min(90vw,420px);height:min(90vw,420px);border-radius:50%;object-fit:cover;box-shadow:0 0 60px rgba(255,255,255,0.1)">
  `;

  modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}
