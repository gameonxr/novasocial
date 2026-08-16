// Extracted from index.html during Phase 76.
async function showGC(){
  const m=modal('New Group Chat');
  const body=m.querySelector('#mbody');
  window._gcs=[];
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:12px">
    <input id="gc-n" placeholder="Group name..." class="inp">
    <div class="sbar2">${ico('search','#666',18)}<input placeholder="Members search..." id="gc-s" oninput="searchGC(this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1"></div>
    <div id="gc-r"></div>
    <button class="bgrd" onclick="createGC()">Create Group</button>
  </div>`;
}
