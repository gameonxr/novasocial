/**
 * NovaSocial Create menu and post/reel creation entry UI.
 *
 * Kept as a classic script so inline FAB actions remain window-callable;
 * Mention, Story, and submitCreate implementations remain in index.html.
 */
function showCreateMenu() {
  const m = modal('Create');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px; display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
      <button onclick="closeModal(); showCreate('post')" class="nova-btn" style="flex-direction:column;gap:8px;padding:24px">` + ico('img','#FF2D7A',28) + `<span>Post</span></button>
      <button onclick="closeModal(); showCreate('reel')" class="nova-btn" style="flex-direction:column;gap:8px;padding:24px">` + ico('film','#00E5FF',28) + `<span>Reel</span></button>
      <button onclick="closeModal(); showCreate('story')" class="nova-btn" style="flex-direction:column;gap:8px;padding:24px">` + ico('cam','#FF2D7A',28) + `<span>Story</span></button>
      <button onclick="closeModal(); showLiveStreamUI()" class="nova-btn nova-btn-primary" style="flex-direction:column;gap:8px;padding:24px">` + ico('radio','#fff',28) + `<span>Go Live</span></button>
    </div>
  `;
}

// ── CREATE ──────────────────────────────────────
function showCreate(type){
  if(type === 'story') return showCreateStory();

  const labels={post:'New Post',reel:'New Reel'};
  const m=modal(labels[type]);
  const body=m.querySelector('#mbody');
  body.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:14px">
    <div id="mprev" onclick="document.getElementById('fpick').click()" style="aspect-ratio:1/1;background:#0A0A0A;border-radius:24px;border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative;transition:0.3s">
      <div style="margin-bottom:14px">` + ico(type==='reel'?'film':'img','#555',48) + `</div>
      <div style="color:#8A8A8A;font-size:14px;font-weight:500">Tap to select ${type==='reel'?'video':'photo/video'}</div>
    </div>
    <input id="fpick" type="file" accept="${type==='reel'?'video/*':'image/*,video/*'}" style="display:none" onchange="prevMedia(this,'${type}')">

    <!-- Edit Tools Row (Story Editor style for Post/Reel) -->
    <div id="post-edit-tools" style="display:none;flex-direction:row;gap:8px;justify-content:center;padding:8px 0">
      <div onclick="seOpenTextTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" title="Text">${ico('edit','#FF2D7A',18)}</div>
      <div onclick="seOpenDrawTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" title="Draw">${ico('paint','#00E5FF',18)}</div>
      <div onclick="seOpenStickerTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" title="Sticker">${ico('smile','#FFD700',18)}</div>
      <div onclick="showFilterTray(document.getElementById('mprev-media')?.src||'')" style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" title="Filters">${ico('palette','#A855F7',18)}</div>
      <div onclick="seOpenMusicTool()" style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.25s" title="Music">${ico('music','#3DB83D',18)}</div>
    </div>

    <div id="filter-tray" style="display:none;overflow-x:auto;padding:10px 0;gap:12px;scrollbar-width:none;"></div>

    <textarea id="capinp" placeholder="Write a caption... #hashtag @mention" rows="3" style="width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:14px 16px;color:#fff;font-size:14px;outline:none;resize:none;font-family:inherit;line-height:1.5;transition:0.25s" oninput="checkMentionInCaption(this)"></textarea>

    <!-- Mention suggestions dropdown -->
    <div id="mention-suggestions" style="display:none;max-height:200px;overflow-y:auto;background:#0A0A0A;border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-top:-8px"></div>

    <!-- AI Tools Row -->
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" onclick="generateAICaption()" style="display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1));border:1px solid rgba(255,45,122,0.2);color:#fff;font-size:12px;font-weight:600;padding:8px 12px;border-radius:12px;cursor:pointer;flex-shrink:0;transition:0.25s">` + ico('sparkles','#FF2D7A',14) + ` AI Caption</button>
      <button type="button" onclick="generateAIHashtags()" style="display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(255,45,122,0.1),rgba(0,229,255,0.1));border:1px solid rgba(0,229,255,0.2);color:#fff;font-size:12px;font-weight:600;padding:8px 12px;border-radius:12px;cursor:pointer;flex-shrink:0;transition:0.25s">` + ico('hash','#00E5FF',14) + ` AI Hashtags</button>
      <button type="button" onclick="showCollabPicker()" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;font-size:12px;font-weight:600;padding:8px 12px;border-radius:12px;cursor:pointer;flex-shrink:0;transition:0.25s">` + ico('group','#fff',14) + ` Co-Author</button>
      <button type="button" onclick="toggleScheduleMode(this)" id="sched-btn" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;font-size:12px;font-weight:600;padding:8px 12px;border-radius:12px;cursor:pointer;flex-shrink:0;transition:0.25s">` + ico('clock','#fff',14) + ` Schedule</button>
    </div>

    <!-- Schedule Input -->
    <div id="schedule-input-wrap" style="display:none;flex-direction:column;gap:8px;padding:12px;background:rgba(255,45,122,0.06);border:1px solid rgba(255,45,122,0.15);border-radius:12px">
      <div style="font-size:11px;color:#FF2D7A;font-weight:700;letter-spacing:1px">SCHEDULE POST</div>
      <input type="datetime-local" id="schedule-time" style="background:#0A0A0A;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px;color:#fff;font-size:13px;font-family:inherit;color-scheme:dark">
      <div style="font-size:11px;color:#8A8A8A">Post will be published at scheduled time</div>
    </div>

    <input id="locinp" placeholder="Add location (optional)" style="width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:14px 16px;color:#fff;font-size:14px;outline:none;transition:0.25s">
    <div id="uprog" style="display:none">
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#8A8A8A;margin-bottom:6px"><span>Uploading...</span><span id="upct">0%</span></div>
      <div class="upbar"><div class="upfill" id="upfill" style="width:0%"></div></div>
    </div>
    <button class="bgrd" id="cbtn" onclick="submitCreate('${type}')" style="opacity:0.5" disabled>Share ${type==='reel'?'Reel':'Post'}</button>
  </div>`;
}
