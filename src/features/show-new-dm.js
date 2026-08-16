// Extracted from index.html during Phase 75.
async function showNewDM(){
  const m=modal('New Message');
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:12px">
    <div class="sbar2">${ico('search','#666',18)}<input placeholder="Username search karo..." id="dms-inp" oninput="searchDM(this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>
    <div id="dms-res"></div>
  </div>`;
}
