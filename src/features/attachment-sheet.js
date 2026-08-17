// Attachment-sheet renderer; media/location/sticker actions remain inline.
function toggleAttachmentSheet(cid) {
  const m = modal('Attachments');
  const body = m.querySelector('#mbody');
  let html = '<div style="padding:20px; display:grid; grid-template-columns:repeat(4, 1fr); gap:20px; text-align:center;">';

  // Gallery
  html += '<div onclick="document.getElementById(\'dm-file-pick\').click()" style="cursor:pointer;">';
  html += '<div style="width:56px; height:56px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; margin:0 auto 8px;">'+ico('img','#fff',24)+'</div>';
  html += '<span style="font-size:12px; color:#aaa;">Gallery</span></div>';

  // Camera
  html += '<div onclick="document.getElementById(\'dm-cam-pick\').click()" style="cursor:pointer;">';
  html += '<div style="width:56px; height:56px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; margin:0 auto 8px;">'+ico('cam','#fff',24)+'</div>';
  html += '<span style="font-size:12px; color:#aaa;">Camera</span></div>';

  // Location
  html += '<div onclick="shareLocation(\''+cid+'\')" style="cursor:pointer;">';
  html += '<div style="width:56px; height:56px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:24px;">📍</div>';
  html += '<span style="font-size:12px; color:#aaa;">Location</span></div>';

  // Sticker
  html += '<div onclick="closeModal(); openStickerPicker(\''+cid+'\')" style="cursor:pointer;">';
  html += '<div style="width:56px; height:56px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:24px;">😊</div>';
  html += '<span style="font-size:12px; color:#aaa;">Sticker</span></div>';

  html += '</div>';

  // Hidden Inputs
  html += '<input id="dm-file-pick" type="file" accept="image/*,video/*" style="display:none" onchange="closeModal(); sendMediaMsg(\''+cid+'\', this)">';
  html += '<input id="dm-cam-pick" type="file" accept="image/*" capture="environment" style="display:none" onchange="closeModal(); sendMediaMsg(\''+cid+'\', this)">';

  body.innerHTML = html;
}
