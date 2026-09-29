// Local Nova AI fallback response generator. Later inline override patches remain in index.html.
function getLocalAIResponse(text){
  const t = text.toLowerCase();

  // Caption request
  if(t.includes('caption')){
    const captions = [
      '✨ Living my best life #vibes #mood',
      '🌅 Chasing sunsets and dreams 🌟',
      '🔥 Main character energy only 💫',
      '💫 Creating memories, not just moments ✨',
      '🌙 Midnight thoughts & city lights 🏙️',
      '💎 Diamond in the rough, shining bright ✨',
      '🎨 Life is art, paint it your way 🖌️',
      '🌊 Go with the flow, but make it iconic 🌊'
    ];
    return 'Tumhare NovaSocial post ke liye caption ideas:\n\n' + captions.slice(0,5).map((c,i)=>(i+1)+'. '+c).join('\n') + '\n\nKoi pasand aaya? 😊';
  }

  // Hashtags
  if(t.includes('hashtag')){
    return '📈 Trending hashtags on NovaSocial:\n\n#novasocial #trending #viral #explore #instagood #reels #fyp #contentcreator #aesthetic #moodboard\n\nUse 5-10 hashtags for best reach! 🚀';
  }

  // Post ideas
  if(t.includes('idea') || (t.includes('post') && !t.includes('upload'))){
    return '💡 5 Creative Post Ideas:\n\n1. 🌅 Golden hour photo dump\n2. 🎬 Behind-the-scenes reel\n3. 🍜 Local food review\n4. 📖 "Day in my life" story\n5. 🎨 Before/After transformation\n\nKaunsa try karoge? 🤔';
  }

  // Bio
  if(t.includes('bio')){
    return '👤 NovaSocial bio ideas:\n\n• ✨ Dreamer | Creator | Explorer\n• 🎯 Building my dreams one day at a time\n• ☕ Coffee + Chaos = Me\n• 🌟 50% savage, 50% sweet\n• 💫 Just here for the vibes\n• 🚀 NovaSocial creator since day one\n\nChoose karke customize kar lo! 😎';
  }

  // Smart reply
  if(t.includes('reply') || t.includes('smart')){
    return '💬 Smart reply options:\n\n• Bas mast hu, tu bata? 😄\n• All good! Kya plan hai?\n• Bindaas! Milte hain kabhi 🤝\n• Ekdum fit fat! Tera kya haal?\n\nContext ke hisaab se choose karo! 👍';
  }

  // Who made you / Identity
  if(t.match(/who.*(made|created)|tumhe.*(kisne|ne)|who are you|tum kaun/)){
    return 'Main Nova AI hu — NovaSocial team ne mujhe banaya hai. Main tumhara personal assistant hu is app ke andar. Caption, hashtags, post ideas, app navigation, sab me help kar sakta hu! 🤖✨';
  }

  // What can you do
  if(t.match(/what.*(can|do)|kya.*(kar|kya)|help|madad/)){
    return 'Main ye sab kar sakta hu:\n\n✍️ Caption suggest\n📈 Trending hashtags\n💡 Post ideas\n👤 Bio generator\n💬 Smart reply suggestions\n🧭 App navigation (chat kholo, GC banao, reels dekho, etc.)\n📚 Step-by-step guides (post, reel, story, live, etc.)\n🎨 Theme change help\n🔐 Password reset guidance\n\nBas batao kya help chahiye! 😊';
  }
  // Greetings
  if(t.match(/^(hi|hello|hey|namaste|hola)/)){
    return 'Hey ' + (PROF?.username || 'friend') + '! 😄 Main Nova AI hu, NovaSocial ka official assistant. Tumhara social media game strong banane me help karunga. Caption, hashtags, post ideas, app navigation — kuch bhi pucho! 🚀';
  }

  // Thanks
  if(t.includes('thank')){
    return 'Koi baat nahi! 😊 Aur kuch help chahiye to batao. Tumhara NovaSocial experience amazing banana mera kaam hai! ✨';
  }

  // Default
  return 'Interesting! 🤔 Maine note kar liya. Main ye sab kar sakta hu:\n\n📝 Content:\n• "caption suggest" — caption likho\n• "trending hashtags" — hashtags do\n• "post ideas" — creative ideas\n• "bio likho" — profile bio\n• "reply generate for: <msg>" — smart replies\n\n🧭 Navigation:\n• "open chat @username" — chat kholo\n• "milta jhulta naam" — fuzzy search\n• "reels khol" — reels dekho\n• "explore khol" — explore tab\n• "profile dekh" — apna profile\n• "dm khol" — messages\n\n📚 Guides:\n• "post kaise banaye"\n• "reel kaise banaye"\n• "story kaise banaye"\n• "live kaise jaaye"\n• "theme kaise badle"\n• "password reset"\n• "block kaise"\n\n🎮 Features:\n• "channel bana" — channels\n• "community bana" — communities\n• "voice room" — audio rooms\n• "game khel" — mini games\n• "marketplace" — buy/sell\n• "notes bana" — notes\n• "calendar dekh" — events\n• "news dekh" — news\n• "learn kar" — courses\n\n🎭 Fun:\n• "joke bata" — hasao\n• "quote bata" — motivation\n• "bore ho" — suggestions\n• "time bata" — current time\n\nBas batao kya help chahiye! 😊';
}
