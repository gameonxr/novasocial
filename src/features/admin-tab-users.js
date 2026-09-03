// adminTabUsers — extracted from index.html
// Owner SHA-256: 69d7b081f72880d12d79b323c07a0b9aec49c24d99e36ca90ea9ecb060bc5100
// Classic script — exposes window.adminTabUsers

window.adminTabUsers = async function adminTabUsers(content){
  content.innerHTML = `<div style="margin-bottom:12px"><input id="admin-user-search" placeholder="Search username..." oninput="searchAdminUsers(this.value)" style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:11px 14px;color:#fff;font-size:14px;outline:none;box-sizing:border-box"></div>
    <div id="admin-user-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>`;
  await searchAdminUsers('');
};
