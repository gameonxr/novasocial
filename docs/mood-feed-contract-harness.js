function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const moodKeywords = {
  gaming: ['game', 'gaming', 'gamer', 'pubg', 'freefire', 'valorant', 'minecraft', 'cod', 'fortnite', 'gta', 'gameplay', 'streamer', 'esports'],
  learning: ['tutorial', 'learn', 'course', 'education', 'coding', 'programming', 'python', 'javascript', 'flutter', 'react', 'tech tip', 'study'],
  entertainment: ['funny', 'meme', 'comedy', 'lol', 'haha', 'joke', 'viral', 'trend', 'entertainment'],
  music: ['music', 'song', 'singing', 'guitar', 'piano', 'rap', 'beat', 'album', 'artist', 'cover', 'original'],
};

function filterMoodPosts({ mood, posts, followingIds, meId, blockedIds = new Set(), mutedIds = new Set(), generation = 1, currentGeneration = 1 }) {
  const events = [`scope:${[...new Set([...followingIds, meId])].join(',')}`];
  if (!followingIds.length && !meId) return { posts: [], events: [...events, 'renderHome'] };
  let filtered = posts.filter(post => [...new Set([...followingIds, meId])].includes(post.user_id));
  if (mood !== 'default' && moodKeywords[mood]) {
    const keywords = moodKeywords[mood];
    filtered = filtered.filter(post => keywords.some(keyword => (post.caption || '').toLowerCase().includes(keyword)));
    events.push(`mood.filter:${mood}`);
  }
  filtered = filtered.filter(post => !blockedIds.has(post.user_id) && !mutedIds.has(post.user_id));
  events.push(`valid:${filtered.length}`);
  if (generation !== currentGeneration) return { posts: filtered, events: [...events, 'generation.abort'], rendered: false };
  if (!filtered.length) return { posts: [], events: [...events, `empty:${mood}`], rendered: true };
  return { posts: filtered, events: [...events, 'list.clear', 'list.render', 'video-observer.schedule:300', 'dom-prune.schedule:350'], rendered: true };
}

(() => {
  const posts = [
    { id: 'p1', user_id: 'u1', caption: 'Gaming in PUBG tonight' },
    { id: 'p2', user_id: 'u2', caption: 'A coding tutorial in Python' },
    { id: 'p3', user_id: 'u3', caption: 'Funny meme for everyone' },
    { id: 'p4', user_id: 'me', caption: 'My gym workout' },
    { id: 'p5', user_id: 'u1', caption: 'Travel to the beach' },
  ];
  const gaming = filterMoodPosts({ mood: 'gaming', posts, followingIds: ['u1', 'u2'], meId: 'me' });
  assert(gaming.posts.map(post => post.id).join(',') === 'p1,p2', 'Gaming mood must preserve production substring matching, including cod→coding overlap');
  assert(gaming.events.includes('list.clear') && gaming.events.includes('video-observer.schedule:300'), 'Non-empty mood feed must render and schedule observers/pruning');

  const defaultMood = filterMoodPosts({ mood: 'default', posts, followingIds: ['u1'], meId: 'me' });
  assert(defaultMood.posts.map(post => post.id).join(',') === 'p1,p4,p5', 'Default mood must skip keyword filtering while preserving supplied database order and scope');

  const blockedMuted = filterMoodPosts({ mood: 'default', posts, followingIds: ['u1', 'u2'], meId: 'me', blockedIds: new Set(['u1']), mutedIds: new Set(['u2']) });
  assert(blockedMuted.posts.length === 1 && blockedMuted.posts[0].id === 'p4', 'Blocked and muted authors must be removed after mood filtering');

  const empty = filterMoodPosts({ mood: 'music', posts, followingIds: ['u1'], meId: 'me' });
  assert(empty.posts.length === 0 && empty.events.includes('empty:music'), 'No matching mood posts must render the empty state');

  const stale = filterMoodPosts({ mood: 'gaming', posts, followingIds: ['u1'], meId: 'me', generation: 2, currentGeneration: 3 });
  assert(!stale.rendered && stale.events.includes('generation.abort') && !stale.events.includes('list.render'), 'Stale render generation must not overwrite feed DOM');

  const noScope = filterMoodPosts({ mood: 'default', posts, followingIds: [], meId: null });
  assert(noScope.events.includes('renderHome'), 'Missing scope must fall back to home render');

  console.log(JSON.stringify({ passed: true, gaming, defaultMood, blockedMuted, empty, stale, noScope }, null, 2));
})();
