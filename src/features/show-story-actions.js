// showStoryActions — extracted from index.html
// Owner SHA-256: 8553441c4e4d84c3ed9cc460ca0f8a31a34482d623f006138cca66fea60e0c3b
// Classic script — exposes window.showStoryActions

window.showStoryActions = function showStoryActions(storyId, userId) {
  const m = modal('Story Options');
  const body = m.querySelector('#mbody');
  let html = '<div style="padding:8px 0;">';
  html += '<button onclick="copyStoryLink(\''+storyId+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">🔗 Copy Link</button>';

  if(userId !== ME.id) {
    html += '<button onclick="downloadStory(\''+storyId+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">⬇️ Download Story</button>';
    html += '<button onclick="toast(\'User muted\'); closeModal();" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">🔇 Mute User</button>';
    html += '<button onclick="toast(\'Reported\'); closeModal();" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#E1306C;">🚩 Report Story</button>';
  } else {
    html += '<button onclick="shareStoryAsPost(\''+storyId+'\')" class="bout" style="border:none;border-bottom:1px solid #1a1a1a;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;">➕ Share as Post</button>';
    html += '<button onclick="deleteStory(\''+storyId+'\')" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#E1306C;display:flex;align-items:center;gap:10px">'+ico('trash_2','#E1306C',16)+' Delete Story</button>';
  }
  html += '<button onclick="closeModal()" class="bout" style="border:none;border-radius:0;text-align:left;padding:16px 20px;width:100%;font-size:15px;color:#aaa;margin-top:8px;">Cancel</button>';
  html += '</div>';
  body.innerHTML = html;
};
