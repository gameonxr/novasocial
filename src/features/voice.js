/**
 * NovaSocial Voice Message Transcription helper.
 *
 * Extracted as a classic script so chat voice callbacks remain window-global.
 */
// VOICE MESSAGE TRANSCRIPTION (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
function transcribeVoiceMsg(audioBlob, callback){
  // Use Web Speech API as fallback for live transcription
  // For pre-recorded, we'd need a backend service
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    callback('Transcription unavailable');
    return;
  }
  callback('🎤 Voice message (tap to play)');
}

// ═══════════════════════════════════════════════════════════════════════
