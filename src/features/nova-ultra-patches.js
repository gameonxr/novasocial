// Nova Ultra v4/v5 feature patches — extracted from the index.html inline application script
// Region SHA-256: 89ef28fd0f429b1b205230e6c7fb5118edafe29c0e1a12a575c8eaf1e2056476
// Classic script — top-level patch overrides for window owners defined by earlier
// modules (nova-ai.js, local-ai-response.js, ai-generators.js, smart-feed.js,
// nova-universe.js). The toggleLike and initNovaFeatures guards are intentionally
// inert when their targets load after this module (preserved pre-split behavior).
// Load order: after the patch targets, before the inline application script.

// ═══════════════════════════════════════════════════════════════════════
// PARTICLE EFFECT ON LIKE (Futuristic)
// ═══════════════════════════════════════════════════════════════════════

// Override toggleLike to add particles (call original then particles)
const _origToggleLike = window.toggleLike;
if(typeof _origToggleLike === 'function'){
  // Already defined elsewhere; we'll patch via event delegation below
}

// ═══════════════════════════════════════════════════════════════════════
// NOVA ULTRA FEATURES v3.0 (World-wide release edition)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// NOVA ULTRA FEATURES v3.0 (World-wide release edition)
// ═══════════════════════════════════════════════════════════════════════

// NOVA PRO FEATURES v4.0 — Functional features + more
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// NOVA PRO FEATURES v4.0 — Functional "coming soon" + more advanced
// ═══════════════════════════════════════════════════════════════════════

// ── SMART MOOD FEED (Functional - actually filters posts) ──────────────────────────────────────

// Patch loadMoodFeed to use functional filtering (avoid redeclaration of currentMood)
if(typeof window.loadMoodFeed === 'function'){
  const _origLoadMoodFeed_v2 = window.loadMoodFeed;
  window.loadMoodFeed = function(){
    toast(`${window.currentMood || 'default'} feed applying... 🧠`);
    go('home');
    setTimeout(() => {
      setTimeout(() => {
        const feedList = document.getElementById('feed-list');
        if(feedList){
          const moodChip = document.createElement('div');
          moodChip.style.cssText = 'padding:12px 14px;margin:10px 12px;background:linear-gradient(135deg,rgba(122,253,255,0.1),rgba(252,0,124,0.1));border:1px solid rgba(122,253,255,0.2);border-radius:14px;font-size:12px;color:#fff;display:flex;align-items:center;gap:8px';
          moodChip.innerHTML = `🧠 <b>Smart Feed:</b> ${window.currentMood || 'default'} mood active. <span onclick="showSmartFeed()" style="color:#7afdff;cursor:pointer;margin-left:auto">Change →</span>`;
          feedList.insertBefore(moodChip, feedList.firstChild);

          if((window.currentMood || 'default') !== 'default'){
            applyMoodToFeed(window.currentMood);
          }
        }
      }, 500);
    }, 1500);
  };
}

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

// ── AI Caption Fix — should NOT appear in reels, only in AI panel ──
// The issue was that AI captions were being displayed as reel comments. This is fixed because
// the AI panel is separate. But let's add a safeguard:
const _origGenerateAICaption_v2 = window.generateAICaption;
if(typeof _origGenerateAICaption === 'function'){
  window.generateAICaption = async function(){
    // Make sure we're in create modal context, not viewing a reel
    const capinp = document.getElementById('capinp');
    if(!capinp){
      toast('✨ Pehle post/reel create karne ka modal kholo');
      return;
    }
    return _origGenerateAICaption.apply(this, arguments);
  };
}

// ── Improve AI default response with more capabilities ──
const _origGetLocalAIResponse_v2 = window.getLocalAIResponse;
if(typeof _origGetLocalAIResponse === 'function'){
  window.getLocalAIResponse = function(text){
    const t = text.toLowerCase();

    // Channel/community creation help
    if(t.includes('channel bana') || t.includes('channel create')){
      return `📺 Channel banane ke liye:\n\n1. ➕ icon tap karo\n2. "📺 Channels" tap karo\n3. "+ New" tap karo\n4. Name, description, icon, color choose karo\n5. "Create Channel" tap karo\n\nChannel me broadcast messages bhejo, unlimited subscribers ho sakte hain! 📢`;
    }

    if(t.includes('community bana') || t.includes('community create')){
      return `👥 Community banane ke liye:\n\n1. ➕ icon tap karo\n2. "👥 Communities" tap karo\n3. "+ New" tap karo\n4. Name, topic, description, rules daalo\n5. "Create" tap karo\n\nCommunities me forums, voice rooms, events host kar sakte ho! 🎯`;
    }

    if(t.includes('voice room') && !t.includes('join')){
      return `🎙️ Voice Room start karne ke liye:\n\n1. ➕ icon tap karo\n2. "🎙️ Voice Rooms" tap karo\n3. "+ Start" tap karo\n4. Topic daalo\n5. Room create ho jayega, log join kar sakte hain!\n\nReal-time audio conversation, Discord-style. 🎧`;
    }

    if(t.includes('notes') || t.includes('note bana')){
      return `📝 Notes:\n\nProfile → 🌌 Universe → 📝 Notes\n\nPersonal notes, ideas, todos — sab kuch save karo. Color-coded, searchable. + New button se naya note banao!`;
    }

    if(t.includes('calendar') || t.includes('event')){
      return `📅 Calendar:\n\nProfile → 🌌 Universe → 📅 Calendar\n\nEvents, reminders, schedules — sab yahan. Upcoming events sidebar me dikhega, notifications bhi milenge!`;
    }

    if(t.includes('marketplace') || t.includes('product bech') || t.includes('sell')){
      return `🛍️ Marketplace:\n\nProfile → 🌌 Universe → 🛍️ Marketplace\n\nDigital products becho — courses, ebooks, presets, services. Buyers securely pay karenge, tumhe paisa wallet me milega!`;
    }

    if(t.includes('games') || t.includes('game khel')){
      return `🎮 Games:\n\nProfile → 🌌 Universe → 🎮 Games\n\n6 mini games available:\n• Trivia Quiz\n• Word Puzzle\n• Memory Game\n• Tic Tac Toe (vs AI)\n• Snake\n• 2048\n\nFriends ke saath bhi khel sakte ho (coming soon)!`;
    }

    if(t.includes('news') || t.includes('samachar')){
      return `📰 News:\n\nProfile → 🌌 Universe → 📰 News\n\nPersonalized news feed — Tech, Gaming, Sports, Business, etc. Tumhare interests ke hisaab se curated!`;
    }

    if(t.includes('learning') || t.includes('course')){
      return `🎓 Learning:\n\nProfile → 🌌 Universe → 🎓 Learning\n\n6 courses available:\n• Flutter Basics\n• Python Mastery\n• UI/UX Design\n• Digital Marketing\n• AI & ML Basics\n• Content Creation\n\nProgress track hota hai, certificates bhi milenge (coming soon)!`;
    }

    // Fall back to original
    return _origGetLocalAIResponse.apply(this, arguments);
  };
}

// NOVA ULTRA v5.0 — Smart Algorithms + Bug Fixes + Advanced AI
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// NOVA ULTRA v5.0 — Smart Algorithms + Bug Fixes + Advanced AI
// ═══════════════════════════════════════════════════════════════════════

// ── ENHANCED NOVA AI — More commands & smarter responses ──────────────────────────────────────
const _origHandleNovaCommand = window.handleNovaCommand;
if(typeof _origHandleNovaCommand === 'function'){
  window.handleNovaCommand = async function(text){
    // Track context
    novaAIContext.lastCommand = text;
    novaAIContext.userMood = detectUserMood(text);

    const t = text.toLowerCase().trim();

    // ── MOOD RESPONSES ──
    if(novaAIContext.userMood === 'sad' && t.length < 50){
      return `Main samajh sakta hu bhai. 😔 Har mushkil waqt ke baad achhe din aate hain. Tum strong ho! 💪\n\nKya main tumhe distract karu? Ye try karo:\n• Trending reels dekho 🎬\n• Kisi dost ko message karo 💬\n• Naya post banao 📸\n• Ya bas music suno 🎵\n\nMain yahan hu, jo bhi chahiye batao! ❤️`;
    }
    if(novaAIContext.userMood === 'happy' && t.length < 30){
      return `Yeh bahut achha sunke! 🎉 Khushiyaan batane ke liye shukriya! 😊\n\nAur khushi ke liye:\n• Apna mood story pe share karo 📸\n• Dost ko surprise message karo 💬\n• Ya naya post daalo! 📱`;
    }
    if(novaAIContext.userMood === 'motivated'){
      return `🔥 🔥 🔥 Bilkul sahi! Tum kar loge! Main tumhare saath hu. Chalo shuru karte hain:\n\n• Pehle ek chhota step lo\n• Phir bada goal set karo\n• Post karke sabko batao\n• Aur duniya jeet lo! 🚀\n\nKya plan hai? Batao!`;
    }

    // ── NEW COMMANDS ──

    // Create channel command
    if(t.match(/(?:channel|tv) (?:bana|create|start|banai)/)){
      setTimeout(() => {
        closeModal();
        // Trigger create channel
        if(typeof createChannel === 'function'){
          const m = modal('📺 Create Channel');
          // Use existing createChannel function
          createChannel();
        }
      }, 500);
      return `📺 Channel banane me madad karunga! Channel creation modal khol raha hu...`;
    }

    // Open voice room command
    if(t.match(/voice room (?:start|bana|create)/)){
      setTimeout(() => createVoiceRoom(), 500);
      return `🎙️ Voice room banane me madad karunga! Topic daalo aur shuru karo!`;
    }

    // Search voice rooms
    if(t.includes('voice room') && (t.includes('dekh') || t.includes('join') || t.includes('search'))){
      setTimeout(() => showVoiceRooms(), 500);
      return `🎙️ Live voice rooms khol raha hu... Kisi bhi room me join kar sakte ho!`;
    }

    // Open notes
    if(t.match(/note (?:bana|create|likh)/) || (t.includes('note') && t.includes('kaho'))){
      setTimeout(() => createNote(), 500);
      return `📝 Naya note banate hain! Note editor khol raha hu...`;
    }

    // Open marketplace
    if(t.includes('marketplace') || t.includes('product bech') || t.includes('kharid')){
      setTimeout(() => showMarketplace(), 500);
      return `🛍️ Marketplace khol raha hu... Digital products becho ya kharido!`;
    }

    // Open games
    if(t.includes('game khel') || t.includes('khelne')){
      setTimeout(() => showGames(), 500);
      return `🎮 Games khol raha hu! Tic Tac Toe, Snake, 2048, aur bahut kuch!`;
    }

    // Open news
    if(t.includes('news dekh') || t.includes('samachar')){
      setTimeout(() => showNews(), 500);
      return `📰 News feed khol raha hu... Tech, gaming, sports sab kuch!`;
    }

    // Open learning
    if(t.includes('learn kar') || t.includes('course dekh') || t.includes('padhai')){
      setTimeout(() => showLearning(), 500);
      return `🎓 Learning hub khol raha hu... Flutter, Python, UI/UX, aur bahut kuch seekho!`;
    }

    // Open calendar
    if(t.includes('calendar dekh') || t.includes('event add')){
      setTimeout(() => showCalendar(), 500);
      return `📅 Calendar khol raha hu... Events add karo aur reminders set karo!`;
    }

    // Mood-based content suggestion
    if(t.match(/bore? ho|kya karu|bore|time pass|kuch karo/i)){
      const suggestions = [
        `Bore ho? Ye try karo! 🎯\n\n1. 🎬 Trending reels dekho\n2. 🎮 Tic Tac Toe khelo (main haraunga! 😎)\n3. 📸 Naya post banao\n4. 🎙️ Voice room me join karo\n5. 📰 News padho\n6. 🎓 Naya skill seekho\n\nBolo kya karna hai!`,
        `Bore mat ho bhai! 😄 Ye karo:\n\n• 🔥 Trending page dekho\n• 💬 Kisi dost ko message karo\n• 🤖 Mujhse chat karo\n• 🎵 Music suno (YouTube)\n• 📸 Story daalo\n\nBatao kya help karu!`,
      ];
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    // ── FALLBACK to original handler ──
    return _origHandleNovaCommand.apply(this, arguments);
  };
}

// ── ENHANCED LOCAL AI RESPONSES ──────────────────────────────────────
const _origGetLocalAIResponse2 = window.getLocalAIResponse;
if(typeof _origGetLocalAIResponse2 === 'function'){
  window.getLocalAIResponse = function(text){
    const t = text.toLowerCase();

    // Detect mood and respond empathetically
    if(novaAIContext.userMood === 'sad'){
      return `Main samajh sakta hu. 😔 Tum akele nahi ho. Kya main koi funny reel dikhaun ya dost se connect karwaun? Batao. ❤️`;
    }

    // Boredom
    if(t.match(/bore? ho|bore|kya karu|time pass|kuch karo/i)){
      return `Bore ho? Ye try karo! 🎯\n\n1. 🎬 Trending reels dekho\n2. 🎮 Tic Tac Toe khelo\n3. 📸 Naya post banao\n4. 🎙️ Voice room join karo\n5. 📰 News padho\n6. 🎓 Naya skill seekho\n\nBolo kya karna hai!`;
    }

    // Compliment AI
    if(t.match(/good|achha|best|smart|amazing|wow|great/i) && t.length < 30){
      return `Shukriya bhai! 😊 Main NovaSocial team ne banaya hu. Tumhara experience better banane me help karu? Batao kya chahiye! 🚀`;
    }

    // Emotional support
    if(t.match(/stress|tension|dar|darr|dukhi|rona|cry/i)){
      return `Main yahan hu bhai. ❤️ Stress mat lo, sab theek hoga. \n\n• Deep breath lo 🌬️\n• Paani pio 💧\n• Kisi trusted dost se baat karo\n• Ya main sun sakta hu — batao kya hua\n\nTum strong ho! 💪`;
    }

    // Jokes
    if(t.match(/joke|chutkula|hasao|funny bata/i)){
      const jokes = [
        `Teacher: "Tumhara homework kahaan hai?"\nStudent: "Nova AI ne karne se mana kar diya tha!" 😄`,
        `Programmer ne Nova AI se pucha: "Bug kya hai?"\nAI: "Tumhara code!" 😂`,
        `Main ek din itna smart ho gaya ki khud se chat karne laga! 🤖`,
        `Why don't programmers like nature? It has too many bugs! 🐛`,
        `Wife: "Tum phone pe kya kar rahe ho?"\nHusband: "Nova AI se apni tareef sun raha hu!" 😎`,
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Quotes
    if(t.match(/quote|suvichar|shaayari|motivation bata/i)){
      const quotes = [
        `✨ "Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
        `🔥 "The only way to do great work is to love what you do." — Steve Jobs`,
        `💪 "Tumhari sehnakt hi tumhari sabse badi taqat hai."`,
        `🌟 "Zindagi me kuch banna ho toh pehle kuch karna padta hai!"`,
        `🚀 "Kal kare so aaj kar, aaj kare so ab!" — Sant Kabir`,
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }

    // Weather (mock)
    if(t.match(/mausam|weather|barish|garmi/i)){
      return `🌤️ Mausam update:\n\nAaj ka weather: Sunny ☀️\nTemperature: 28°C\nHumidity: 65%\n\nTip: AC chalega, paani zyada pio! 💧\n\n(Note: Real weather API integration ke liye location access chahiye)`;
    }

    // Time/date
    if(t.match(/time kya|time bata|kitne baje|date kya/i)){
      const now = new Date();
      return `🕐 Abhi ka time: ${now.toLocaleTimeString('en-IN')}\n📅 Date: ${now.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}`;
    }

    // Music suggestion
    if(t.match(/music|gana|song|song sun/i)){
      return `🎵 Music suggestions:\n\nLo-fi: "Lofi Hip Hop Radio" 🎧\nBollywood: "Tum Hi Ho" 🎤\nPunjabi: "Lover" - Diljit 🎶\nEnglish: "Shape of You" - Ed Sheeran\n\nApne mood ke hisaab se choose karo!`;
    }

    // Movie/show suggestion
    if(t.match(/movie|film|web series|dekhne/i)){
      return `🎬 Suggestions:\n\nBollywood: 3 Idiots, Dangal\nHollywood: Inception, Interstellar\nWeb Series: Mirzapur, Sacred Games\nAnime: Naruto, One Piece\n\nGenre batao toh aur specific suggestions dunga!`;
    }

    // ── FALLBACK to original ──
    return _origGetLocalAIResponse2.apply(this, arguments);
  };
}

// ── AUTO-DETECT INTERESTS ON LOGIN ──────────────────────────────────────
const _origInitNovaFeatures2 = window.initNovaFeatures;
if(typeof _origInitNovaFeatures2 === 'function'){
  window.initNovaFeatures = function(){
    _origInitNovaFeatures2.apply(this, arguments);
    // Update interests in background after 5 seconds
    setTimeout(() => {
      if(ME && typeof updateMyInterests === 'function'){
        updateMyInterests();
      }
    }, 5000);
  };
}

// ── ENHANCED POST CARD WITH RANK BADGE ──────────────────────────────────────
// (Optional: Show "🔥 Trending" badge for high-ranked posts)

// ── PREVENT AI CAPTION FROM APPEARING IN REELS ──────────────────────────────────────
// The AI caption button should ONLY work in post creation modal, never in reel viewing
const _origGenerateAICaption2 = window.generateAICaption;
if(typeof _origGenerateAICaption2 === 'function'){
  window.generateAICaption = async function(){
    const capinp = document.getElementById('capinp');
    if(!capinp){
      toast('✨ AI Caption sirf post banate waqt use karo!');
      return;
    }
    return _origGenerateAICaption2.apply(this, arguments);
  };
}
