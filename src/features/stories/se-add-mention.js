// Story Mention modal opener; DB-backed search and selection remain inline.
function seAddMention(){
  // Search real users from Supabase
  const modal = document.getElementById('se-addon-input');
  document.getElementById('se-addon-title').textContent = 'Mention User';

  document.getElementById('se-addon-fields').innerHTML = `
    <input id="se-field-search" placeholder="Search username..." style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:10px" oninput="seSearchMentionUsers(this.value)">
    <div id="se-mention-results" style="max-height:200px;overflow-y:auto"></div>
  `;

  document.getElementById('se-addon-confirm').style.display = 'none';
  modal.style.display = 'flex';

  // Focus search
  setTimeout(() => document.getElementById('se-field-search')?.focus(), 100);
}
