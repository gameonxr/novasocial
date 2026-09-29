// Independent Story Creator text/media helpers extracted from index.html.
function prevStoryMedia(inp) {
  const f = inp.files[0];
  if(!f) return;
  const url = URL.createObjectURL(f);
  const prev = document.getElementById('story-prev');

  if(f.type.startsWith('video/')) {
    prev.innerHTML = '<video src="'+url+'" style="width:100%;height:100%;object-fit:cover" muted playsinline autoplay loop></video>';
    // FIX: Show text tools for video too — don't hide them
    const tools = document.getElementById('story-text-tools');
    if(tools) tools.style.display = 'block';
  } else {
    prev.innerHTML = '<img src="'+url+'" style="width:100%;height:100%;object-fit:cover">';
    const tools = document.getElementById('story-text-tools');
    if(tools) tools.style.display = 'block';
  }

  window._storyFile = f;
  document.getElementById('story-submit-btn').disabled = false;
  document.getElementById('story-submit-btn').style.opacity = '1';
}

function addStoryText() {
  const prev = document.getElementById('story-prev');
  if(!prev) return;
  const textEl = document.createElement('div');
  textEl.contentEditable = true;
  textEl.innerText = 'Tap to edit';
  textEl.className = 'story-text-overlay';
  textEl.style.cssText = 'top:40%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:24px;font-weight:700;';

  textEl.addEventListener('click', (e) => {
    e.stopPropagation(); // Gallery na khule
    textEl.focus();
    document.execCommand('selectAll', false, null);
  });

  // Drag Logic
  let isDragging = false;
  textEl.addEventListener('mousedown', (e) => { isDragging = true; textEl.style.cursor='grabbing'; });
  textEl.addEventListener('touchstart', (e) => { isDragging = true; textEl.style.cursor='grabbing'; }, {passive: true});

  document.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    const rect = prev.getBoundingClientRect();
    textEl.style.left = (e.clientX - rect.left) + 'px';
    textEl.style.top = (e.clientY - rect.top) + 'px';
    textEl.style.transform = 'translate(-50%,-50%)';
  });
  document.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    const touch = e.touches[0];
    const rect = prev.getBoundingClientRect();
    textEl.style.left = (touch.clientX - rect.left) + 'px';
    textEl.style.top = (touch.clientY - rect.top) + 'px';
    textEl.style.transform = 'translate(-50%,-50%)';
  }, {passive: true});

  document.addEventListener('mouseup', () => { isDragging = false; textEl.style.cursor='move'; });
  document.addEventListener('touchend', () => { isDragging = false; textEl.style.cursor='move'; });

  prev.appendChild(textEl);
}

function changeStoryTextColor(color, el) {
  document.querySelectorAll('#story-text-tools > div div').forEach(d => d.style.border = '2px solid #333');
  el.style.border = '2px solid #E1306C';
  document.querySelectorAll('.story-text-overlay').forEach(t => t.style.color = color);
}

function changeStoryTextSize(size) {
  document.querySelectorAll('.story-text-overlay').forEach(t => t.style.fontSize = size + 'px');
}
