// Story Poll Addon UI and editor-element helper.
function seAddPoll(){
  // Build a DEDICATED modal (avoid shared se-addon-input state pollution)
  let modal = document.getElementById('se-poll-modal');
  if(modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'se-poll-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn 0.25s ease';

  modal.innerHTML = `
    <div style="background:linear-gradient(180deg,#0F0F14 0%,#0A0A0A 100%);border-radius:24px 24px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom));width:100%;max-width:440px;max-height:92vh;overflow-y:auto;border-top:1px solid rgba(255,255,255,0.08);box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1)">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#FF2D7A,#833AB4);display:flex;align-items:center;justify-content:center">${ico('poll','#fff',20)}</div>
          <div>
            <div style="font-size:17px;font-weight:800;color:#fff;letter-spacing:-0.3px">Create Poll</div>
            <div style="font-size:11px;color:#8A8A8A;font-weight:500">Ask your audience</div>
          </div>
        </div>
        <div onclick="closePollModal()" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">${ico('close','#fff',18)}</div>
      </div>

      <!-- Templates -->
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;letter-spacing:0.5px;text-transform:uppercase">Quick Templates</div>
        <div id="se-poll-templates" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch"></div>
      </div>

      <!-- Question -->
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:6px;letter-spacing:0.5px;text-transform:uppercase">Question</div>
        <input id="se-poll-q" placeholder="Ask something..." style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:13px 16px;color:#fff;font-size:15px;outline:none;transition:0.2s;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,45,122,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)';_sePollQuestion=this.value" oninput="_sePollQuestion=this.value;updatePollPreview()">
      </div>

      <!-- Options -->
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:11px;color:#8A8A8A;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Options <span id="se-poll-count" style="color:#FF2D7A;font-weight:800">2</span> / 5</div>
        </div>
        <div id="se-poll-opts" style="display:flex;flex-direction:column;gap:8px"></div>
        <div id="se-poll-add-btn" onclick="sePollAddOption()" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border:1.5px dashed rgba(255,45,122,0.5);border-radius:14px;color:#FF2D7A;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px;transition:0.2s;user-select:none;-webkit-user-select:none" onmouseover="this.style.background='rgba(255,45,122,0.08)';this.style.borderColor='rgba(255,45,122,0.8)'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,45,122,0.5)'">
          <div style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#FF2D7A;color:#fff;font-size:14px;font-weight:900;line-height:1">+</div>
          <span>Add Option</span>
        </div>
      </div>

      <!-- Style Picker -->
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;letter-spacing:0.5px;text-transform:uppercase">Card Style</div>
        <div id="se-poll-styles" style="display:flex;gap:8px"></div>
      </div>

      <!-- Settings -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;margin-bottom:16px">
        <div>
          <div style="font-size:13px;color:#fff;font-weight:700">Allow Multiple Votes</div>
          <div style="font-size:11px;color:#8A8A8A;margin-top:2px">Users can pick more than one option</div>
        </div>
        <div id="se-poll-multivote-toggle" onclick="togglePollMultiVote()" style="width:44px;height:26px;border-radius:13px;background:rgba(255,255,255,0.1);position:relative;cursor:pointer;transition:0.25s">
          <div id="se-poll-multivote-knob" style="position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:0.25s cubic-bezier(0.4,0,0.2,1);box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>
        </div>
      </div>

      <!-- Live Preview -->
      <div style="margin-bottom:16px">
        <div style="font-size:11px;color:#8A8A8A;font-weight:700;margin-bottom:8px;letter-spacing:0.5px;text-transform:uppercase">Live Preview</div>
        <div id="se-poll-preview" style="background:rgba(0,0,0,0.3);border-radius:14px;padding:14px;display:flex;justify-content:center"></div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:10px">
        <button onclick="closePollModal()" style="flex:1;padding:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:14px;color:#8A8A8A;font-weight:700;font-size:14px;cursor:pointer;transition:0.2s">Cancel</button>
        <button id="se-poll-create-btn" onclick="sePollCreate()" style="flex:2;padding:14px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:14px;color:#fff;font-weight:800;font-size:14px;cursor:pointer;transition:0.2s;box-shadow:0 4px 14px rgba(255,45,122,0.4)">Create Poll</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closePollModal();
  });

  // Render initial state
  _sePollOptions = ['Yes', 'No'];
  _sePollQuestion = '';
  _sePollStyle = 0;
  _sePollMultiVote = false;

  sePollRenderTemplates();
  sePollRenderStyles();
  sePollRenderOptions();
  updatePollPreview();

  // Focus question input after animation
  setTimeout(() => {
    const q = document.getElementById('se-poll-q');
    if(q) q.focus();
  }, 350);
}


function sePollRenderTemplates(){
  const container = document.getElementById('se-poll-templates');
  if(!container) return;
  container.innerHTML = _POLL_TEMPLATES.map((t, i) => `
    <div onclick="applyPollTemplate(${i})" style="flex-shrink:0;padding:8px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:20px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.2s;white-space:nowrap" onmouseover="this.style.background='rgba(255,45,122,0.2)';this.style.borderColor='rgba(255,45,122,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.borderColor='rgba(255,255,255,0.08)'">${t.name}</div>
  `).join('');
}

function applyPollTemplate(idx){
  const t = _POLL_TEMPLATES[idx];
  if(!t) return;
  _sePollQuestion = t.q;
  _sePollOptions = [...t.opts];
  const qInp = document.getElementById('se-poll-q');
  if(qInp) qInp.value = t.q;
  sePollRenderOptions();
  updatePollPreview();
  toast('Template applied');
}

function sePollRenderStyles(){
  const container = document.getElementById('se-poll-styles');
  if(!container) return;
  container.innerHTML = _POLL_STYLES.map((s, i) => `
    <div onclick="selectPollStyle(${i})" style="flex:1;height:48px;border-radius:12px;background:${s.preview};cursor:pointer;border:2px solid ${i === _sePollStyle ? '#fff' : 'transparent'};transition:0.2s;position:relative" title="${s.name}">
      ${i === _sePollStyle ? '<div style="position:absolute;top:4px;right:4px;width:16px;height:16px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:#FF2D7A;font-size:10px;font-weight:900">✓</div>' : ''}
    </div>
  `).join('');
}

function selectPollStyle(idx){
  _sePollStyle = idx;
  sePollRenderStyles();
  updatePollPreview();
}

function togglePollMultiVote(){
  _sePollMultiVote = !_sePollMultiVote;
  const toggle = document.getElementById('se-poll-multivote-toggle');
  const knob = document.getElementById('se-poll-multivote-knob');
  if(_sePollMultiVote){
    toggle.style.background = 'linear-gradient(135deg,#FF2D7A,#833AB4)';
    knob.style.left = '21px';
  } else {
    toggle.style.background = 'rgba(255,255,255,0.1)';
    knob.style.left = '3px';
  }
}

function sePollRenderOptions(){
  const container = document.getElementById('se-poll-opts');
  if(!container) return;
  container.innerHTML = '';
  _sePollOptions.forEach((opt, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;animation:slideInLeft 0.25s ease';
    const canRemove = _sePollOptions.length > 2;
    row.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,45,122,0.15);color:#FF2D7A;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
      <input value="${opt.replace(/"/g,'&quot;')}" placeholder="Option ${i+1}" oninput="_sePollOptions[${i}]=this.value;updatePollPreview()" style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:11px 14px;color:#fff;font-size:14px;outline:none;transition:0.2s;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,45,122,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
      ${canRemove ? `<div onclick="sePollRemoveOption(${i})" style="cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(255,45,122,0.15);border-radius:10px;color:#FF2D7A;font-size:18px;font-weight:600;flex-shrink:0;transition:0.2s" onmouseover="this.style.background='rgba(255,45,122,0.3)'" onmouseout="this.style.background='rgba(255,45,122,0.15)'">×</div>` : ''}
    `;
    container.appendChild(row);
  });
  // Update count
  const count = document.getElementById('se-poll-count');
  if(count) count.textContent = _sePollOptions.length;
  // Show/hide add button
  const addBtn = document.getElementById('se-poll-add-btn');
  if(addBtn) addBtn.style.display = _sePollOptions.length >= 5 ? 'none' : 'flex';
}

function sePollAddOption(){
  if(_sePollOptions.length >= 5) {
    toast('Maximum 5 options allowed');
    return;
  }
  // Capture current input values
  document.querySelectorAll('#se-poll-opts input').forEach((inp, i) => {
    _sePollOptions[i] = inp.value;
  });
  _sePollOptions.push('');
  sePollRenderOptions();
  updatePollPreview();
  // Focus the new input
  setTimeout(() => {
    const inputs = document.querySelectorAll('#se-poll-opts input');
    if(inputs.length > 0) inputs[inputs.length - 1].focus();
  }, 50);
  // Haptic-style visual feedback
  if(navigator.vibrate) navigator.vibrate(10);
}

function sePollRemoveOption(idx){
  if(_sePollOptions.length <= 2) return;
  document.querySelectorAll('#se-poll-opts input').forEach((inp, i) => {
    _sePollOptions[i] = inp.value;
  });
  _sePollOptions.splice(idx, 1);
  sePollRenderOptions();
  updatePollPreview();
  if(navigator.vibrate) navigator.vibrate(10);
}

function updatePollPreview(){
  const preview = document.getElementById('se-poll-preview');
  if(!preview) return;
  const q = _sePollQuestion || 'Your question';
  const opts = _sePollOptions.filter(o => o && o.trim());
  const displayOpts = opts.length >= 2 ? opts : ['Option A', 'Option B'];
  const style = _POLL_STYLES[_sePollStyle] || _POLL_STYLES[0];
  const flexDir = displayOpts.length > 2 ? 'column' : 'row';

  preview.innerHTML = `
    <div style="background:${style.bg};backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.2);border-radius:18px;padding:14px 16px;min-width:220px;max-width:280px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;justify-content:center">
        <span style="display:flex;align-items:center">${ico('poll','#FF2D7A',16)}</span>
        <div style="font-size:13px;font-weight:700;color:#fff">${q}</div>
      </div>
      <div style="display:flex;flex-direction:${flexDir};gap:8px">
        ${displayOpts.map(o => `
          <div style="flex:1;padding:10px 12px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);border-radius:10px;font-size:12px;color:#fff;font-weight:600;text-align:center">${o}</div>
        `).join('')}
      </div>
      <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.6)">${_sePollMultiVote ? 'Multi-vote' : 'Single vote'} · Tap to vote</div>
    </div>
  `;
}

function sePollCreate(){
  // Guard against double-clicks (modal stays in DOM during fade-out animation)
  const btn = document.getElementById('se-poll-create-btn');
  if(btn){
    if(btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
  }

  // Capture current values from inputs
  document.querySelectorAll('#se-poll-opts input').forEach((inp, i) => {
    _sePollOptions[i] = inp.value;
  });
  const q = (_sePollQuestion || '').trim() || 'Poll';
  const options = _sePollOptions.map(o => (o || '').trim()).filter(o => o);

  if(options.length < 2){
    toast('At least 2 options required');
    if(btn){ btn.dataset.busy = '0'; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    return;
  }

  storyEditorElements.push({
    id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
    type: 'poll',
    question: q,
    options: options,
    style: _sePollStyle,
    multiVote: _sePollMultiVote,
    x: 50, y: 60, scale: 1, rotate: 0,
  });
  renderStoryElements();
  closePollModal();
  toast('Poll added! 📊');
  if(navigator.vibrate) navigator.vibrate([10, 30, 10]);
}

function closePollModal(){
  const modal = document.getElementById('se-poll-modal');
  if(!modal) return;
  // Immediately hide to prevent further interaction, then animate out
  modal.style.pointerEvents = 'none';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.2s ease';
  setTimeout(() => modal.remove(), 200);
}
