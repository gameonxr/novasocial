// applyMoodToFeed — extracted from index.html
// Owner SHA-256: af3e49827c06bc91a2f81eaad02b437c6ba77d6076592977aab7a47561ab8b5e
// Classic script — exposes window.applyMoodToFeed

window.applyMoodToFeed = async function applyMoodToFeed(mood){
  const myGeneration = _renderGeneration; // 🛡️ Capture generation
  try {
    // Get my following + own posts
    const { data: followingData } = await db.from('follows').select('following_id').eq('follower_id', ME.id);
    const followingIds = (followingData || []).map(f => f.following_id);
    followingIds.push(ME.id);

    if(!followingIds.length){
      renderHome();
      return;
    }

    // Fetch more posts (50) to filter from
    // Part 8 Fix: explicit column list instead of select('*') — same fields as main feed query
    const res = await db.from('posts').select('id,user_id,media_url,media_type,thumbnail_url,caption,location,likes_count,comments_count,views_count,created_at,profiles!posts_user_id_fkey(username,avatar_url,is_verified,last_seen)')
      .eq('is_reel', false).eq('is_archived', false)
      .in('user_id', followingIds)
      .order('created_at', {ascending: false}).limit(50);

    let posts = res.data || [];

    // Mood keyword mapping
    const moodKeywords = {
      gaming: ['game','gaming','gamer','pubg','freefire','valorant','minecraft','cod','fortnite','gta','gameplay','streamer','esports'],
      learning: ['tutorial','learn','course','education','coding','programming','python','javascript','flutter','react','tech tip','study'],
      entertainment: ['funny','meme','comedy','lol','haha','joke','viral','trend','entertainment'],
      business: ['business','startup','entrepreneur','finance','investing','marketing','side hustle','money','crypto','stock'],
      fitness: ['gym','workout','fitness','health','training','muscle','diet','yoga','running','cardio'],
      food: ['food','foodie','recipe','cooking','restaurant','tasty','delicious','chef','cuisine','dish'],
      travel: ['travel','trip','wanderlust','explore','adventure','vacation','tour','destination','mountain','beach'],
      music: ['music','song','singing','guitar','piano','rap','beat','album','artist','cover','original'],
      art: ['art','drawing','painting','sketch','design','illustration','creative','digital art','artist'],
    };

    if(mood !== 'default' && moodKeywords[mood]){
      const kws = moodKeywords[mood];
      posts = posts.filter(p => {
        const cap = (p.caption || '').toLowerCase();
        return kws.some(kw => cap.includes(kw));
      });
    }

    // Render to feed
    const list = document.getElementById('feed-list');
    if(!list) return;

    const blockedIds = await getBlockedBothWaysSet();
    let mutedIds = new Set();
    try {
      const { data: mutedData } = await db.from('mutes').select('muted_id').eq('muter_id', ME.id);
      mutedIds = new Set((mutedData || []).map(m => m.muted_id));
    } catch(e) { console.log('mutes skip'); }
    const validPosts = posts.filter(p => !blockedIds.has(p.user_id) && !mutedIds.has(p.user_id));

    let likedSet = new Set(), savedSet = new Set(), reactionMap = {};
    const ids = validPosts.map(p => p.id);
    if(ids.length > 0){
      const [{data: lk}, {data: sv}] = await Promise.all([
        db.from('likes').select('post_id,reaction').eq('user_id', ME.id).in('post_id', ids),
        db.from('bookmarks').select('post_id').eq('user_id', ME.id).in('post_id', ids)
      ]);
      (lk||[]).forEach(x => { likedSet.add(x.post_id); reactionMap[x.post_id] = x.reaction || 'heart'; });
      (sv||[]).forEach(x => savedSet.add(x.post_id));
    }

    validPosts.forEach(p => { recordPostView(p.id); });

    // 🛡️ Race condition guard: agar user is await ke beech navigate kar gaya to DOM mat overwrite karo
    if(myGeneration !== _renderGeneration) return;

    if(!validPosts.length){
      list.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#666">
          <div style="font-size:60px;margin-bottom:16px">🎭</div>
          <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:8px">No ${mood} content found</div>
          <div style="font-size:13px;margin-bottom:20px">Try a different mood or follow more ${mood} creators</div>
          <button class="bgrd" onclick="showSmartFeed()" style="width:auto;padding:12px 28px">Change Mood</button>
        </div>
      `;
      return;
    }

    list.innerHTML = '';
    list.insertAdjacentHTML('beforeend', validPosts.map(p => postCard(p, likedSet.has(p.id), savedSet.has(p.id), reactionMap[p.id] || 'heart')).join(''));
    setTimeout(() => initVideoObserver(), 300);
    // ── Part 4: Bounded feed DOM pruning (mood feed path)
    // Mood feed clears list first, so usually under cap — call still safe (no-op if under cap)
    setTimeout(() => _pruneFeedDOM(), 350);

  } catch(e) {
    console.error('Mood feed error:', e);
    toast('Mood feed load karne me issue');
  }
};
