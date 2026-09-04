// adminTabContent — extracted from index.html
// Owner SHA-256: c4c140119c887aeacc27072fadce417dc05952ada14778ac53856d291c970fb9
// Classic script — exposes window.adminTabContent

window.adminTabContent = async function adminTabContent(content){
  content.innerHTML = `<div style="margin-bottom:12px">
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <div onclick="loadAdminContent('posts')" id="ct-posts" style="flex:1;padding:8px;text-align:center;background:rgba(0,229,255,0.15);border:1px solid #00E5FF;border-radius:10px;color:#00E5FF;font-size:11px;font-weight:700;cursor:pointer">Posts</div>
      <div onclick="loadAdminContent('comments')" id="ct-comments" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Comments</div>
      <div onclick="loadAdminContent('stories')" id="ct-stories" style="flex:1;padding:8px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#8A8A8A;font-size:11px;font-weight:700;cursor:pointer">Stories</div>
    </div>
    <div id="admin-content-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(0,229,255,0.2);border-top-color:#00E5FF;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>
  </div>`;
  await loadAdminContent('posts');
};
