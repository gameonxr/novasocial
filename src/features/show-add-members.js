// Extracted from index.html during Phase 77.
async function showAddMembers(cid){
  const m=modal('Add Members');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px"><div class="sbar2">${ico('search','#666',18)}<input placeholder="Search users by username..." id="am-search" oninput="searchAddMembers('${cid}',this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div><div id="am-results" style="margin-top:12px"></div></div>`;
}
