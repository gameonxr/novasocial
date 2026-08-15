/**
 * NovaSocial Channels feature.
 *
 * Extracted as a classic script; its localStorage-backed state and inline
 * handlers remain window-global while Communities stays inline.
 */
// ── CHANNELS (Functional - localStorage based) ──────────────────────────────────────
try { myChannels = JSON.parse(localStorage.getItem('nova-channels') || '[]'); } catch(e) {}

function showChannels(){
  const m = modal('📺 Channels');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:15px">📺 My Channels</div>
          <div style="font-size:11px;color:#666">Broadcast to unlimited subscribers</div>
        </div>
        <button onclick="createChannel()" class="bgrd" style="padding:8px 14px;font-size:12px;width:auto;border-radius:10px">+ New</button>
      </div>

      ${myChannels.length === 0 ? `
        <div style="padding:30px 20px;text-align:center;color:#666">
          <div style="font-size:48px;margin-bottom:12px">📺</div>
          <div style="font-weight:700;color:#fff;margin-bottom:6px">No channels yet</div>
          <div style="font-size:12px;margin-bottom:14px">Channels se unlimited logon tak broadcast karo</div>
          <button onclick="createChannel()" class="bgrd" style="padding:10px 24px">Create Channel</button>
        </div>
      ` : `
        ${myChannels.map((c,i) => `
          <div onclick="openChannel('${c.id}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a">
            <div style="width:48px;height:48px;border-radius:14px;background:${c.color || 'linear-gradient(135deg,#833AB4,#E1306C)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.icon || '📺'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</div>
              <div style="font-size:11px;color:#666">${c.subscribers || 0} subscribers • ${c.posts?.length || 0} posts</div>
            </div>
            <div style="color:#555;font-size:18px">${ico('chevron_right','#555',18)}</div>
          </div>
        `).join('')}
      `}

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #1a1a1a">
        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:10px">EXPLORE</div>
        ${[
          {name:'NovaSocial Updates', subs:'12.5k', verified:true, icon:'🔔', color:'linear-gradient(135deg,#833AB4,#E1306C)'},
          {name:'Tech News Daily', subs:'8.2k', verified:false, icon:'💻', color:'linear-gradient(135deg,#0095f6,#00d4ff)'},
          {name:'Gaming Highlights', subs:'5.7k', verified:true, icon:'🎮', color:'linear-gradient(135deg,#E1306C,#ff3030)'},
          {name:'Foodies Hub', subs:'3.1k', verified:false, icon:'🍔', color:'linear-gradient(135deg,#f7931e,#ffcc00)'},
        ].map(c => `
          <div onclick="subscribeChannel('${c.name}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a">
            <div style="width:48px;height:48px;border-radius:14px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.icon}</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:5px"><span style="font-weight:700;font-size:14px;color:#fff">${c.name}</span>${c.verified?ico('verified','#3897f0',13):''}</div>
              <div style="font-size:11px;color:#666">${c.subs} subscribers</div>
            </div>
            <button onclick="event.stopPropagation();subscribeChannel('${c.name}')" class="bout" style="padding:6px 14px;font-size:11px;width:auto;border-radius:8px">Subscribe</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function createChannel(){
  const m = modal('Create Channel');
  const body = m.querySelector('#mbody');
  const icons = ['📺','🔔','🎮','💻','🍔','✈️','🎵','💪','🎨','📰','🚀','💎'];
  const colors = ['linear-gradient(135deg,#833AB4,#E1306C)','linear-gradient(135deg,#0095f6,#00d4ff)','linear-gradient(135deg,#E1306C,#ff3030)','linear-gradient(135deg,#f7931e,#ffcc00)','linear-gradient(135deg,#a855f7,#ec4899)','linear-gradient(135deg,#00ff88,#00ddff)'];

  body.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Channel Name</div>
        <input id="ch-name" class="inp" placeholder="My Awesome Channel" maxlength="50">
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Description</div>
        <textarea id="ch-desc" class="inp" rows="2" placeholder="What is this channel about?" style="resize:none"></textarea>
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Icon</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${icons.map((ic,i) => `<div onclick="document.querySelectorAll('.ch-icon').forEach(d=>d.style.borderColor='#222');this.style.borderColor='#E1306C';window._chIcon='${ic}'" class="ch-icon" style="width:40px;height:40px;border-radius:10px;background:#1a1a1a;border:2px solid ${i===0?'#E1306C':'#222'};display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer">${ic}</div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Color Theme</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${colors.map((c,i) => `<div onclick="document.querySelectorAll('.ch-color').forEach(d=>d.style.outline='none');this.style.outline='2px solid #fff';window._chColor='${c}'" class="ch-color" style="width:40px;height:40px;border-radius:10px;background:${c};cursor:pointer;outline:${i===0?'2px solid #fff':'none'}"></div>`).join('')}
        </div>
      </div>
      <button class="bgrd" onclick="saveChannel()" style="padding:14px">Create Channel</button>
    </div>
  `;
  window._chIcon = '📺';
  window._chColor = colors[0];
}

function saveChannel(){
  const name = document.getElementById('ch-name')?.value.trim();
  const desc = document.getElementById('ch-desc')?.value.trim();
  if(!name){
    toast('Channel name chahiye');
    return;
  }
  const channel = {
    id: 'ch_' + Date.now(),
    name,
    description: desc,
    icon: window._chIcon || '📺',
    color: window._chColor || 'linear-gradient(135deg,#833AB4,#E1306C)',
    subscribers: 0,
    posts: [],
    createdAt: new Date().toISOString()
  };
  myChannels.push(channel);
  try { localStorage.setItem('nova-channels', JSON.stringify(myChannels)); } catch(e) {}
  toast('📺 Channel created!');
  closeModal();
  showChannels();
}

function openChannel(channelId){
  const ch = myChannels.find(c => c.id === channelId);
  if(!ch){ toast('Channel not found'); return; }

  const m = modal(ch.name);
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:0">
      <div style="padding:20px;background:${ch.color};text-align:center">
        <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 10px">${ch.icon}</div>
        <div style="font-weight:800;font-size:17px;color:#fff">${ch.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${ch.subscribers} subscribers</div>
      </div>
      ${ch.description ? `<div style="padding:14px 16px;color:#ccc;font-size:13px;border-bottom:1px solid #1a1a1a">${ch.description}</div>` : ''}

      <div style="padding:16px">
        <button onclick="broadcastToChannel('${ch.id}')" class="bgrd" style="width:100%;padding:12px;margin-bottom:14px">📢 Broadcast Message</button>

        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:10px">POSTS (${ch.posts?.length || 0})</div>
        ${!ch.posts?.length ? `
          <div style="text-align:center;padding:30px;color:#666">
            <div style="font-size:36px;margin-bottom:8px">📢</div>
            <div style="font-size:13px">No broadcasts yet</div>
          </div>
        ` : ch.posts.map(p => `
          <div style="padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;border:1px solid #1a1a1a">
            <div style="font-size:13px;color:#fff;line-height:1.5">${p.text}</div>
            <div style="font-size:10px;color:#666;margin-top:6px">${new Date(p.date).toLocaleString('en-IN')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function broadcastToChannel(channelId){
  const text = prompt('Broadcast message:');
  if(!text?.trim()) return;

  const ch = myChannels.find(c => c.id === channelId);
  if(!ch) return;

  if(!ch.posts) ch.posts = [];
  ch.posts.unshift({ text: text.trim(), date: new Date().toISOString() });
  try { localStorage.setItem('nova-channels', JSON.stringify(myChannels)); } catch(e) {}
  toast('📢 Broadcast sent!');
  closeModal();
  openChannel(channelId);
}

function subscribeChannel(name){
  toast(`✅ Subscribed to ${name}!`);
}
