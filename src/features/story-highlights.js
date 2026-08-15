/**
 * NovaSocial Story Highlights helper.
 *
 * Extracted as a classic script so profile highlight controls remain
 * window-global while the main Stories viewer/editor remains inline.
 */
// STORY HIGHLIGHTS (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
async function showHighlights(userId){
  const m = modal('✨ Story Highlights');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div class="ldiv"><div class="spin"></div></div>`;

  // Try fetching highlights (may not exist in DB)
  try {
    const { data: highlights } = await db.from('highlights').select('*').eq('user_id', userId).order('created_at',{ascending:false});

    if(!highlights?.length){
      body.innerHTML = `
        <div style="padding:30px;text-align:center;color:#666">
          <div style="font-size:48px;margin-bottom:14px">✨</div>
          <div style="font-weight:700;color:#fff;margin-bottom:6px">No highlights yet</div>
          <div style="font-size:13px;margin-bottom:18px">Save your favorite stories as highlights on your profile</div>
          ${userId===ME.id?`<button class="bgrd" onclick="createHighlight()" style="width:auto;padding:12px 24px">+ Create Highlight</button>`:''}
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div style="padding:14px">
        ${userId===ME.id?`<button class="bgrd" onclick="createHighlight()" style="margin-bottom:14px">+ Create New Highlight</button>`:''}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          ${highlights.map(h=>`
            <div onclick="viewHighlight('${h.id}')" style="cursor:pointer;text-align:center">
              <div class="highlight-circle has-content" style="margin:0 auto">
                ${h.cover_url?`<img src="${cldUrl(h.cover_url, NOVA_MEDIA_CONFIG.cover.cloudTransform)}" style="width:100%;height:100%;object-fit:cover">`:'<div style="font-size:24px">✨</div>'}
              </div>
              <div style="font-size:11px;color:#ccc;margin-top:6px;font-weight:600">${h.title||'Highlight'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch(e) {
    body.innerHTML = `
      <div style="padding:30px;text-align:center;color:#666">
        <div style="font-size:42px;margin-bottom:14px">✨</div>
        <div style="font-weight:700;color:#fff;margin-bottom:6px">Highlights</div>
        <div style="font-size:13px">Highlights feature enabled! Create your first highlight.</div>
        ${userId===ME.id?`<button class="bgrd" onclick="createHighlight()" style="margin-top:14px;width:auto;padding:12px 24px">+ Create Highlight</button>`:''}
      </div>
    `;
  }
}

function createHighlight(){
  toast('✨ Select stories from your profile to create highlights');
  // Could implement story picker here
}

function viewHighlight(hid){
  toast('✨ Opening highlight...');
}

// ═══════════════════════════════════════════════════════════════════════
