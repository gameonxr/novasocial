/**
 * NovaSocial Nova Universe Hub feature.
 *
 * Extracted as a classic script while Voice Assistant and remaining Nova
 * Ultra features remain inline for independent guarded checkpoints.
 */
// ── NOVA UNIVERSE HUB ──────────────────────────────────────
function showNovaUniverseHub(){
  const scr = document.getElementById('screen');
  scr.innerHTML = `
    <div class="topbar">
      <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
      <span style="font-weight:700;font-size:18px;flex:1">🌌 Nova Universe</span>
    </div>

    <div style="padding:20px;background:linear-gradient(135deg,rgba(131,58,180,0.15),rgba(225,48,108,0.15),rgba(122,253,255,0.15));border-bottom:1px solid #1a1a1a;text-align:center">
      <div style="font-size:60px;margin-bottom:10px">🌌</div>
      <div style="font-weight:800;font-size:22px;background:linear-gradient(135deg,#833AB4,#E1306C,#7afdff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Nova Universe</div>
      <div style="color:#aaa;font-size:12px;margin-top:6px">Sab kuch ek app me — Social, Messaging, AI, aur bahut kuch</div>
    </div>

    <div style="padding:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${[
        ['📱','Social','Posts, stories, reels','go("home")'],
        ['💬','Messages','DMs, groups, channels','go("dms")'],
        ['📞','Calls','Audio & video calls','showCallFeature()'],
        ['🤖','Nova AI','Your AI assistant','toggleNovaAI()'],
        ['📝','Notes','Journal & shared notes','showAIJournal()'],
        ['📅','Calendar','Events & reminders','showCalendar()'],
        ['👥','Communities','Forums & voice rooms','showCommunities()'],
        ['🛍️','Marketplace','Buy/sell products','showMarketplace()'],
        ['🎓','Learning','Courses & tutorials','showLearning()'],
        ['📰','News','Personalized news','showNewsFeed()'],
        ['🎮','Games','Mini games','showGames()'],
        ['🧑‍🎤','Avatar','3D avatar creator','showAvatarCreator()'],
        ['💰','Wallet','Creator earnings','showCreatorWallet()'],
        ['🎬','AI Editor','Video editor','showAIVideoEditor()'],
        ['📸','Memories','1 year ago','showMemories()'],
        ['🎭','Mood','Mood timeline','showMoodTimeline()'],
        ['🔒','Security','2FA & devices','showSecurityCenter()'],
        ['🧠','Smart Feed','Mood-based feed','showSmartFeed()'],
      ].map(([icon,name,desc,action])=>`
        <div onclick="${action}" style="padding:14px 8px;background:#0f0f0f;border:1px solid #1a1a1a;border-radius:14px;cursor:pointer;text-align:center;transition:.2s">
          <div style="font-size:32px;margin-bottom:6px">${icon}</div>
          <div style="font-weight:700;font-size:11px;color:#fff">${name}</div>
          <div style="font-size:9px;color:#666;margin-top:2px;line-height:1.3">${desc}</div>
        </div>
      `).join('')}
    </div>

    <div style="height:80px"></div>
  `;
}

// ── POST TRANSLATE ──────────────────────────────────────
async function translatePost(postId, targetLang){
  try {
    const { data: post } = await db.from('posts').select('caption').eq('id', postId).single();
    if(!post?.caption){
      toast('Koi caption nahi hai translate karne ke liye');
      return;
    }

    // Try API translation
    if(window.ZAI_API_KEY){
      const resp = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer ' + window.ZAI_API_KEY},
        body: JSON.stringify({
          model:'glm-4-flash',
          messages:[
            {role:'system', content:`You are a translator. Translate the user's text to ${targetLang}. Return ONLY the translation, nothing else.`},
            {role:'user', content: post.caption}
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if(resp.ok){
        const data = await resp.json();
        const translated = data.choices?.[0]?.message?.content;
        if(translated){
          showTranslatedCaption(post.caption, translated, targetLang);
          return;
        }
      }
    }

    // Fallback: show original with note
    showTranslatedCaption(post.caption, post.caption + '\n\n🌍 (Translation requires AI API key — showing original)', targetLang);
  } catch(e) {
    toast('Translation failed: ' + e.message);
  }
}

function showTranslatedCaption(original, translated, lang){
  const m = modal('🌍 Translation - ' + lang);
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="margin-bottom:16px">
        <div style="font-size:11px;color:#666;font-weight:700;margin-bottom:6px">ORIGINAL</div>
        <div style="font-size:13px;color:#888;line-height:1.6;padding:12px;background:#0f0f0f;border-radius:10px;border:1px solid #1a1a1a">${original}</div>
      </div>
      <div>
        <div style="font-size:11px;color:#7afdff;font-weight:700;margin-bottom:6px">🌍 TRANSLATED (${lang})</div>
        <div style="font-size:14px;color:#fff;line-height:1.6;padding:12px;background:rgba(122,253,255,0.05);border-radius:10px;border:1px solid rgba(122,253,255,0.2)">${translated}</div>
      </div>
      <button class="bgrd" onclick="closeModal()" style="margin-top:16px;width:100%;padding:12px">Done</button>
    </div>
  `;
}

// ── DYNAMIC UI (Time-based backgrounds) ──────────────────────────────────────
function applyDynamicBackground(){
  const hour = new Date().getHours();
  let bg = '';
  if(hour >= 5 && hour < 8) bg = 'linear-gradient(180deg,rgba(255,170,0,0.05) 0%,transparent 30%)'; // Sunrise
  else if(hour >= 8 && hour < 17) bg = 'linear-gradient(180deg,rgba(0,149,246,0.04) 0%,transparent 30%)'; // Day
  else if(hour >= 17 && hour < 19) bg = 'linear-gradient(180deg,rgba(255,107,53,0.06) 0%,transparent 30%)'; // Sunset
  else if(hour >= 19 && hour < 22) bg = 'linear-gradient(180deg,rgba(131,58,180,0.05) 0%,transparent 30%)'; // Evening
  else bg = 'linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent 30%)'; // Night

  document.body.style.backgroundImage = bg;
}

// ── DYNAMIC ISLAND (Notification) ──────────────────────────────────────
function showDynamicIsland(text, icon='🔔'){
  let island = document.getElementById('dynamic-island');
  if(!island){
    island = document.createElement('div');
    island.id = 'dynamic-island';
    island.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%) translateY(-100px);background:#000;color:#fff;padding:8px 20px;border-radius:24px;font-size:13px;font-weight:600;z-index:99999;transition:transform 0.4s cubic-bezier(0.32,0.72,0,1);display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4);max-width:90vw';
    document.body.appendChild(island);
  }
  island.innerHTML = `<span style="font-size:16px">${icon}</span><span>${text}</span>`;
  island.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(()=>{
    island.style.transform = 'translateX(-50%) translateY(-100px)';
  }, 3000);
}

// Patch checkUnreadNotifs to also show dynamic island
const _origCheckUnread_v2 = window.checkUnreadNotifs;
if(typeof _origCheckUnread === 'function'){
  window.checkUnreadNotifs = async function(){
    const prevCount = parseInt(document.getElementById('notif-dot')?.textContent || '0');
    await _origCheckUnread.apply(this, arguments);
    const dot = document.getElementById('notif-dot');
    const newCount = parseInt(dot?.textContent || '0');
    if(newCount > prevCount){
      showDynamicIsland(`🔔 ${newCount} new notifications`, '🔔');
    }
  };
}

// Initialize dynamic background on load
function initDynamicUI(){
  applyDynamicBackground();
  setInterval(applyDynamicBackground, 60000); // Update every minute
}
