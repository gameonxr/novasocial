// Isolated chat actions menu helper extracted from index.html.
function showChatActions(cid) {
  const m = modal('Chat Options');
  const body = m.querySelector('#mbody');
  let html = '<div style="padding:8px 0;">';
  // Bug 2 Fix: Moved Call History into overflow menu (was a dedicated header icon taking space)
  if(window._chatOtherId) {
    html += '<button onclick="closeModal();showCallHistory(\''+window._chatOtherId+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;display:flex;align-items:center;gap:10px">'+ico('phone','#fff',16)+' Call History</button>';
  }
  html += '<button onclick="clearChat(\''+cid+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#E1306C;display:flex;align-items:center;gap:10px">'+ico('trash_2','#E1306C',16)+' Clear Chat</button>';
  html += '<button onclick="closeModal()" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;margin-top:8px;">Cancel</button>';
  html += '</div>';
  body.innerHTML = html;
}
