// showCreateStory — extracted from index.html
// Owner SHA-256: 0c8b3b3d8d0437a579790283dca63e4758cc8a0d8627a314e5c0aa40254dae8a
// Classic script — exposes window.showCreateStory

window.showCreateStory = function showCreateStory() {
  // Full screen story editor
  const editor = document.createElement('div');
  editor.id = 'story-editor';
  editor.style.cssText = 'position:fixed;inset:0;z-index:9500;background:#000;display:flex;flex-direction:column;animation:novaFadeIn 0.3s ease';

  editor.innerHTML = `
    <!-- Top Bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;z-index:10;position:absolute;top:0;left:0;right:0;background:linear-gradient(180deg,rgba(0,0,0,0.6),transparent)">
      <div onclick="closeStoryEditor()" style="width:36px;height:36px;border-radius:12px;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('close','#fff',20)}</div>
      <div style="font-weight:700;font-size:16px;color:#fff">Story</div>
      <div style="display:flex;gap:8px">
        <div onclick="undoStoryEditor()" style="width:36px;height:36px;border-radius:12px;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;display:none" id="se-undo-btn">${ico('back','#fff',18)}</div>
        <div onclick="pickStoryMedia()" style="width:36px;height:36px;border-radius:12px;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer">${ico('img','#fff',18)}</div>
      </div>
    </div>

    <!-- Canvas Area with visible zone border -->
    <div id="se-canvas-area" style="flex:1;position:relative;overflow:hidden;background:#0A0A0A;border:2px dashed rgba(255,45,122,0.15);margin:8px;border-radius:16px" onclick="deselectStoryElement(event)">
      <!-- Zone label -->
      <div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:10px;color:rgba(255,45,122,0.3);font-weight:600;letter-spacing:1px;z-index:2;pointer-events:none">STORY CANVAS</div>
      <!-- Media (image/video) -->
      <div id="se-media-container" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden" onclick="pickStoryMedia()">
        <div style="text-align:center">
          <div style="margin-bottom:14px">${ico('cam','#333',56)}</div>
          <div style="color:#555;font-size:14px">Tap to add photo or video</div>
        </div>
      </div>
      <!-- Drawing canvas overlay -->
      <canvas id="se-draw-canvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></canvas>
      <!-- Elements container -->
      <div id="se-elements" style="position:absolute;inset:0;z-index:6"></div>
      <!-- Background overlay -->
      <div id="se-bg-overlay" style="position:absolute;inset:0;z-index:1;pointer-events:none"></div>
    </div>

    <!-- Music Bar (hidden by default) -->
    <div id="se-music-bar" style="display:none;position:absolute;bottom:140px;left:16px;right:16px;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border-radius:12px;padding:8px 12px;z-index:10;align-items:center;gap:8px">
      <div style="font-size:16px">♪</div>
      <div id="se-music-info" style="flex:1;font-size:12px;color:#fff">No music</div>
      <div onclick="removeStoryMusic()" style="cursor:pointer;color:#FF2D7A;font-size:16px">×</div>
    </div>

    <!-- Right Side Toolbar -->
    <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:10">
      <div onclick="seOpenTextTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" id="se-tool-text">${ico('edit','#fff',18)}</div>
      <div onclick="seOpenDrawTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" id="se-tool-draw">${ico('paint','#fff',18)}</div>
      <div onclick="seOpenStickerTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" id="se-tool-sticker">${ico('smile','#fff',18)}</div>
      <div onclick="seOpenMusicTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" id="se-tool-music">${ico('music','#fff',18)}</div>
      <div onclick="seOpenBgTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" id="se-tool-bg">${ico('palette','#fff',18)}</div>
    </div>

    <!-- Bottom Addon Row -->
    <div style="position:absolute;bottom:80px;left:0;right:0;display:flex;justify-content:center;gap:12px;padding:0 16px;z-index:10;overflow-x:auto;scrollbar-width:none">
      <div onclick="seAddPoll()" style="flex-shrink:0;padding:8px 14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.25s">Poll</div>
      <div onclick="seAddMention()" style="flex-shrink:0;padding:8px 14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.25s">Mention</div>
      <div onclick="seAddLocation()" style="flex-shrink:0;padding:8px 14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.25s">Location</div>
      <div onclick="seAddHashtag()" style="flex-shrink:0;padding:8px 14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.25s">Hashtag</div>
      <div onclick="seAddLink()" style="flex-shrink:0;padding:8px 14px;background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-radius:12px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:0.25s">Link</div>
    </div>

    <!-- Share Button -->
    <div style="position:absolute;bottom:16px;right:16px;z-index:10">
      <button onclick="publishStoryEditor()" style="padding:12px 24px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:24px;color:#fff;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(255,45,122,0.4);display:flex;align-items:center;gap:6px;transition:0.25s">Share Story ${ico('arrow_right','#fff',16)}</button>
    </div>

    <!-- Close Friends Toggle -->
    <div style="position:absolute;bottom:20px;left:16px;z-index:10;display:flex;align-items:center;gap:8px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="se-cf-toggle" style="opacity:0;width:0;height:0;position:absolute">
        <span id="se-cf-slider" style="width:40px;height:22px;background:rgba(255,255,255,0.15);border-radius:22px;position:relative;transition:0.3s">
          <span style="position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:0.3s"></span>
        </span>
        <span style="font-size:12px;color:#8A8A8A;font-weight:600">Close Friends</span>
      </label>
    </div>

    <!-- Tool Panels (overlays) -->
    <div id="se-text-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);border-radius:24px 24px 0 0;padding:16px;z-index:20;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none">
        ${['Modern','Bold','Serif','Script','Mono','Black'].map((f,i)=>`<div onclick="seSelectFont(${i})" class="se-font-opt" data-font="${i}" style="flex-shrink:0;padding:8px 14px;background:${i===0?'linear-gradient(135deg,#FF2D7A,#833AB4)':'rgba(255,255,255,0.04)'};color:${i===0?'#fff':'#8A8A8A'};border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:0.2s;font-family:${['-apple-system','sans-serif','serif','cursive','monospace','sans-serif'][i]};font-weight:${[400,800,400,400,400,900][i]}">${f}</div>`).join('')}
      </div>
      <input id="se-text-input" placeholder="Type something..." style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 16px;color:#fff;font-size:16px;outline:none;margin-bottom:14px" oninput="seUpdateTextPreview(this.value)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">
        ${['#FFFFFF','#FF2D7A','#00E5FF','#FFD700','#3DB83D','#FF6B35','#A855F7','#EC4899','#000000','#8A8A8A'].map(c=>`<div onclick="seSelectTextColor('${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,0.1);transition:0.2s" class="se-color-opt"></div>`).join('')}
        <div onclick="seToggleGradientText()" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#FF2D7A,#00E5FF);cursor:pointer;border:2px solid rgba(255,255,255,0.3);font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px">G</div>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="seConfirmText()" style="flex:1;padding:12px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:14px;color:#fff;font-weight:700;font-size:14px;cursor:pointer">Add Text</button>
        <button onclick="seCloseTextPanel()" style="padding:12px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;color:#8A8A8A;font-weight:600;font-size:14px;cursor:pointer">Cancel</button>
      </div>
    </div>

    <!-- Draw Panel -->
    <div id="se-draw-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);border-radius:24px 24px 0 0;padding:16px;z-index:20;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;gap:8px;margin-bottom:14px;justify-content:center">
        <div onclick="seSelectDrawType('pen')" class="se-draw-type" data-type="pen" style="padding:8px 16px;background:linear-gradient(135deg,#FF2D7A,#833AB4);color:#fff;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">Pen</div>
        <div onclick="seSelectDrawType('marker')" class="se-draw-type" data-type="marker" style="padding:8px 16px;background:rgba(255,255,255,0.04);color:#8A8A8A;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">Marker</div>
        <div onclick="seSelectDrawType('neon')" class="se-draw-type" data-type="neon" style="padding:8px 16px;background:rgba(255,255,255,0.04);color:#8A8A8A;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">Neon</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;justify-content:center">
        ${['#FFFFFF','#FF2D7A','#00E5FF','#FFD700','#3DB83D','#FF6B35','#A855F7','#EC4899','#000000'].map(c=>`<div onclick="seSelectDrawColor('${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,0.1);transition:0.2s" class="se-dcolor-opt"></div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <span style="font-size:12px;color:#8A8A8A">Size</span>
        <input type="range" min="2" max="28" value="4" id="se-brush-size" oninput="storyEditorDrawSize=parseInt(this.value)" style="flex:1;accent-color:#FF2D7A">
        <span id="se-brush-val" style="font-size:12px;color:#8A8A8A;width:24px">4</span>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="seUndoDraw()" style="flex:1;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;color:#fff;font-weight:600;font-size:14px;cursor:pointer">Undo</button>
        <button onclick="seCloseDrawPanel()" style="flex:1;padding:12px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:14px;color:#fff;font-weight:700;font-size:14px;cursor:pointer">Done</button>
      </div>
    </div>

    <!-- Sticker Panel -->
    <div id="se-sticker-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);border-radius:24px 24px 0 0;padding:16px;z-index:20;border-top:1px solid rgba(255,255,255,0.08);max-height:50vh;overflow-y:auto">
      <div style="font-size:13px;color:#8A8A8A;font-weight:600;margin-bottom:12px">Stickers</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:16px">
        ${['❤️','🔥','✨','😍','💯','🎉','👏','💎','🚀','🌟','💜','💙','🌈','🎨','⚡','🎯','👑','💫','🦋','🌸','🎮','📷','🎬','🍕','☕','🎧','📱','💡','🌈','⭐'].map(e=>`<div onclick="seAddSticker('${e}')" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;background:rgba(255,255,255,0.04);border-radius:12px;transition:0.2s">${e}</div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <input id="se-custom-sticker" placeholder="Type custom text..." style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:#fff;font-size:14px;outline:none">
        <button onclick="seAddCustomSticker()" style="padding:12px 18px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:12px;color:#fff;font-weight:700;font-size:13px;cursor:pointer">Add</button>
      </div>
      <button onclick="seCloseStickerPanel()" style="width:100%;margin-top:10px;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#8A8A8A;font-weight:600;font-size:13px;cursor:pointer">Close</button>
    </div>

    <!-- Music Panel -->
    <div id="se-music-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);border-radius:24px 24px 0 0;padding:16px;z-index:20;border-top:1px solid rgba(255,255,255,0.08);max-height:50vh;overflow-y:auto">
      <div style="font-size:13px;color:#8A8A8A;font-weight:600;margin-bottom:12px">Add Music</div>
      ${[
        {title:'Lofi Beats', artist:'Nova Radio'},
        {title:'Cyber Dreams', artist:'Synthwave'},
        {title:'Midnight City', artist:'Neon Lights'},
        {title:'Electric Pulse', artist:'DJ Nova'},
        {title:'Starlight', artist:'Aurora'},
        {title:'Digital Love', artist:'Cyber Pop'},
        {title:'Future Bass', artist:'EDM Mix'},
        {title:'Chill Vibes', artist:'Lo-Fi Girl'},
      ].map((m,i)=>`<div onclick="seSelectMusic(${i})" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:8px;cursor:pointer;transition:0.2s">
        <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#FF2D7A,#00E5FF);display:flex;align-items:center;justify-content:center;font-size:18px">♪</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:600;color:#fff">${m.title}</div><div style="font-size:12px;color:#8A8A8A">${m.artist}</div></div>
        <div style="color:#FF2D7A;font-size:20px">+</div>
      </div>`).join('')}
      <button onclick="seCloseMusicPanel()" style="width:100%;margin-top:10px;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#8A8A8A;font-weight:600;font-size:13px;cursor:pointer">Close</button>
    </div>

    <!-- Background Panel -->
    <div id="se-bg-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.95);backdrop-filter:blur(28px);border-radius:24px 24px 0 0;padding:16px;z-index:20;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="font-size:13px;color:#8A8A8A;font-weight:600;margin-bottom:12px">Background</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[
          'linear-gradient(135deg,#FF2D7A,#833AB4)',
          'linear-gradient(135deg,#00E5FF,#833AB4)',
          'linear-gradient(135deg,#FFD700,#FF6B35)',
          'linear-gradient(135deg,#3DB83D,#00E5FF)',
          'linear-gradient(135deg,#EC4899,#A855F7)',
          'linear-gradient(135deg,#0A0A0A,#1A1A2E)',
          'linear-gradient(135deg,#FF2D7A,#FFD700)',
          'linear-gradient(135deg,#00E5FF,#FF2D7A)',
          'linear-gradient(180deg,#0A0A0A,#FF2D7A)',
          'linear-gradient(180deg,#0A0A0A,#00E5FF)',
          'linear-gradient(45deg,#833AB4,#FF2D7A,#00E5FF)',
          'linear-gradient(135deg,#1A1A2E,#16213E)',
        ].map((g,i)=>`<div onclick="seSelectBg('${g.replace(/'/g,"\\'")}',${i})" style="aspect-ratio:1;border-radius:14px;background:${g};cursor:pointer;border:2px solid rgba(255,255,255,0.1);transition:0.2s" class="se-bg-opt"></div>`).join('')}
      </div>
      <button onclick="seCloseBgPanel()" style="width:100%;margin-top:10px;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#8A8A8A;font-weight:600;font-size:13px;cursor:pointer">Close</button>
    </div>

    <!-- Input modal for addons -->
    <div id="se-addon-input" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:30;align-items:center;justify-content:center;padding:20px">
      <div style="background:#0A0A0A;border-radius:20px;padding:20px;width:100%;max-width:340px;border:1px solid rgba(255,255,255,0.08)">
        <div id="se-addon-title" style="font-weight:700;font-size:16px;color:#fff;margin-bottom:14px"></div>
        <div id="se-addon-fields"></div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button onclick="closeSeAddon()" style="flex:1;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#8A8A8A;font-weight:600;cursor:pointer">Cancel</button>
          <button id="se-addon-confirm" style="flex:1;padding:12px;background:linear-gradient(135deg,#FF2D7A,#833AB4);border:none;border-radius:12px;color:#fff;font-weight:700;cursor:pointer">Add</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(editor);

  // Initialize canvas
  storyEditorCanvas = document.getElementById('se-draw-canvas');
  const rect = document.getElementById('se-canvas-area').getBoundingClientRect();
  storyEditorCanvas.width = rect.width;
  storyEditorCanvas.height = rect.height;
  storyEditorDrawCtx = storyEditorCanvas.getContext('2d');

  // Reset state
  storyEditorElements = [];
  storyEditorMedia = null;
  storyEditorBg = null;
  storyEditorMusic = null;
  storyEditorUndoStack = [];

  // CF toggle
  const cfToggle = document.getElementById('se-cf-toggle');
  const cfSlider = document.getElementById('se-cf-slider');
  if(cfToggle && cfSlider){
    cfToggle.onchange = function(){
      const knob = cfSlider.querySelector('span');
      if(this.checked){
        cfSlider.style.background = 'linear-gradient(135deg,#FF2D7A,#833AB4)';
        knob.style.left = '21px';
      } else {
        cfSlider.style.background = 'rgba(255,255,255,0.15)';
        knob.style.left = '3px';
      }
    };
  }

  // Brush size display
  const brushSlider = document.getElementById('se-brush-size');
  if(brushSlider){
    brushSlider.oninput = function(){
      storyEditorDrawSize = parseInt(this.value);
      document.getElementById('se-brush-val').textContent = this.value;
    };
  }

  // Setup drawing events
  setupStoryDrawing();
};
