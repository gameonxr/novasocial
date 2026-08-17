// Note native-emoji picker renderer.
function openMoreEmojiPicker(noteId){
  const panel = document.createElement('div');
  panel.id = 'more-emoji-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center';
  panel.innerHTML = `
    <div style="width:100%;max-width:400px;background:#0d0d0d;border-radius:24px 24px 0 0;padding:24px 20px;padding-bottom:calc(24px + env(safe-area-inset-bottom));text-align:center">
      <div style="width:36px;height:4px;background:#333;border-radius:2px;margin:0 auto 20px"></div>
      <div style="color:#999;font-size:13px;margin-bottom:16px">Apne keyboard se koi bhi emoji chuno</div>
      <input id="native-emoji-inp" placeholder="😊" style="width:100%;background:#161616;border:1px solid #262626;border-radius:16px;padding:16px;color:#fff;font-size:28px;text-align:center;outline:none" maxlength="4">
      <button onclick="submitNativeEmojiReaction('${noteId}')" class="bgrd" style="margin-top:16px">Send Reaction</button>
      <div onclick="document.getElementById('more-emoji-panel').remove()" style="margin-top:14px;color:#666;font-size:13px;cursor:pointer">Cancel</div>
    </div>`;
  panel.onclick = e=>{ if(e.target===panel) panel.remove(); };
  document.body.appendChild(panel);

  const inp = document.getElementById('native-emoji-inp');
  setTimeout(()=>{ inp?.focus(); }, 150); // 📱 Ye phone ka NATIVE emoji-keyboard trigger karega
}
