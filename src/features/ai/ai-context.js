/**
 * NovaSocial AI context state and mood detection.
 *
 * Loaded before the inline application script so later AI patches can use the
 * shared global lexical state without moving their timing or implementation.
 */
// ── ADVANCED AI — Context Awareness ──────────────────────────────────────
// AI remembers context from recent commands
let novaAIContext = {
  lastCommand: null,
  lastTopic: null,
  pendingAction: null,
  userMood: null
};

// Detect user mood from message
function detectUserMood(text){
  const t = text.toLowerCase();
  const moods = {
    happy: ['happy', 'khush', 'mast', 'great', 'awesome', '😊', '😄', '❤️'],
    sad: ['sad', 'udaas', 'depressed', '😔', '😢', '😭', 'akela'],
    angry: ['angry', 'gussa', 'frustrated', '😤', '😡', 'annoyed'],
    excited: ['excited', 'excited hu', 'can\'t wait', '🤩', '🔥', 'pumped'],
    tired: ['tired', 'thaka', 'exhausted', '😴', 'sleepy'],
    motivated: ['motivated', 'pumped', 'let\'s do', '💪', 'hustle'],
    confused: ['confused', 'samajh nahi', 'pata nahi', '🤔', 'kya karu'],
  };

  for(const [mood, keywords] of Object.entries(moods)){
    if(keywords.some(k => t.includes(k))) return mood;
  }
  return null;
}
