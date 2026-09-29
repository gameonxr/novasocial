/**
 * NovaSocial AI Caption and Hashtag generators.
 *
 * Extracted as a classic script so create-modal controls remain window-global
 * while Nova AI initialization and Stories/DMs/Reels/Calls stay inline.
 */
// AI CAPTION GENERATOR (Futuristic - integrated with create modal)
// ═══════════════════════════════════════════════════════════════════════
async function generateAICaption(){
  const capinp = document.getElementById('capinp');
  if(!capinp) return;

  // Show loading state on button
  const btn = event?.target;
  if(btn){ btn.textContent = '✨ Generating...'; btn.disabled = true; }

  try {
    // Try GLM API first
    const prompt = 'Generate ONE creative NovaSocial-style caption (10-15 words, with 2-3 emojis, in Hinglish mix). Just the caption, no quotes or explanation.';
    novaHistory.push({role:'user', content:prompt});
    const response = await callNovaAI(prompt);
    capinp.value = response.replace(/["']/g,'').trim();
    toast('✨ Caption generated!');
  } catch(e) {
    // Fallback
    const captions = [
      '✨ Living my best life #vibes',
      '🌅 Chasing dreams and sunsets 🌟',
      '🔥 Main character energy 💫',
      '💫 Creating memories, not just moments',
      '🌙 Midnight thoughts & city lights 🏙️',
      '💎 Shining bright like a diamond ✨',
      '🎨 Life is art, paint it your way 🖌️',
      '🌊 Go with the flow, make it iconic',
      '☀️ Good vibes only ✨ #blessed',
      '🎭 Be yourself, everyone else is taken 💫'
    ];
    capinp.value = captions[Math.floor(Math.random()*captions.length)];
    toast('✨ Caption generated! (offline mode)');
  }

  if(btn){ btn.textContent = '✨ AI Caption'; btn.disabled = false; }
}

async function generateAIHashtags(){
  const capinp = document.getElementById('capinp');
  if(!capinp) return;
  const currentCaption = capinp.value || '';

  // Smart hashtag suggestions based on caption keywords
  const hashtagPool = {
    food: ['#foodie','#foodporn','#instafood','#yummy','#delicious','#foodphotography','#tasty','#homemade'],
    travel: ['#travel','#wanderlust','#explore','#adventure','#travelgram','#vacation','#nature','#sunset'],
    fashion: ['#fashion','#style','#ootd','#fashionista','#trendy','#streetstyle','#lookbook','#instafashion'],
    fitness: ['#fitness','#gym','#workout','#fitlife','#health','#motivation','#training','#strong'],
    nature: ['#nature','#outdoors','#landscape','#beautiful','#mothernature','#wildlife','#sunset','#sky'],
    art: ['#art','#artist','#creative','#design','#illustration','#artwork','#sketch','#painting'],
    selfie: ['#selfie','#me','#selfietime','#instagood','#photooftheday','#picoftheday','#cute','#smile'],
    party: ['#party','#fun','#nightout','#friends','#celebration','#weekend','#goodtime','#dance'],
  };

  let hashtags = ['#novasocial','#trending','#viral','#explore','#instagood','#reels','#fyp','#contentcreator'];
  const lower = currentCaption.toLowerCase();
  for(const [key, tags] of Object.entries(hashtagPool)){
    if(lower.includes(key)){
      hashtags = [...tags.slice(0,5), ...hashtags.slice(0,3)];
      break;
    }
  }

  // Add to caption
  const existing = capinp.value || '';
  capinp.value = existing + (existing?' ':'') + hashtags.slice(0,8).join(' ');
  toast('📈 Hashtags added!');
}

// ═══════════════════════════════════════════════════════════════════════
