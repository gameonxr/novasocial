// Nova Ultra universe-hub patch — split from nova-ultra-patches.js (2026-09-29
// architecture migration). INERT by original construction: the guard checks
// typeof _origShowNovaUniverseHub (never assigned) while the assignment goes to
// _origShowNovaUniverseHub_v2 — preserved verbatim.
// ── Update Nova Universe Hub to use functional features ──────────────────────────────────────
const _origShowNovaUniverseHub_v2 = window.showNovaUniverseHub;
if(typeof _origShowNovaUniverseHub === 'function'){
  window.showNovaUniverseHub = function(){
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
          ['home','📱','Social','Posts, stories, reels','go("home")'],
          ['msg','💬','Messages','DMs, groups, channels','go("dms")'],
          ['phone','📞','Calls','Audio & video calls','showCallFeature()'],
          ['sparkles','🤖','Nova AI','Your AI assistant','toggleNovaAI()'],
          ['book','📝','Notes','Journal & notes','showNotes()'],
          ['calendar','📅','Calendar','Events & reminders','showCalendar()'],
          ['group','👥','Communities','Forums & voice rooms','showCommunities()'],
          ['bag','🛍️','Marketplace','Buy/sell products','showMarketplace()'],
          ['cap','🎓','Learning','Courses & tutorials','showLearning()'],
          ['news','📰','News','Personalized news','showNews()'],
          ['gamepad','🎮','Games','Mini games','showGames()'],
          ['user','🧑‍🎤','Avatar','3D avatar creator','showAvatarCreator()'],
          ['wallet','💰','Wallet','Creator earnings','showCreatorWallet()'],
          ['film','🎬','AI Editor','Video editor','showAIVideoEditor()'],
          ['img','📸','Memories','1 year ago','showMemories()'],
          ['smile','🎭','Mood','Mood timeline','showMoodTimeline()'],
          ['shield','🔒','Security','2FA & devices','showSecurityCenter()'],
          ['brain','🧠','Smart Feed','Mood-based feed','showSmartFeed()'],
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
  };
}
