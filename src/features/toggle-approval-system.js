// toggleApprovalSystem — extracted from index.html
// Owner SHA-256: 8ad2a5194ac2351e29bad7ce6c7bfe9c7ced182bc0e633a53efd604c39f08633
// Classic script — exposes window.toggleApprovalSystem

window.toggleApprovalSystem = async function toggleApprovalSystem(cid, isEnabled, btn) {
  await db.from('conversations').update({ admin_approval_required: isEnabled }).eq('id', cid);
  toast(isEnabled ? 'Approval system enabled ✅' : 'Approval system disabled');
  // Instant UI Update
  if(btn) {
    btn.style.background = isEnabled ? '#E1306C' : '#333';
    let knob = btn.querySelector('div');
    if(knob) knob.style.left = isEnabled ? '23px' : '3px';
    btn.setAttribute('onclick', `toggleApprovalSystem('${cid}', ${!isEnabled}, this)`);
  }
};
