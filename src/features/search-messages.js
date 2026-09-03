// searchMessages — extracted from index.html
// Owner SHA-256: f155069a0844872eb97d08c3a8ab90076453d115ff67675a69684f0cd44ee5d6
// Classic script — exposes window.searchMessages

window.searchMessages = async function searchMessages(cid){
  const m = modal('Search in Chat');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;position:sticky;top:0;background:#0d0d0d;z-index:10;border-bottom:1px solid #222;">
      <div class="sbar2" style="background:#1a1a1a;border-radius:12px;">${ico('search','#888',18)}<input placeholder="Search messages..." id="search-inp" oninput="doSearchMessages('${cid}', this.value)" style="background:transparent;border:none;outline:none;color:#fff;font-size:14px;flex:1" autofocus></div>
    </div>
    <div id="search-results" style="padding:8px 0;">
      <div style="color:#444;text-align:center;padding:40px 20px;font-size:13px;">Search karna shuru karo...</div>
    </div>
  `;
};
