/**
 * NovaSocial Communities feature.
 *
 * Extracted as a classic script so community navigation and inline handlers
 * remain window-global while Voice Rooms stays inline.
 */
// ── COMMUNITIES (Functional) ──────────────────────────────────────
try { myCommunities = JSON.parse(localStorage.getItem('nova-communities') || '[]'); } catch(e) {}

function showCommunities(){
  const m = modal('👥 Communities');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:15px">👥 My Communities</div>
          <div style="font-size:11px;color:#666">Forums, voice rooms, events</div>
        </div>
        <button onclick="createCommunity()" class="bgrd" style="padding:8px 14px;font-size:12px;width:auto;border-radius:10px">+ New</button>
      </div>

      ${myCommunities.length === 0 ? `
        <div style="padding:30px 20px;text-align:center;color:#666">
          <div style="font-size:48px;margin-bottom:12px">👥</div>
          <div style="font-weight:700;color:#fff;margin-bottom:6px">No communities yet</div>
          <div style="font-size:12px;margin-bottom:14px">Apne interest ke logon se connect karo</div>
          <button onclick="createCommunity()" class="bgrd" style="padding:10px 24px">Create Community</button>
        </div>
      ` : `
        ${myCommunities.map(c => `
          <div onclick="openCommunity('${c.id}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a">
            <div style="width:48px;height:48px;border-radius:14px;background:${c.color || 'linear-gradient(135deg,#7afdff,#fc007c)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.icon || '👥'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</div>
              <div style="font-size:11px;color:#666">${c.members || 1} members • ${c.topic || 'General'}</div>
            </div>
            <div style="color:#555">${ico('chevron_right','#555',18)}</div>
          </div>
        `).join('')}
      `}

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #1a1a1a">
        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:10px">EXPLORE</div>
        ${[
          {name:'Flutter Developers', members:'45.2k', topic:'💻 Tech', icon:'💻', color:'linear-gradient(135deg,#0095f6,#00d4ff)'},
          {name:'Punjab Foodies', members:'12.8k', topic:'🍔 Food', icon:'🍔', color:'linear-gradient(135deg,#f7931e,#ffcc00)'},
          {name:'Mumbai Gamers', members:'23.5k', topic:'🎮 Gaming', icon:'🎮', color:'linear-gradient(135deg,#a855f7,#ec4899)'},
          {name:'Travel India', members:'67.1k', topic:'✈️ Travel', icon:'✈️', color:'linear-gradient(135deg,#00ff88,#00ddff)'},
          {name:'Music Creators', members:'8.9k', topic:'🎵 Music', icon:'🎵', color:'linear-gradient(135deg,#E1306C,#833AB4)'},
          {name:'Art & Design', members:'15.3k', topic:'🎨 Art', icon:'🎨', color:'linear-gradient(135deg,#ff6b35,#f7931e)'},
        ].map(c => `
          <div onclick="joinCommunity('${c.name}')" style="display:flex;align-items:center;gap:12px;padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a">
            <div style="width:48px;height:48px;border-radius:14px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.icon}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px;color:#fff">${c.name}</div>
              <div style="font-size:11px;color:#666">${c.members} members • ${c.topic}</div>
            </div>
            <button onclick="event.stopPropagation();joinCommunity('${c.name}')" class="bout" style="padding:6px 14px;font-size:11px;width:auto;border-radius:8px">Join</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function createCommunity(){
  const m = modal('Create Community');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Community Name</div>
        <input id="cm-name" class="inp" placeholder="My Awesome Community" maxlength="50">
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Topic</div>
        <select id="cm-topic" class="inp" style="padding:10px">
          <option>💻 Tech</option>
          <option>🎮 Gaming</option>
          <option>🍔 Food</option>
          <option>✈️ Travel</option>
          <option>🎵 Music</option>
          <option>🎨 Art</option>
          <option>💪 Fitness</option>
          <option>📚 Learning</option>
          <option>💼 Business</option>
          <option>📝 General</option>
        </select>
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Description</div>
        <textarea id="cm-desc" class="inp" rows="3" placeholder="What is this community about?" style="resize:none"></textarea>
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px;font-weight:600">Community Rules</div>
        <textarea id="cm-rules" class="inp" rows="2" placeholder="1. Be respectful
2. No spam" style="resize:none"></textarea>
      </div>
      <button class="bgrd" onclick="saveCommunity()" style="padding:14px">Create Community</button>
    </div>
  `;
}

function saveCommunity(){
  const name = document.getElementById('cm-name')?.value.trim();
  const topic = document.getElementById('cm-topic')?.value;
  const desc = document.getElementById('cm-desc')?.value.trim();
  const rules = document.getElementById('cm-rules')?.value.trim();
  if(!name){
    toast('Community name chahiye');
    return;
  }
  const community = {
    id: 'cm_' + Date.now(),
    name,
    topic,
    description: desc,
    rules,
    icon: topic.split(' ')[1] || '👥',
    color: 'linear-gradient(135deg,#7afdff,#fc007c)',
    members: 1,
    forums: [],
    voiceRooms: [],
    createdAt: new Date().toISOString()
  };
  myCommunities.push(community);
  try { localStorage.setItem('nova-communities', JSON.stringify(myCommunities)); } catch(e) {}
  toast('👥 Community created!');
  closeModal();
  showCommunities();
}

function openCommunity(communityId){
  const cm = myCommunities.find(c => c.id === communityId);
  if(!cm){ toast('Community not found'); return; }

  const m = modal(cm.name);
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:0">
      <div style="padding:20px;background:${cm.color};text-align:center">
        <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 10px">${cm.icon}</div>
        <div style="font-weight:800;font-size:17px;color:#fff">${cm.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${cm.members} members • ${cm.topic}</div>
      </div>
      ${cm.description ? `<div style="padding:14px 16px;color:#ccc;font-size:13px;border-bottom:1px solid #1a1a1a">${cm.description}</div>` : ''}

      <div style="padding:16px;display:flex;flex-direction:column;gap:8px">
        <button onclick="showVoiceRoomsForCommunity('${cm.id}')" class="bgrd" style="padding:12px;display:flex;align-items:center;justify-content:center;gap:8px">${ico('headphones','#fff',18)} Voice Rooms</button>
        <button onclick="showForums('${cm.id}')" class="bgrd" style="padding:12px;display:flex;align-items:center;justify-content:center;gap:8px">${ico('msg_square','#fff',18)} Forums & Discussions</button>
        <button onclick="showCommunityEvents('${cm.id}')" class="bgrd" style="padding:12px;display:flex;align-items:center;justify-content:center;gap:8px">${ico('calendar','#fff',18)} Events</button>
        <button onclick="showCommunityMembers('${cm.id}')" class="bgrd" style="padding:12px;display:flex;align-items:center;justify-content:center;gap:8px">${ico('group','#fff',18)} Members</button>
        ${cm.rules ? `
          <div style="margin-top:8px;padding:12px;background:#0f0f0f;border-radius:12px;border:1px solid #1a1a1a">
            <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:6px">📋 RULES</div>
            <div style="font-size:12px;color:#ccc;line-height:1.6;white-space:pre-wrap">${cm.rules}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function showVoiceRoomsForCommunity(communityId){
  showVoiceRooms();
}

function showForums(communityId){
  showCommunities();
}

function showCommunityEvents(communityId){
  showCalendar();
}

function showCommunityMembers(communityId){
  toast('👥 Open a community to see members');
}

function joinCommunity(name){
  toast(`✅ Joined ${name}!`);
}
