// showMsgMenu — extracted from index.html
// Owner SHA-256: c8b6966627a2ca3424a1469d93388fef4aa8e79e3ec2fc8185be00b443a2ecff
// Classic script — exposes window.showMsgMenu

window.showMsgMenu = function showMsgMenu(id, isMe, senderId, encText, encName, encMtype, encMurl) {
  const m = modal('Message Actions');
  const body = m.querySelector('#mbody');

  // Decode for display
  const text = decodeURIComponent(encText || '');
  const name = decodeURIComponent(encName || '');

  let html = '<div style="padding:8px 0;">';
  html += '<div style="display:flex;justify-content:space-around;padding:10px 0 20px 0;border-bottom:1px solid #1a1a1a;">';
  html += '<div onclick="reactMsg(\''+id+'\',\'❤️\')" style="font-size:32px;cursor:pointer;">❤️</div>';
  html += '<div onclick="reactMsg(\''+id+'\',\'😂\')" style="font-size:32px;cursor:pointer;">😂</div>';
  html += '<div onclick="reactMsg(\''+id+'\',\'🔥\')" style="font-size:32px;cursor:pointer;">🔥</div>';
  html += '<div onclick="reactMsg(\''+id+'\',\'👍\')" style="font-size:32px;cursor:pointer;">👍</div>';
  html += '<div onclick="reactMsg(\''+id+'\',\'😮\')" style="font-size:32px;cursor:pointer;">😮</div>';
  html += '</div>';

  if(!isMe) {
    html += '<button onclick="closeModal();goToProfile(\''+senderId+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">👤 View Profile</button>';
  }
  html += '<button onclick="forwardMessage(\''+id+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">➡️ Forward</button>';

  if(encMurl && encMtype === 'image') {
  const favs = JSON.parse(localStorage.getItem('fav_stickers') || '[]');
  const isFav = favs.includes(decodeURIComponent(encMurl));

  html += '<button onclick="toggleFavFromMsg(\''+encMurl+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">'
       + (isFav ? '⭐ Remove Favorite Sticker' : '☆ Add To Favorites')
       + '</button>';
}

  if(isMe) {
    html += '<button onclick="showMsgInfo(\''+id+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">ℹ️ Info</button>';
  }

  if(text) {
    html += '<button onclick="copyMsgFromEnc(\''+encText+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">📋 Copy</button>';
  }
  html += '<button onclick="pinMsgFromEnc(\''+id+'\',\''+encText+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">📌 Pin</button>';

  if(isMe) {
    html += '<button onclick="unsendMsg(\''+id+'\')" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#E1306C;display:flex;align-items:center;gap:10px">'+ico('trash_2','#E1306C',16)+' Unsend</button>';
  } else {
    html += '<button onclick="showReportModal(\'message\',\''+id+'\')" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#ffaa00;">🚩 Report Message</button>';
  }
    html += '<button onclick="deleteMsgForMe(\''+id+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;display:flex;align-items:center;gap:10px">'+ico('trash_2','#aaa',16)+' Delete for Me</button>';
  html += '<button onclick="closeModal()" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;margin-top:8px;">Cancel</button>';
  html += '</div>';

    body.innerHTML = html;
};
