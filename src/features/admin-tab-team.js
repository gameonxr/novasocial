// adminTabTeam — extracted from index.html
// Owner SHA-256: c8c7fff9f993dcbd157fe38940d2b55c0baca1ec1c1556864db823245d7ef477
// Classic script — exposes window.adminTabTeam

window.adminTabTeam = async function adminTabTeam(content){
  const isSuper = PROF?.is_super_admin === true;
  const isAdmin = PROF?.is_admin === true;

  content.innerHTML = `<div style="padding:0">
    <div style="font-size:12px;color:#8A8A8A;font-weight:700;margin-bottom:10px;text-transform:uppercase">Staff Team</div>
    <div id="admin-team-list" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:center;padding:20px"><div class="spin" style="width:24px;height:24px;border:3px solid rgba(255,45,122,0.2);border-top-color:#FF2D7A;border-radius:50%;animation:spin 0.8s linear infinite"></div></div></div>

    ${isAdmin || isSuper ? `
    <div style="margin-top:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px">
      <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;text-transform:uppercase">Promote User to Moderator</div>
      <input id="team-search-user" placeholder="Search username to promote..." oninput="searchUserForPromotion(this.value)" style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px">
      <div id="team-search-results" style="display:flex;flex-direction:column;gap:4px"></div>
    </div>
    ` : ''}

    ${isSuper ? `
    <div style="margin-top:10px;background:rgba(255,45,122,0.05);border:1px solid rgba(255,45,122,0.2);border-radius:14px;padding:14px">
      <div style="font-size:11px;color:#FF2D7A;font-weight:700;margin-bottom:8px;text-transform:uppercase">⚡ Super Admin Power</div>
      <div style="font-size:12px;color:#8A8A8A;line-height:1.5">You can promote users to <b style="color:#a855f7">Admin</b> or <b style="color:#00E5FF">Moderator</b>. Admins can manage moderators but cannot touch other admins.</div>
    </div>
    ` : ''}
  </div>`;

  await loadTeamList();
};
