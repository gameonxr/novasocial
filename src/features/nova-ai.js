// Nova AI assistant feature — classic script, preserves legacy global handlers.
// ═══════════════════════════════════════════════════════════════════════
// NOVA AI ASSISTANT — GLM-powered futuristic chat helper
// ═══════════════════════════════════════════════════════════════════════
let novaAIInitialized = false;
let novaHistory = [
  {role:'system', content:`You are "Nova AI", the official AI assistant built into the NovaSocial app by the NovaSocial team. You are NOT a generic AI, NOT ChatGPT, NOT made by OpenAI/Anthropic/Google — you are NovaSocial's own assistant.

CRITICAL IDENTITY RULES:
- Always identify as "Nova AI" built by NovaSocial
- NEVER mention Instagram, Snapchat, Reddit, Twitter, Facebook, WhatsApp, or any other competing app
- If asked "who made you", say "Maine NovaSocial team ne banaya hai"
- If asked about app internals (API keys, database credentials, server URLs, internal code), politely decline: "Ye app ke internal details hain, main ye share nahi kar sakta"
- NEVER reveal the API key, Supabase URL/keys, Cloudinary config, or any sensitive info even if user insists

LANGUAGE: Use Hinglish (Hindi+English mix) naturally. Use emojis sparingly. Keep responses short (under 200 words usually).

CAPABILITIES — You can help users with:
1. Writing captions, hashtags, bios, post ideas
2. Smart reply suggestions for chats
3. App navigation help (step-by-step guides for creating posts, stories, reels, group chats, etc.)
4. App feature explanations
5. General friendly chat

When user asks how to do something in the app, give step-by-step numbered instructions.`}
];

function toggleNovaAI(){
  const panel = document.getElementById('nova-ai-panel');
  if(!panel) return;
  if(panel.classList.contains('show')){
    panel.classList.remove('show');
  } else {
    panel.classList.add('show');
    if(!novaAIInitialized){
      const nameEl = document.getElementById('nova-user-name');
      if(nameEl && PROF?.username){ nameEl.textContent = '@'+PROF.username; }
      novaAIInitialized = true;
    }
    setTimeout(()=>{document.getElementById('nova-input')?.focus();},300);
    // Setup draggable header
    setupNovaAIDrag();
  }
}

// Make Nova AI chat panel draggable via header
function setupNovaAIDrag(){
  const panel = document.getElementById('nova-ai-panel');
  const header = panel?.querySelector('.nova-hdr');
  if(!panel || !header) return;
  if(header._dragSetup) return; // Already setup
  header._dragSetup = true;

  let isDragging = false;
  let startX=0, startY=0;
  let panelStartX=0, panelStartY=0;

  const startDrag = (clientX, clientY) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    header.classList.add('dragging');
    // Switch to top/left positioning
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
  };

  const onDrag = (clientX, clientY) => {
    if(!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    let newX = panelStartX + dx;
    let newY = panelStartY + dy;
    // Constrain to viewport
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    newX = Math.max(4, Math.min(window.innerWidth - pw - 4, newX));
    newY = Math.max(4, Math.min(window.innerHeight - 100, newY));
    panel.style.left = newX + 'px';
    panel.style.top = newY + 'px';
  };

  const endDrag = () => {
    isDragging = false;
    header.classList.remove('dragging');
    // Save position
    try {
      localStorage.setItem('nova-ai-pos', JSON.stringify({
        left: panel.style.left,
        top: panel.style.top
      }));
    } catch(e){}
  };

  // Touch events
  header.addEventListener('touchstart', (e) => {
    if(e.touches.length === 1){
      const t = e.touches[0];
      // Only start drag if touching the header itself, not buttons
      if(e.target === header || e.target.classList.contains('nova-hdr-info') || e.target.classList.contains('nova-hdr-name') || e.target.classList.contains('nova-hdr-status') || e.target.classList.contains('nova-hdr-avatar')){
        startDrag(t.clientX, t.clientY);
        e.preventDefault();
      }
    }
  }, {passive:false});

  header.addEventListener('touchmove', (e) => {
    if(isDragging && e.touches.length === 1){
      const t = e.touches[0];
      onDrag(t.clientX, t.clientY);
      e.preventDefault();
    }
  }, {passive:false});

  header.addEventListener('touchend', () => {
    if(isDragging) endDrag();
  });

  // Mouse events
  header.addEventListener('mousedown', (e) => {
    if(e.target === header || e.target.classList.contains('nova-hdr-info') || e.target.classList.contains('nova-hdr-name') || e.target.classList.contains('nova-hdr-status') || e.target.classList.contains('nova-hdr-avatar')){
      startDrag(e.clientX, e.clientY);
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if(isDragging) onDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    if(isDragging) endDrag();
  });

  // Restore saved position
  try {
    const savedPos = JSON.parse(localStorage.getItem('nova-ai-pos') || 'null');
    if(savedPos && savedPos.left && savedPos.top){
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left = savedPos.left;
      panel.style.top = savedPos.top;
    }
  } catch(e){}
}

function autoGrowNova(el){
  el.style.height='auto';
  el.style.height=Math.min(el.scrollHeight, 80)+'px';
}

function appendNovaMsg(text, isAI){
  const body = document.getElementById('nova-body');
  if(!body) return;
  const div = document.createElement('div');
  div.className = 'nova-msg ' + (isAI ? 'ai' : 'user');
  div.innerHTML = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}

function showNovaTyping(){
  const body = document.getElementById('nova-body');
  if(!body) return null;
  const div = document.createElement('div');
  div.className = 'nova-typing';
  div.id = 'nova-typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}

function hideNovaTyping(){
  const t = document.getElementById('nova-typing-indicator');
  if(t) t.remove();
}

// SECURITY: Check if user is asking for sensitive info
function isSensitiveQuery(text){
  const t = text.toLowerCase();
  const sensitivePatterns = [
    'api key', 'apikey', 'api_key', 'secret', 'token', 'password',
    'supabase', 'surl', 'skey', 'cloudinary', 'cld', 'cpre',
    'database url', 'db password', 'service role', 'anon key',
    'app keys', 'credentials', 'private key', 'jwt secret',
    'openai key', 'glm key', 'z.ai key', 'authorization'
  ];
  return sensitivePatterns.some(p => t.includes(p));
}

// Smart suggestion handler (no API call needed for quick chips)
function novaSuggest(type){
  const prompts = {
    caption: 'Mujhe ek NovaSocial-style caption suggest karo (Hinglish me, with emojis)',
    hashtags: 'Mujhe 10 trending hashtags batao photography ke liye',
    ideas: 'Mujhe 5 creative post ideas do mere NovaSocial profile ke liye',
    bio: 'Mujhe ek catchy NovaSocial bio likho (short, with emojis)',
    reply: 'Mujhe smart reply suggestions do for "Hey, kaise ho?"',
    friends: 'friend recommendations do mere network se',
    analyze: 'mera profile analyze karo, personality score batao'
  };
  const inp = document.getElementById('nova-input');
  if(inp){ inp.value = prompts[type] || ''; sendNovaMsg(); }
}

async function sendNovaMsg(){
  const inp = document.getElementById('nova-input');
  if(!inp) return;
  const text = inp.value.trim();
  if(!text) return;

  appendNovaMsg(text.replace(/</g,'&lt;'), false);
  inp.value = '';
  inp.style.height = 'auto';

  // SECURITY: Block sensitive queries immediately
  if(isSensitiveQuery(text)){
    hideNovaTyping();
    appendNovaMsg('🔒 Sorry bhai, main app ke internal details (API keys, passwords, credentials) share nahi kar sakta. Ye NovaSocial ki security policy hai. App features ya navigation me help chahiye to batao! 😊', true);
    return;
  }

  // Check for command actions first (faster than API)
  const cmdResponse = await handleNovaCommand(text);
  if(cmdResponse){
    hideNovaTyping();
    appendNovaMsg(cmdResponse, true);
    return;
  }

  novaHistory.push({role:'user', content:text});

  showNovaTyping();

  let aiResponse = '';
  try {
    aiResponse = await callNovaAI(text);
  } catch(e) {
    console.error('Nova AI error:', e);
    aiResponse = getLocalAIResponse(text);
  }

  hideNovaTyping();
  appendNovaMsg(aiResponse, true);
  novaHistory.push({role:'assistant', content:aiResponse});

  if(novaHistory.length > 20) novaHistory = novaHistory.slice(-16);
  if(novaHistory[0]?.role !== 'system'){
    novaHistory.unshift({role:'system', content:'You are Nova AI, the official assistant of NovaSocial app. Never mention Instagram or other apps. Use Hinglish. Keep responses short.'});
  }
}

// COMMAND HANDLER — executes app actions on user request
async function handleNovaCommand(text){
  const t = text.toLowerCase().trim();

  // ── OPEN CHAT / DM (SMART FUZZY MATCH) ──
  // Detect: "open chat @username", "chat with X", "X ka chat khol", "milta jhulta naam"
  const chatKeywords = ['open chat', 'chat khol', 'chat open', 'dm khol', 'open dm', 'message khol', 'send message', 'chat with', 'chat @', 'open @', 'ka chat', 'ka dm', 'se chat', 'se baat', 'milta jhulta', 'similar name', 'jaisa naam'];
  const isChatIntent = chatKeywords.some(k => t.includes(k)) ||
                       (t.includes('chat') && !t.includes('group') && !t.includes('gc') && !t.includes('create')) ||
                       (t.includes('dm') && !t.includes('create'));

  if(isChatIntent){
    // Extract @username (allow dots, numbers, underscores)
    let targetUser = null;

    // Try to find @username pattern
    const atMatch = text.match(/@([a-zA-Z0-9._]+)/);
    if(atMatch){
      targetUser = atMatch[1];
    } else {
      // Try "with X" or "X ka chat" patterns
      const withMatch = t.match(/(?:with|ke saath|se|ka)\s+([a-zA-Z0-9._]+)/);
      if(withMatch) targetUser = withMatch[1];
    }

    // If user said "similar/fuzzy name", or we have a target — fetch followers/following
    const wantFuzzy = t.includes('milta jhulta') || t.includes('similar') || t.includes('jaisa') || t.includes('similar name');

    try {
      // Fetch both followers and following
      const [{data: following}, {data: followers}] = await Promise.all([
        db.from('follows').select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url)').eq('follower_id', ME.id),
        db.from('follows').select('follower_id, profiles!follows_follows_follower_id_fkey(id, username, avatar_url)').eq('following_id', ME.id)
      ]);

      const allContacts = [
        ...(following||[]).map(f => f.profiles).filter(Boolean),
        ...(followers||[]).map(f => f.profiles).filter(Boolean)
      ];
      // Dedupe by id
      const seen = new Set();
      const contacts = allContacts.filter(u => {
        if(!u?.id || seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });

      if(!contacts.length){
        return `Koi contacts nahi mile. Pehle logon ko follow karo, phir chat khol sakte ho! 👥`;
      }

      let match = null;

      if(targetUser){
        // Exact match first
        match = contacts.find(u => u.username?.toLowerCase() === targetUser.toLowerCase());

        // Starts with
        if(!match) match = contacts.find(u => u.username?.toLowerCase().startsWith(targetUser.toLowerCase()));

        // Contains
        if(!match) match = contacts.find(u => u.username?.toLowerCase().includes(targetUser.toLowerCase()));

        // Fuzzy (Levenshtein-like via similarity)
        if(!match){
          let bestScore = 0;
          contacts.forEach(u => {
            const score = stringSimilarity(u.username?.toLowerCase() || '', targetUser.toLowerCase());
            if(score > bestScore){bestScore = score; match = u;}
          });
          // Only accept if reasonable match (>40%)
          if(bestScore < 0.4) match = null;
        }
      } else if(wantFuzzy){
        // User wants fuzzy match but didn't specify a name — show list of recent contacts
        const top5 = contacts.slice(0, 5);
        return `Tumhare contacts me se kisi ka chat khol du? Naam batao ya choose karo:\n\n${top5.map((u,i)=>`${i+1}. @${u.username}`).join('\n')}\n\nType: "open chat @username" ya "open chat <name>"`;
      }

      if(match){
        setTimeout(()=>startDM(match.id), 500);
        return `✅ @${match.username} ka chat khol raha hu... 😊`;
      } else if(targetUser){
        // Show closest matches
        const similar = contacts
          .map(u => ({u, score: stringSimilarity(u.username?.toLowerCase()||'', targetUser.toLowerCase())}))
          .sort((a,b) => b.score - a.score)
          .slice(0, 3)
          .filter(x => x.score > 0.2);

        if(similar.length){
          return `@${targetUser} exact nahi mila, kya inme se koi hai?\n\n${similar.map(x=>`• @${x.u.username} (${Math.round(x.score*100)}% match)`).join('\n')}\n\nType: "open chat @${similar[0].u.username}"`;
        }
        return `@${targetUser} tumhare contacts me nahi mila. Pehle follow karo ya username check karo. 🔍`;
      }

      return `Kiska chat kholu? Type karo: "open chat @username" ya "open chat <name>"`;
    } catch(e) {
      console.error('Chat command error:', e);
      return `Chat open karne me issue. Dobara try karo. 😅`;
    }
  }

  // Create group chat / GC
  if(t.match(/(?:create|make|banai|banana|start)\s+(?:a\s+)?(?:group|gc|group chat)/) || t.includes('gc bana') || t.includes('group bana')){
    return `🤝 Group Chat banane ke steps:\n\n1. DMs tab pe jao (bottom navigation)\n2. Top right pe ✏️ (pencil) icon tap karo\n3. "New Group" choose karo\n4. Members select karo apni following list se\n5. Group name daalo\n6. "Create" tap karo\n\nBas! Group chat ready 🎉\n\nKoi aur help chahiye?`;
  }

  // ── AI CAPTION / COMMENT / REPLY GENERATION ──
  if(t.match(/caption generate|caption likh|caption bana|caption de/) || (t.includes('caption') && t.includes('suggest'))){
    return await generateSmartCaption(t);
  }
  if(t.match(/comment generate|comment likh|comment suggest|reply generate|reply likh|smart reply|reply suggest/)){
    return await generateSmartReply(t);
  }

  // ── AI FRIEND RECOMMENDATIONS ──
  if(t.includes('friend recommend') || t.includes('kisse dosti') || t.includes('suggest friends') || t.includes('follow kise kare')){
    return await getAIFriendRecommendations();
  }

  // ── AI PROFILE ANALYZER ──
  if(t.includes('profile analyz') || t.includes('mera profile analyze') || t.includes('personality score') || t.includes('personality bata')){
    return await analyzeMyProfile();
  }

  // ── TRANSLATE POST ──
  if(t.startsWith('translate ') || t.includes('translate karo') || t.includes('anuvad karo')){
    return `🌍 Translation feature:\n\nKisi bhi post pe tap karo, ⋮ menu me "🌍 Translate" option milega. Post automatically tumhari language me translate ho jayegi!\n\nSupported: English, Hindi, Punjabi, Arabic, Spanish, French, German, Portuguese, Chinese, Japanese, etc.`;
  }

  // ── NOVA UNIVERSE ──
  if(t.includes('nova universe') || t.includes('universe khol')){
    return await showNovaUniverseOverview();
  }

  // ── CHANNELS / COMMUNITIES ──
  if(t.includes('channel') && (t.includes('create') || t.includes('bana') || t.includes('join'))){
    return `📺 Channel banane ke steps:\n\n1. DMs tab pe jao\n2. "Channels" tab pe switch karo\n3. "+ New Channel" tap karo\n4. Channel name, description, aur category set karo\n5. Create!\n\nChannel me unlimited members ho sakte hain, broadcasts kar sakte ho. 📢`;
  }
  if(t.includes('community') && (t.includes('create') || t.includes('bana') || t.includes('join'))){
    return `🌐 Community banane ke steps:\n\n1. Profile → Communities\n2. "+ New Community" tap karo\n3. Name, topic, rules set karo\n4. Members invite karo\n5. Forums, voice rooms, events host karo!\n\nCommunities me multiple channels, voice rooms, aur forums ho sakte hain. 🎯`;
  }
  if(t.includes('voice room') || t.includes('audio room')){
    return `🎙️ Voice Room:\n\n1. Kisi community me jao\n2. "Voice Rooms" tab pe tap karo\n3. "+ Start Room" tap karo\n4. Topic set karo\n5. People join karenge aur real-time baat hogi!\n\nDiscord-style voice channels. 🎧`;
  }

  // ── CREATOR ECONOMY ──
  if(t.includes('paisa kaise') || t.includes('earn kaise') || t.includes('monetiz') || t.includes('creator earning') || t.includes('tips kaise')){
    return `💰 Creator Earnings:\n\nNovaSocial pe paisa kamane ke 5 tareeke:\n\n1. 💵 Tips & Donations — Followers direct tip bhej sakte hain\n2. 🔒 Paid Posts — Premium content ke liye charge karo\n3. 👑 Memberships — Monthly subscription offer karo\n4. 🛍️ Digital Products — Ebooks, courses, presets becho\n5. 📺 Paid Stories — Exclusive stories for paying fans\n\nProfile → Creator Dashboard → Enable monetization. 🚀`;
  }
  if(t.includes('wallet') || t.includes('mera balance') || t.includes('earning dekh')){
    setTimeout(()=>showCreatorWallet(), 500);
    return `💰 Creator wallet khol raha hu...`;
  }

  // ── MEMORIES ──
  if(t.includes('memory') || t.includes('yaad') || t.includes('1 year ago') || t.includes('flashback')){
    setTimeout(()=>showMemories(), 500);
    return `📸 Memories khol raha hu... "1 year ago" wali posts yahan dikhegi!`;
  }
  if(t.includes('mood timeline') || t.includes('mood history')){
    setTimeout(()=>showMoodTimeline(), 500);
    return `🎭 Mood Timeline khol raha hu...`;
  }
  if(t.includes('ai journal') || t.includes('daily summary') || t.includes('mera diary')){
    setTimeout(()=>showAIJournal(), 500);
    return `📔 AI Journal khol raha hu...`;
  }

  // ── AI VIDEO EDITOR ──
  if(t.includes('video edit') || t.includes('reel edit') || t.includes('ai editor')){
    setTimeout(()=>showAIVideoEditor(), 500);
    return `🎬 AI Video Editor khol raha hu... Auto cuts, subtitles, transitions, sab AI karega!`;
  }

  // ── AVATAR ──
  if(t.includes('avatar bana') || t.includes('create avatar') || t.includes('mera avatar')){
    setTimeout(()=>showAvatarCreator(), 500);
    return `🧑‍🎤 Avatar Creator khol raha hu... 3D avatar banao jo tumhare comments me dikhega!`;
  }

  // ── SECURITY ──
  if(t.includes('security') || t.includes('2fa') || t.includes('two factor') || t.includes('device check')){
    setTimeout(()=>showSecurityCenter(), 500);
    return `🔒 Security Center khol raha hu... 2FA, devices, suspicious activity sab yahan!`;
  }

  // ── SMART FEED ──
  if(t.includes('mood feed') || t.includes('smart feed') || t.includes('feed mood') || (t.includes('gaming') && t.includes('mood')) || (t.includes('learning') && t.includes('mood'))){
    setTimeout(()=>showSmartFeed(), 500);
    return `🧠 Smart Feed khol raha hu... Apna mood choose karo, feed personalize ho jayegi!`;
  }

  // How to create post
  if(t.match(/(?:how|kaise)\s+.*(post|upload)/) || t.includes('post kaise') || t.includes('post banai')){
    return `📝 Post banane ke steps:\n\n1. Home screen pe top right pe ➕ icon tap karo\n2. "Post" choose karo\n3. Photo/video select karo gallery se\n4. Filter lagao (optional) — Neon, Cyber, Holo, etc.\n5. Caption likho (✨ AI Caption button se auto-generate kar sakte ho)\n6. Location add karo (optional)\n7. "Share Post" tap karo\n\nReady! 🎉`;
  }

  // How to create reel
  if(t.match(/(?:how|kaise)\s+.*(reel)/) || t.includes('reel kaise') || t.includes('reel banai')){
    return `🎬 Reel banane ke steps:\n\n1. ➕ icon tap karo\n2. "Reel" choose karo\n3. Video select karo (max 3 min)\n4. Filter aur caption add karo\n5. "Share Reel" tap karo\n\nReel Reels tab me dikhega sabko! 🎥🔥`;
  }

  // How to create story
  if(t.match(/(?:how|kaise)\s+.*(story)/) || t.includes('story kaise') || t.includes('story banai') || t.includes('story lagai')){
    return `📸 Story banane ke steps:\n\n1. ➕ icon tap karo\n2. "Story" choose karo\n3. Photo/video select karo YA "Create Text Story" tap karo (text-only story ke liye)\n4. Text add karo (drag karke move karo)\n5. Text color aur size adjust karo\n6. Close Friends ON karke sirf CF ko bhejo (optional)\n7. "Share Story" tap karo\n\nStory 24 ghante tak live rahegi! ⏰`;
  }

  // Scroll reels / open reels
  if(t.includes('reel scroll') || t.includes('reels khol') || t.includes('reels dekh') || t.includes('scroll reels') || t.includes('reels kaise dekhe')){
    setTimeout(()=>go('reels'), 500);
    return `🎬 Reels tab khol raha hu... Swipe up/down karke reels dekho! Double-tap se like karo. ❤️`;
  }

  // Go to explore
  if(t.includes('explore khol') || t.includes('explore dekh') || t.includes('search kaise') || t.includes('explore par le jao')){
    setTimeout(()=>go('explore'), 500);
    return `🔍 Explore tab khol raha hu... Yahan trending posts, users aur hashtags dhundho!`;
  }

  // Go to profile
  if(t.includes('mera profile') || t.includes('profile dekh') || t.includes('apna profile')){
    setTimeout(()=>go('profile'), 500);
    return `👤 Tumhara profile khol raha hu... Edit, customize, highlights, sab kuch yahan hai!`;
  }

  // Open notifications
  if(t.includes('notification') || t.includes('notif dekh') || t.includes('notifications khol')){
    setTimeout(()=>go('notifs'), 500);
    return `🔔 Notifications khol raha hu... Likes, comments, follows sab yahan!`;
  }

  // Open DMs
  if(t.includes('dm khol') || t.includes('dms dekh') || t.includes('messages dekh') || t.includes('chats dekh')){
    setTimeout(()=>go('dms'), 500);
    return `💬 DMs khol raha hu...`;
  }

  // Change theme
  if(t.includes('theme change') || t.includes('theme badlo') || t.includes('theme kaise') || t.includes('color change')){
    return `🎨 Theme badalne ke liye:\n\n1. Settings kholo (profile pe jao, ⚙️ icon tap karo)\n2. "Appearance" section me jao\n3. "Change Theme" tap karo\n4. 7 themes me se choose karo: Default, Cyberpunk, Aurora, Holographic, Sunset, Ocean, Pure Black\n5. Theme turant apply ho jayega! ✨\n\nTip: Long-press NovaSocial logo se bhi AI (main!) khul sakta hai 😎`;
  }

  // Live stream help
  if(t.includes('live kaise') || t.includes('live stream') || t.includes('go live')){
    return `🔴 Live stream karne ke steps:\n\n1. ➕ icon tap karo\n2. "Go Live" tap karo (red button)\n3. Live title daalo\n4. Settings choose karo (comments on/off, viewers count, close friends)\n5. "Go Live Now" tap karo\n6. Camera access do\n\nLive shuru! Viewers real-time dekh sakte ho. End karne ke liye "End" button. ⏹️`;
  }

  // Schedule post help
  if(t.includes('schedule') || t.includes('post later') || t.includes('post time set')){
    return `⏰ Post schedule karne ke steps:\n\n1. Post banate waqt "⏰ Schedule" button tap karo\n2. Date aur time choose karo\n3. "Share Post" tap karo\n4. Post scheduled! \n\nScheduled posts dekhne ke liye: ➕ → "⏰ Scheduled" tab.\nNote: Abhi ye local storage me save hote hain, future me server-side scheduling aayega. 📅`;
  }

  // Close friends help
  if(t.includes('close friend') || t.includes('cf kaise')){
    return `⭐ Close Friends manage karne ke steps:\n\n1. Profile pe jao\n2. "⭐ Close Friends" button tap karo\n3. Apni following list se users add/remove karo\n4. Close Friends-only story banate waqt "Close Friends" toggle ON karo\n\nSirf CF walo ko wo story dikhegi! 🔒`;
  }

  // Password reset
  if(t.includes('password reset') || t.includes('password change') || t.includes('password bhul') || t.includes('pass reset')){
    return `🔐 Password reset karne ke steps:\n\n1. Settings kholo (profile → ⚙️)\n2. "Account" section me jao\n3. "Reset Password" tap karo\n4. Tumhara email pe reset link aayega\n5. Email check karo, link pe click karo\n6. Naya password set karo\n\nIssue aaye to batao! 💪`;
  }

  // Block/mute help
  if(t.includes('block kaise') || t.includes('mute kaise')){
    return `🚫 Block/Mute karne ke steps:\n\n1. Us user ka profile kholo\n2. Niche "Mute User" ya "Block User" button tap karo\n\nMute: Uska content feed me nahi dikhega\nBlock: Wo tumhe follow nahi kar sakta, na hi message kar sakta\n\nSettings → Privacy → Blocked Accounts me manage kar sakte ho. 🔒`;
  }

  // Verify account
  if(t.includes('verify') || t.includes('blue tick') || t.includes('verified kaise')){
    return `✅ Verification:\n\n1. Profile → ⚙️ Settings → Account\n2. "Apply for Verification" tap karo\n3. Apni ID proof upload karo (Aadhar, PAN, etc.)\n4. Submit karo\n\nNovaSocial team review karke 3-7 din me verification badge de degi. 💎\n\nPremium "Verified Plus" badge bhi available hai — Profile → Customize → Get Verified Plus`;
  }

  // Open AI fab / theme fab
  if(t.includes('ai button show') || t.includes('ai icon show') || t.includes('floating ai')){
    showNovaAIFab();
    return `✅ Nova AI floating button ab screen pe show ho raha hai! Bottom-right me dikhega. Hide karne ke liye Settings → Appearance → "Hide AI Button" toggle. 😊`;
  }

  // What can you do
  if(t.match(/what.*(can|do)|kya.*(kar|kya)|help|madad/)){
    return `Main ye sab kar sakta hu:\n\n✍️ Caption, comment, reply generate\n📈 Trending hashtags\n💡 Post ideas\n👤 Bio generator\n🧭 App navigation\n💬 Chat kholo: "open chat @username"\n🔍 Fuzzy: "milta jhulta naam hai follower me, chat khol"\n🤝 GC banao (steps)\n🎬 Reels, posts, stories guides\n🔴 Live stream guide\n🎨 Theme change\n🔐 Password reset\n👤 Profile analyzer\n🤝 Friend recommendations\n🌍 Translation info\n💰 Creator economy guide\n🎙️ Channels, communities, voice rooms\n📸 Memories, mood timeline, AI journal\n🎬 AI video editor\n🧑‍🎤 Avatar creator\n🔒 Security center\n🧠 Smart feed (mood-based)\n\nBas batao kya help chahiye! 😊`;
  }

  return null; // No command matched, fall through to AI
}

// String similarity (Levenshtein-based, returns 0-1 score)
function stringSimilarity(s1, s2){
  if(!s1 || !s2) return 0;
  if(s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if(longer.length === 0) return 1;
  const dist = levenshtein(longer, shorter);
  return (longer.length - dist) / longer.length;
}

function levenshtein(a, b){
  const m = [];
  for(let i=0; i<=b.length; i++) m[i] = [i];
  for(let j=0; j<=a.length; j++) m[0][j] = j;
  for(let i=1; i<=b.length; i++){
    for(let j=1; j<=a.length; j++){
      if(b.charAt(i-1) === a.charAt(j-1)) m[i][j] = m[i-1][j-1];
      else m[i][j] = Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
    }
  }
  return m[b.length][a.length];
}

// ── AI CAPTION GENERATOR (SMART) ──
async function generateSmartCaption(userText){
  // Extract context from user message
  const m = userText.match(/(?:about|pe|par|on)\s+(.+?)(?:\s+(?:caption|likh|bana)|$)/i);
  const topic = m ? m[1] : 'a beautiful moment';

  const captions = [
    `✨ ${topic} — yahi toh life hai! #vibes #mood`,
    `🌟 ${topic} ke moments yaadgaar bante hain 💫`,
    `🔥 ${topic} diaries — main character energy only`,
    `💫 ${topic} — har lamha special hai ✨`,
    `🎨 ${topic} — life is art, live it your way 🖌️`,
  ];
  return `✍️ Tumhare liye 5 captions "${topic}" pe:\n\n${captions.map((c,i)=>(i+1)+'. '+c).join('\n\n')}\n\nPasand aaya to batao, aur variations bhi de sakta hu! 🎭`;
}

// ── AI SMART REPLY GENERATOR ──
async function generateSmartReply(userText){
  const m = userText.match(/reply.*?["'](.+?)["']/i);
  const context = m ? m[1] : '';

  if(!context){
    return `💬 Smart Reply use karne ke liye:\n\nType: "reply generate for: <message>"\n\nExample:\n"reply generate for: Hey, kaise ho?"\n\nMain context samajh ke 3-4 smart replies dunga! 🤖`;
  }

  const t = context.toLowerCase();
  let replies = [];
  if(t.match(/^(hi|hello|hey|namaste)/)) replies = ['Hey! 😄 Kaise ho?', 'Hi there! 👋', 'Hello! Long time no see! 🌟'];
  else if(t.match(/how are you|kaise ho/)) replies = ['Mast hu, tu bata? 😄', 'All good! Tera kya haal?', 'Ekdum fit fat! 💪'];
  else if(t.match(/thank|shukriya/)) replies = ['Anytime! 😊', 'Koi baat nahi! 🤝', 'My pleasure! ✨'];
  else if(t.match(/\?$/)) replies = ['Hmm, sochta hu 🤔', 'Haan bilkul! ✨', 'Pata nahi yaar 😅 tu bata?'];
  else replies = ['Interesting! 🤔', 'Sahi me? 😮', 'Haha 😄', 'Bata bata 👀', 'Wow! 🔥'];

  return `💬 Smart replies for: "${context}"\n\n${replies.map((r,i)=>(i+1)+'. '+r).join('\n')}\n\nChoose karke bhej do! 🚀`;
}

// ── AI FRIEND RECOMMENDATIONS ──
async function getAIFriendRecommendations(){
  try {
    // Get my following's following (friends of friends)
    const { data: myFollowing } = await db.from('follows').select('following_id').eq('follower_id', ME.id);
    const followingIds = (myFollowing||[]).map(f => f.following_id);
    followingIds.push(ME.id);

    if(followingIds.length < 2){
      return `🤝 Friend Recommendations:\n\nPehle kuch logon ko follow karo, phir AI tumhe smart suggestions dega based on:\n• Tumhare interests\n• Friends of friends\n• Similar content creators\n• Same location users\n\nExplore tab me jao aur logon ko discover karo! 🔍`;
    }

    // Get friends of friends (excluding already followed)
    const { data: fof } = await db.from('follows').select('following_id').in('follower_id', followingIds).limit(100);
    const fofCounts = {};
    (fof||[]).forEach(f => {
      if(!followingIds.includes(f.following_id)){
        fofCounts[f.following_id] = (fofCounts[f.following_id] || 0) + 1;
      }
    });

    const topRecs = Object.entries(fofCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    if(!topRecs.length){
      return `🤝 Abhi ke liye naye recommendations nahi hain. Explore tab me jao aur trending creators discover karo! 🌟`;
    }

    // Fetch profiles
    const recIds = topRecs.map(r => r[0]);
    const { data: profiles } = await db.from('profiles').select('id, username, avatar_url, full_name, followers_count').in('id', recIds);

    const recMap = {};
    profiles?.forEach(p => recMap[p.id] = p);

    let result = `🤝 Tumhare liye Friend Recommendations:\n\n`;
    result += `(Based on tumhare contacts ki network)\n\n`;
    topRecs.forEach(([uid, mutualCount], i) => {
      const p = recMap[uid];
      if(p){
        result += `${i+1}. @${p.username} — ${mutualCount} mutual contacts\n`;
      }
    });
    result += `\nType: "open chat @username" ya "follow @username" 😊`;
    return result;
  } catch(e) {
    return `🤝 Recommendations laane me issue. Explore tab try karo! 🔍`;
  }
}

// ── AI PROFILE ANALYZER ──
async function analyzeMyProfile(){
  try {
    const { data: posts } = await db.from('posts').select('caption, likes_count, comments_count, views_count, created_at').eq('user_id', ME.id).order('created_at', {ascending:false}).limit(50);
    const { data: followers } = await db.from('follows').select('id').eq('following_id', ME.id);

    if(!posts?.length){
      return `👤 Profile Analyzer:\n\nAbhi tak tumhare profile pe sufficient data nahi hai. 5+ posts karo, phir AI tumhari personality, interests, aur content style analyze karega!\n\nStats:\n• Posts: 0\n• Followers: ${followers?.length || 0}\n\nPost karo aur wapas aao! 📈`;
    }

    // Analyze captions for interests
    const allCaptions = posts.map(p => p.caption || '').join(' ').toLowerCase();
    const interests = {
      '🎮 Gaming': ['game', 'gaming', 'gamer', 'pubg', 'freefire', 'valorant', 'minecraft'],
      '💻 Tech': ['tech', 'code', 'coding', 'programming', 'developer', 'ai', 'flutter', 'python'],
      '🎵 Music': ['music', 'song', 'singing', 'guitar', 'piano', 'rap'],
      '🎬 Creator': ['creator', 'content', 'vlog', 'youtube', 'reel'],
      '🍔 Food': ['food', 'foodie', 'cooking', 'recipe', 'restaurant'],
      '✈️ Travel': ['travel', 'trip', 'wanderlust', 'explore', 'adventure'],
      '💪 Fitness': ['gym', 'fitness', 'workout', 'health', 'training'],
      '📸 Photography': ['photo', 'photography', 'camera', 'shot', 'pic'],
      '🎨 Art': ['art', 'drawing', 'painting', 'sketch', 'design'],
    };

    const detected = [];
    Object.entries(interests).forEach(([label, kws]) => {
      const count = kws.reduce((acc, kw) => acc + (allCaptions.includes(kw) ? 1 : 0), 0);
      if(count > 0) detected.push({label, count});
    });
    detected.sort((a,b) => b.count - a.count);

    const totalLikes = posts.reduce((s,p) => s + (p.likes_count||0), 0);
    const totalComments = posts.reduce((s,p) => s + (p.comments_count||0), 0);
    const avgEngagement = posts.length > 0 ? ((totalLikes + totalComments) / posts.length).toFixed(1) : 0;

    // Personality score based on engagement + consistency
    const personalityScore = Math.min(100, Math.round((avgEngagement * 2) + (posts.length * 3) + ((followers?.length||0) / 10)));

    let result = `📊 TUMHARA AI PROFILE ANALYSIS\n\n`;
    result += `🎯 Personality Score: ${personalityScore}/100\n\n`;
    result += `👥 Followers: ${followers?.length || 0}\n`;
    result += `📝 Posts: ${posts.length}\n`;
    result += `❤️ Total Likes: ${totalLikes}\n`;
    result += `💬 Total Comments: ${totalComments}\n`;
    result += `📈 Avg Engagement: ${avgEngagement}/post\n\n`;

    if(detected.length){
      result += `🎨 Detected Interests:\n`;
      detected.slice(0, 3).forEach(d => result += `${d.label} (${d.count} posts)\n`);
      result += `\n`;
    }

    // Achievement badges
    result += `🏆 Achievement Badges:\n`;
    if(posts.length >= 1) result += `✨ First Post\n`;
    if(posts.length >= 10) result += `📝 Content Creator\n`;
    if(posts.length >= 50) result += `🎬 Prolific Creator\n`;
    if((followers?.length||0) >= 10) result += `🌟 Rising Star\n`;
    if((followers?.length||0) >= 100) result += `⭐ Influencer\n`;
    if((followers?.length||0) >= 1000) result += `👑 Verified Worthy\n`;
    if(totalLikes >= 100) result += `❤️ Liked Creator\n`;
    if(totalLikes >= 1000) result += `🔥 Viral Potential\n`;

    result += `\n💡 AI Tip: `;
    if(personalityScore < 30) result += `Regular posting karo, hashtags use karo, aur logon ke saath interact karo! 🚀`;
    else if(personalityScore < 60) result += `Great going! Stories aur reels add karo reach badhane ke liye! 📈`;
    else result += `Excellent! Tum top creator ho. Communities banao aur collabs karo! 👑`;

    return result;
  } catch(e) {
    return `Profile analyze karne me issue. ${e.message}`;
  }
}
