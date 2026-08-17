// Report modal renderer; report persistence remains inline.
function showReportModal(targetType, targetId){
  closeModal();
  const m = modal('Report');
  const body = m.querySelector('#mbody');

  body.innerHTML = `<div style="padding:16px">
    <div style="font-size:13px;color:#888;margin-bottom:14px;font-weight:500">Why are you reporting this ${esc(targetType)}?</div>
    <div id="report-reasons-list" style="display:flex;flex-direction:column;gap:6px">
      ${REPORT_REASONS.map((r, i) => `
        <div data-reason-idx="${i}" data-reason-key="${r.key}" class="report-reason-item" style="display:flex;align-items:center;gap:12px;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;cursor:pointer;transition:background 0.15s,border-color 0.15s;user-select:none;-webkit-user-select:none">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,45,122,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">${ico(r.icon, '#FF2D7A', 18)}</div>
          <span style="flex:1;font-size:14px;font-weight:600;color:#fff">${r.label}</span>
          ${ico('chevron_right','#555',16)}
        </div>
      `).join('')}
    </div>
    <div onclick="closeModal()" style="margin-top:10px;padding:14px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#8A8A8A;font-size:14px;font-weight:600;cursor:pointer">Cancel</div>
  </div>`;

  // Event delegation — robust click handling
  const listEl = document.getElementById('report-reasons-list');
  if(listEl){
    listEl.querySelectorAll('.report-reason-item').forEach(item => {
      // Hover effects
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(255,45,122,0.1)';
        item.style.borderColor = 'rgba(255,45,122,0.3)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'rgba(255,255,255,0.04)';
        item.style.borderColor = 'rgba(255,255,255,0.08)';
      });
      // Click — directly call submitReport with the reason key
      item.addEventListener('click', () => {
        const reasonKey = item.dataset.reasonKey;
        submitReport(targetType, targetId, reasonKey);
      });
      // Touch support for mobile
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        const reasonKey = item.dataset.reasonKey;
        submitReport(targetType, targetId, reasonKey);
      });
    });
  }
}
