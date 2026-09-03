// callNovaAI — extracted from index.html
// Owner SHA-256: 0e526320799e8bdfa2e5963e5ec826269ece71d06443a10ab7351e9300078c9f
// Classic script — exposes window.callNovaAI

window.callNovaAI = async function callNovaAI(userText){
  const apiKey = window.ZAI_API_KEY || '';
  if(!apiKey){
    // No API key configured — use local responses
    return getLocalAIResponse(userText);
  }

  const resp = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: novaHistory.slice(-10),
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if(!resp.ok) throw new Error('API failed: ' + resp.status);
  const data = await resp.json();
  let content = data.choices?.[0]?.message?.content || 'Hmm, samajh nahi aaya 🤔';

  // SECURITY: Sanitize response — never reveal sensitive info even from API
  const sensitivePatterns = ['api key', 'apikey', 'eyJ', 'supabase.co', 'cloudinary', 'secret', 'service_role', 'anon key'];
  if(sensitivePatterns.some(p => content.toLowerCase().includes(p.toLowerCase()))){
    return '🔒 Sorry, ye sensitive information hai. Main ye share nahi kar sakta. App features ke baare me pucho! 😊';
  }

  // NEVER mention competitor apps
  const competitorMentions = ['instagram', 'insta', 'snapchat', 'reddit', 'twitter', 'facebook', 'whatsapp', 'tiktok'];
  let sanitized = content;
  competitorMentions.forEach(c => {
    const regex = new RegExp(c, 'gi');
    sanitized = sanitized.replace(regex, 'NovaSocial');
  });

  return sanitized;
};
