/**
 * NovaSocial Avatar Creator feature.
 *
 * Extracted as a classic script while Security Center and later Nova Ultra
 * features remain inline for independent guarded checkpoints.
 */
// ── AVATAR CREATOR ──────────────────────────────────────
function showAvatarCreator(){
  const m = modal('🧑‍🎤 Avatar Creator');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="text-align:center;padding:10px 0 20px">
        <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7afdff,#fc007c);display:flex;align-items:center;justify-content:center;font-size:50px;margin:0 auto 14px">🧑‍🎤</div>
        <div style="font-weight:800;font-size:18px">Create Your Avatar</div>
        <div style="color:#888;font-size:12px;margin-top:4px">3D avatar jo tumhare comments aur stories me dikhega</div>
      </div>

      <div style="background:rgba(122,253,255,0.05);border:1px solid rgba(122,253,255,0.15);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;font-size:13px;color:#7afdff;margin-bottom:8px">✨ Avatar Features</div>
        <div style="font-size:12px;color:#aaa;line-height:1.8">
          🎨 Customizable appearance<br>
          🗣️ Talking avatar (AI voice)<br>
          💬 Auto-comments on posts<br>
          🎭 Animated reactions<br>
          📸 Stories pe reactions<br>
          🌈 Custom backgrounds
        </div>
      </div>

      <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:10px">🎨 CUSTOMIZE</div>

      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="font-size:11px;color:#666;margin-bottom:8px">Face Style</div>
        <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none">
          ${['😎','🤓','🥸','🤠','👩‍🎤','👨‍🎤','🦸','🦹'].map((e,i)=>`
            <div onclick="this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='#222');this.style.borderColor='#E1306C'" style="width:50px;height:50px;border-radius:14px;background:#1a1a1a;border:2px solid ${i===0?'#E1306C':'#222'};display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;flex-shrink:0">${e}</div>
          `).join('')}
        </div>
      </div>

      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:10px">
        <div style="font-size:11px;color:#666;margin-bottom:8px">Background</div>
        <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none">
          ${[
            'linear-gradient(135deg,#833AB4,#E1306C)',
            'linear-gradient(135deg,#7afdff,#fc007c)',
            'linear-gradient(135deg,#00ff88,#00ddff)',
            'linear-gradient(135deg,#a855f7,#ec4899)',
            'linear-gradient(135deg,#ff6b35,#f7931e)',
            'linear-gradient(135deg,#000,#333)'
          ].map((g,i)=>`
            <div onclick="this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='#222');this.style.borderColor='#E1306C'" style="width:50px;height:50px;border-radius:14px;background:${g};border:2px solid ${i===0?'#E1306C':'#222'};cursor:pointer;flex-shrink:0"></div>
          `).join('')}
        </div>
      </div>

      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px">
        <div style="font-size:11px;color:#666;margin-bottom:8px">Voice Style (for talking avatar)</div>
        <select class="inp" style="padding:8px">
          <option>Male - Deep</option>
          <option>Male - Friendly</option>
          <option>Female - Soft</option>
          <option>Female - Energetic</option>
          <option>Robotic</option>
          <option>Cartoon</option>
        </select>
      </div>

      <button class="bgrd" onclick="saveAvatar()" style="width:100%;padding:14px">💾 Save Avatar</button>
    </div>
  `;
}

function saveAvatar(){
  toast('🧑‍🎤 Avatar saved! Ab tumhare comments me avatar dikhega.');
  closeModal();
}
