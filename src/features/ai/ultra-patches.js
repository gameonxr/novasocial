// Nova Ultra AI patches — split from nova-ultra-patches.js (2026-09-29
// architecture migration). Loaded as the LAST file of the lazy ai chunk so the
// ACTIVE patches (handleNovaCommand, getLocalAIResponse2, generateAICaption2)
// apply after their targets (nova-ai.js, local-ai-response.js,
// ai-generators.js), exactly as they did when nova-ultra-patches.js loaded at
// script position 443 after those files. The v1 blocks remain INERT (their
// guard variables are never assigned) — preserved verbatim, original block
// order kept.
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
