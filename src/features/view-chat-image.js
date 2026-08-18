// Isolated chat-image viewer UI helper; DMs realtime remains inline.
function viewChatImage(url) {
  const m = modal('');
  m.querySelector('.mhdr').style.display = 'none';
  m.querySelector('.msheet').style.background = 'rgba(0,0,0,0.95)';
  m.querySelector('#mbody').innerHTML = '<div style="position:relative;display:flex;align-items:center;justify-content:center;min-height:90vh;padding:10px;"><img src="'+url+'" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);"></div><div onclick="downloadMedia(\''+url+'\',\'novasocial_image\')" style="position:absolute;top:30px;right:20px;background:rgba(0,0,0,0.6);padding:12px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.5);">'+ico('img','#fff',24)+'</div>';
  m.onclick = e => { if(e.target === m) closeModal(); };
}
