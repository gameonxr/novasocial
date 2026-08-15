/**
 * NovaSocial Voice Assistant and voice conversation feature.
 *
 * Extracted as a classic script so inline voice controls remain window-global
 * while AI Auto-Moderation and later features remain inline.
 */
// ── VOICE ASSISTANT (Nova AI Voice) ──────────────────────────────────────
function startVoiceAssistant(){
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    toast('Voice assistant not supported on this device');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'hi-IN'; // Default Hindi
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = false;

  voiceRecognition.onstart = () => {
    voiceListening = true;
    showDynamicIsland('🎤 Listening...', '🎤');
  };

  voiceRecognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const inp = document.getElementById('nova-input');
    if(inp){
      inp.value = text;
      sendNovaMsg();
    }
  };

  voiceRecognition.onerror = (event) => {
    toast('Voice error: ' + event.error);
    voiceListening = false;
  };

  voiceRecognition.onend = () => {
    voiceListening = false;
  };

  voiceRecognition.start();
}

// ── VOICE-TO-VOICE CONVERSATION (Talk to Nova AI) — FIXED TURN-BASED ──────────────────────────────────────
let voiceConvActive = false;
let voiceConvRecognition = null;
let voiceConvSynth = window.speechSynthesis || null;
let voiceConvSpeaking = false; // AI bol raha hai?
let voiceConvListening = false; // User ki baat sun raha hai?
let voiceConvProcessing = false; // Response process ho raha hai?

function startVoiceConversation(){
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    toast('Voice conversation not supported. Try Chrome browser.');
    return;
  }

  if(voiceConvActive){
    stopVoiceConversation();
    return;
  }

  voiceConvActive = true;
  const btn = document.getElementById('nova-voice-conv-btn');
  if(btn){
    btn.style.background = '#E1306C';
    btn.style.borderRadius = '50%';
    btn.style.animation = 'pulse-mic 1.5s infinite';
    btn.textContent = '⏹️';
  }

  appendNovaMsg('🎙️ Voice conversation ON! Tum bolo, main sununga aur bolke jawab dunga. Stop karne ke liye button dabao.', true);

  // Start listening (turn-based: AI will stop listening while speaking)
  startVoiceConvListening();
  showDynamicIsland('🎙️ Listening... (bolna shuru karo)', '🎙️');
}

function startVoiceConvListening(){
  if(!voiceConvActive) return;
  if(voiceConvSpeaking || voiceConvProcessing) return; // Don't listen while AI is speaking or processing

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition) return;

  voiceConvRecognition = new SpeechRecognition();
  voiceConvRecognition.lang = 'hi-IN';
  voiceConvRecognition.continuous = false; // Single utterance, not continuous
  voiceConvRecognition.interimResults = false;
  voiceConvRecognition.maxAlternatives = 1;

  voiceConvRecognition.onstart = () => {
    voiceConvListening = true;
    showDynamicIsland('🎙️ Sun raha hu... bolo', '🎙️');
  };

  voiceConvRecognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    if(text.trim()){
      voiceConvProcessing = true;
      showDynamicIsland('🤔 Soch raha hu...', '🤔');
      processVoiceConversationMsg(text);
    }
  };

  voiceConvRecognition.onerror = (event) => {
    console.error('Voice conv error:', event.error);
    if(event.error === 'not-allowed'){
      toast('Microphone access denied');
      stopVoiceConversation();
      return;
    }
    // For other errors (no-speech, etc.), restart listening after a delay
    if(voiceConvActive && !voiceConvSpeaking && !voiceConvProcessing){
      setTimeout(() => startVoiceConvListening(), 500);
    }
  };

  voiceConvRecognition.onend = () => {
    voiceConvListening = false;
    // Auto-restart if still active and not speaking/processing
    if(voiceConvActive && !voiceConvSpeaking && !voiceConvProcessing){
      setTimeout(() => startVoiceConvListening(), 300);
    }
  };

  try {
    voiceConvRecognition.start();
  } catch(e) {
    console.error('Voice start error:', e);
    // Retry after delay
    setTimeout(() => { if(voiceConvActive) startVoiceConvListening(); }, 1000);
  }
}

async function processVoiceConversationMsg(text){
  appendNovaMsg(text.replace(/</g,'&lt;'), false);

  const cmdResponse = await handleNovaCommand(text);
  let aiResponse;
  if(cmdResponse){
    aiResponse = cmdResponse;
  } else {
    showNovaTyping();
    try {
      aiResponse = await callNovaAI(text);
    } catch(e) {
      aiResponse = getLocalAIResponse(text);
    }
    hideNovaTyping();
  }

  appendNovaMsg(aiResponse, true);

  // Speak the response (this will pause listening)
  voiceConvProcessing = false;
  await speakTextAsync(aiResponse);

  // After speaking, resume listening
  if(voiceConvActive){
    showDynamicIsland('🎙️ Sun raha hu... bolo', '🎙️');
    setTimeout(() => startVoiceConvListening(), 500);
  }
}

function speakText(text){
  if(!voiceConvSynth) return Promise.resolve();
  voiceConvSynth.cancel();
  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  if(!cleanText) return Promise.resolve();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = voiceConvSynth.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    if(hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => {
      voiceConvSpeaking = true;
      showDynamicIsland('🔊 Main bol raha hu...', '🔊');
      // STOP listening while speaking
      if(voiceConvRecognition){
        try { voiceConvRecognition.stop(); } catch(e) {}
      }
    };

    utterance.onend = () => {
      voiceConvSpeaking = false;
      resolve();
    };

    utterance.onerror = () => {
      voiceConvSpeaking = false;
      resolve();
    };

    voiceConvSynth.speak(utterance);
  });
}

// Async version that waits for speech to complete
async function speakTextAsync(text){
  return speakText(text);
}

function stopVoiceConversation(){
  voiceConvActive = false;
  voiceConvSpeaking = false;
  voiceConvListening = false;
  voiceConvProcessing = false;

  const btn = document.getElementById('nova-voice-conv-btn');
  if(btn){
    btn.style.background = '';
    btn.style.borderRadius = '';
    btn.style.animation = '';
    btn.textContent = '🎙️';
  }

  // Stop recognition
  if(voiceConvRecognition){
    try { voiceConvRecognition.stop(); } catch(e) {}
    voiceConvRecognition = null;
  }

  // STOP speaking immediately
  if(voiceConvSynth){
    try { voiceConvSynth.cancel(); } catch(e) {}
  }

  // Hide dynamic island
  const island = document.getElementById('dynamic-island');
  if(island) island.style.transform = 'translateX(-50%) translateY(-100px)';

  appendNovaMsg('🛑 Voice conversation band kar diya.', true);
}
