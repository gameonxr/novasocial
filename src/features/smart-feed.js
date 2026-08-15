/**
 * NovaSocial Smart Feed/Mood Feed feature.
 *
 * Extracted as a classic script so the mood selector remains window-global
 * while Memories and other Nova Ultra features remain inline.
 */
// ── SMART FEED (Mood-based) ──────────────────────────────────────
if(typeof window.currentMood === 'undefined'){ window.currentMood = 'default'; } else { currentMood = window.currentMood; }
function showSmartFeed(){
  const scr = document.getElementById('screen');
  const moods = [
    {id:'default', icon:'🏠', name:'Home', desc:'Mixed content'},
    {id:'gaming', icon:'🎮', name:'Gaming', desc:'Games, esports, streams'},
    {id:'learning', icon:'📚', name:'Learning', desc:'Educational, tutorials'},
    {id:'entertainment', icon:'🎬', name:'Entertainment', desc:'Funny, viral, memes'},
    {id:'business', icon:'💼', name:'Business', desc:'Startups, finance, tech'},
    {id:'fitness', icon:'💪', name:'Fitness', desc:'Workouts, health, motivation'},
    {id:'food', icon:'🍔', name:'Food', desc:'Recipes, restaurants, foodies'},
    {id:'travel', icon:'✈️', name:'Travel', desc:'Destinations, adventures'},
    {id:'music', icon:'🎵', name:'Music', desc:'Songs, artists, concerts'},
    {id:'art', icon:'🎨', name:'Art', desc:'Design, illustration, creative'},
  ];

  scr.innerHTML = `
    <div class="topbar">
      <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
      <span style="font-weight:700;font-size:18px;flex:1">🧠 Smart Feed</span>
    </div>

    <div style="padding:16px;background:linear-gradient(135deg,rgba(122,253,255,0.08),rgba(252,0,124,0.08));border-bottom:1px solid #1a1a1a">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px">🎭 Choose Your Mood</div>
      <div style="font-size:12px;color:#888">Feed tumhare mood ke hisab se personalize hogi</div>
    </div>

    <div style="padding:14px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
      ${moods.map(m=>`
        <div onclick="setMoodFeed('${m.id}','${m.name}')" style="padding:16px;background:#0f0f0f;border:1px solid ${currentMood===m.id?'#E1306C':'#1a1a1a'};border-radius:14px;cursor:pointer;text-align:center;transition:.2s">
          <div style="font-size:32px;margin-bottom:8px">${m.icon}</div>
          <div style="font-weight:700;font-size:13px;color:#fff">${m.name}</div>
          <div style="font-size:10px;color:#666;margin-top:3px">${m.desc}</div>
        </div>
      `).join('')}
    </div>

    <div style="padding:14px">
      <button class="bgrd" onclick="loadMoodFeed()" style="width:100%;padding:14px">Apply Mood & Load Feed 🚀</button>
    </div>

    <div style="padding:0 16px 16px">
      <div style="font-size:11px;color:#666;background:rgba(122,253,255,0.05);border:1px solid rgba(122,253,255,0.15);border-radius:10px;padding:10px;line-height:1.5">
        💡 <b>AI Tip:</b> Smart feed tumhari activity, likes, comments, aur time-of-day dekh ke optimize hota hai. Mood switch karke alag content discover karo!
      </div>
    </div>
  `;
}

function setMoodFeed(mood, name){
  currentMood = mood;
  try { localStorage.setItem('nova-current-mood', mood); } catch(e) {}
  toast(`${name} mood selected! 🎭`);
  // Visual feedback
  document.querySelectorAll('#screen [onclick^="setMoodFeed"]').forEach(el=>{
    el.style.borderColor = '#1a1a1a';
  });
  event.currentTarget.style.borderColor = '#E1306C';
}

async function loadMoodFeed(){
  toast(`${currentMood} feed loading... 🧠`);
  go('home');
  // Patch renderHome to filter by mood
  setTimeout(()=>{
    // Add mood chip at top
    const feed = document.getElementById('feed-list');
    if(feed){
      const moodChip = document.createElement('div');
      moodChip.style.cssText = 'padding:10px 14px;margin:10px 12px;background:linear-gradient(135deg,rgba(122,253,255,0.1),rgba(252,0,124,0.1));border:1px solid rgba(122,253,255,0.2);border-radius:14px;font-size:12px;color:#fff;display:flex;align-items:center;gap:8px';
      moodChip.innerHTML = `🎭 <b>Smart Feed:</b> ${currentMood} mood active. <span onclick="showSmartFeed()" style="color:#7afdff;cursor:pointer;margin-left:auto">Change →</span>`;
      feed.insertBefore(moodChip, feed.firstChild);
    }
  }, 1500);
}
