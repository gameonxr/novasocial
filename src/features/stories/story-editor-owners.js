'use strict';

window.renderStoryElements = function(){
  const container = document.getElementById('se-elements');
  if(!container) return;
  container.innerHTML = '';

  storyEditorElements.forEach(el => {
    const div = document.createElement('div');
    div.dataset.id = el.id;
    div.style.cssText = `position:absolute;left:${el.x}%;top:${el.y}%;transform:translate(-50%,-50%) scale(${el.scale}) rotate(${el.rotate}deg);cursor:move;user-select:none;touch-action:none;transition:0.1s`;

    if(el.type === 'text'){
      const colorStyle = el.gradient ? 'background:linear-gradient(135deg,#FF2D7A,#00E5FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text' : `color:${el.color}`;
      div.innerHTML = `<div style="font-family:${el.fontFamily};font-weight:${el.fontWeight};font-size:24px;text-align:center;white-space:nowrap;padding:4px 8px;${colorStyle};text-shadow:0 2px 4px rgba(0,0,0,0.3)">${esc(el.text)}</div>`;
    } else if(el.type === 'sticker'){
      if(el.isText){
        div.innerHTML = `<div style="font-family:${el.fontFamily};font-weight:${el.fontWeight};font-size:${el.fontSize}px;color:${el.color};background:${el.bg};padding:${el.padding};border-radius:${el.borderRadius};white-space:nowrap">${esc(el.text)}</div>`;
      } else {
        div.innerHTML = `<div style="font-size:${el.fontSize}px">${esc(el.text)}</div>`;
      }
    } else if(el.type === 'poll'){
      // Support both new (options[]) and legacy (optionA/optionB) format
      const opts = el.options || [el.optionA || 'Yes', el.optionB || 'No'];
      const optsHtml = opts.map(o => `<div style="flex:1;padding:8px;background:rgba(255,255,255,0.1);border-radius:10px;font-size:12px;color:#fff;text-align:center;min-width:60px">${esc(o)}</div>`).join('');
      const flexDir = opts.length > 2 ? 'column' : 'row';
      const style = _POLL_STYLES[el.style || 0] || _POLL_STYLES[0];
      div.innerHTML = `<div style="background:${style.bg};backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:16px;min-width:200px;text-align:center"><div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:10px">${esc(el.question)}</div><div style="display:flex;flex-direction:${flexDir};gap:8px">${optsHtml}</div>${el.multiVote ? '<div style="margin-top:6px;font-size:9px;color:rgba(255,255,255,0.6)">Multi-vote</div>' : ''}</div>`;
    } else {
      // mention, location, hashtag, link
      div.innerHTML = `<div style="font-family:${el.fontFamily||'-apple-system, sans-serif'};font-weight:${el.fontWeight||600};font-size:${el.fontSize||16}px;color:${el.color||'#fff'};background:${el.bg||'rgba(0,0,0,0.3)'};padding:${el.padding||'6px 12px'};border-radius:${el.borderRadius||'8px'};white-space:nowrap">${esc(el.text)}</div>`;
    }

    // Double tap for text edit
    div.ondblclick = () => {
      if(el.type === 'text'){
        seEditingTextId = el.id;
        document.getElementById('se-text-input').value = el.text;
        seCurrentFont = el.font;
        seCurrentTextColor = el.color;
        seOpenTextTool();
      }
    };

    // Drag
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let elStartX = 0, elStartY = 0;

    div.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isDragging = true;
      const t = e.touches[0];
      const canvasRect = document.getElementById('se-canvas-area').getBoundingClientRect();
      dragStartX = t.clientX;
      dragStartY = t.clientY;
      elStartX = el.x;
      elStartY = el.y;
      div.style.transition = 'none';
      // Show delete zone
      showDeleteZone();
    }, {passive: true});

    div.addEventListener('touchmove', (e) => {
      if(!isDragging) return;
      e.preventDefault();
      const t = e.touches[0];
      const canvasRect = document.getElementById('se-canvas-area').getBoundingClientRect();
      const dx = ((t.clientX - dragStartX) / canvasRect.width) * 100;
      const dy = ((t.clientY - dragStartY) / canvasRect.height) * 100;
      el.x = Math.max(5, Math.min(95, elStartX + dx));
      el.y = Math.max(5, Math.min(95, elStartY + dy));
      div.style.left = el.x + '%';
      div.style.top = el.y + '%';

      // Check delete zone
      const deleteZone = document.getElementById('se-delete-zone');
      if(deleteZone){
        const dzRect = deleteZone.getBoundingClientRect();
        if(t.clientY > dzRect.top && t.clientY < dzRect.bottom && t.clientX > dzRect.left && t.clientX < dzRect.right){
          deleteZone.style.background = 'rgba(255,45,122,0.3)';
          deleteZone.style.transform = 'scale(1.1)';
        } else {
          deleteZone.style.background = 'rgba(0,0,0,0.6)';
          deleteZone.style.transform = 'scale(1)';
        }
      }
    }, {passive: false});

    div.addEventListener('touchend', (e) => {
      if(!isDragging) return;
      isDragging = false;
      div.style.transition = '0.1s';

      // Check if in delete zone
      const deleteZone = document.getElementById('se-delete-zone');
      if(deleteZone){
        const t = e.changedTouches[0];
        const dzRect = deleteZone.getBoundingClientRect();
        if(t.clientY > dzRect.top && t.clientY < dzRect.bottom && t.clientX > dzRect.left && t.clientX < dzRect.right){
          // Delete element
          storyEditorElements = storyEditorElements.filter(e => e.id !== el.id);
          renderStoryElements();
          toast('Deleted');
        }
      }
      hideDeleteZone();
    });

    // Mouse drag
    div.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      elStartX = el.x;
      elStartY = el.y;
      div.style.transition = 'none';
      showDeleteZone();
    });

    document.addEventListener('mousemove', (e) => {
      if(!isDragging) return;
      const canvasRect = document.getElementById('se-canvas-area').getBoundingClientRect();
      const dx = ((e.clientX - dragStartX) / canvasRect.width) * 100;
      const dy = ((e.clientY - dragStartY) / canvasRect.height) * 100;
      el.x = Math.max(5, Math.min(95, elStartX + dx));
      el.y = Math.max(5, Math.min(95, elStartY + dy));
      div.style.left = el.x + '%';
      div.style.top = el.y + '%';
    });

    document.addEventListener('mouseup', () => {
      if(isDragging){
        isDragging = false;
        div.style.transition = '0.1s';
        hideDeleteZone();
      }
    });

    container.appendChild(div);
  });
};
