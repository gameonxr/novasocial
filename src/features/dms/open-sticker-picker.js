// Sticker picker modal UI setup.
async function openStickerPicker(cid) {
  window._stickerCid = cid;
  activeStickerTab = 'recent'; // Reset tab
  const m = modal('Stickers & GIFs');
  const body = m.querySelector('#mbody');
  body.innerHTML = ''; // Clear body

  let html = '<div style="padding:16px;">';
  // Upload Button
  html += '<div style="margin-bottom:16px;">';
  html += '<button onclick="document.getElementById(\'sticker-upload\').click()" class="bgrd" style="width:100%;padding:12px;font-size:14px;">+ Upload Custom Sticker</button>';
  html += '<input id="sticker-upload" type="file" accept="image/*" style="display:none" onchange="uploadCustomSticker(this, \''+cid+'\')">';
  html += '</div>';

  // Tabs
  html += '<div style="display:flex;gap:10px;border-bottom:1px solid #222;margin-bottom:16px;">';
  html += '<div onclick="showStickerTab(\'recent\')" id="tab-recent" style="padding:8px 0;cursor:pointer;font-weight:700;color:#fff;border-bottom:2px solid #fff;font-size:14px;">Recent</div>';
  html += '<div onclick="showStickerTab(\'fav\')" id="tab-fav" style="padding:8px 0;cursor:pointer;font-weight:600;color:#666;font-size:14px;">Favorites</div>';
  html += '<div onclick="showStickerTab(\'search\')" id="tab-search" style="padding:8px 0;cursor:pointer;font-weight:600;color:#666;font-size:14px;">Search GIFs</div>';
  html += '</div>';

  html += '<div id="sticker-content" style="min-height:200px;"></div>';
  html += '</div>';

  body.innerHTML = html;
  showStickerTab('recent');
}
