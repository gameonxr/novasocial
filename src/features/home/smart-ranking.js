/**
 * NovaSocial Smart Feed ranking feature.
 *
 * Loaded after the inline application script and before the final Nova Init
 * and like-effects wrappers so its existing renderHome timing is preserved.
 */
// ── SMART FEED RANKING ALGORITHM (Client-side, Instagram-style) ──────────────────────────────────────
function calculatePostRank(post, userInterests = [], isFollowing = false, mutualCount = 0){
  if(!post) return 0;

  // 1. Engagement score (weighted)
  const likes = post.likes_count || 0;
  const comments = post.comments_count || 0;
  const shares = post.shares_count || 0;
  const saves = post.saves_count || 0;
  const views = post.views_count || 1;

  const engagementScore = (
    (likes * 1.0) +
    (comments * 5.0) +
    (shares * 10.0) +
    (saves * 8.0)
  ) / Math.max(views, 1) * 100;

  // 2. Time decay (50% loss every 24h)
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.pow(0.5, hoursOld / 24);

  let trendScore = engagementScore * timeDecay;

  // 3. Velocity boost
  if(hoursOld < 2) trendScore *= 1.5;
  else if(hoursOld < 6) trendScore *= 1.2;

  // 4. Rank formula
  let rank = trendScore * 0.50;
  if(isFollowing) rank += 30;
  rank += mutualCount * 5;

  // 5. Interest match (hashtag overlap)
  if(post.caption && userInterests.length){
    const captionLower = post.caption.toLowerCase();
    const matches = userInterests.filter(i => captionLower.includes(i.toLowerCase())).length;
    rank += matches * 10;
  }

  // 6. Recency boost
  if(hoursOld < 1) rank *= 1.3;
  else if(hoursOld < 6) rank *= 1.1;

  return rank;
}

// ── RANKED FEED LOADER (replaces simple chronological) ──────────────────────────────────────
async function loadRankedFeed(offset = 0, limit = 10){
  try {
    const { data: followingData } = await db.from('follows').select('following_id').eq('follower_id', ME.id);
    const followingIds = (followingData || []).map(f => f.following_id);
    followingIds.push(ME.id);

    if(!followingIds.length) return [];

    // Fetch 3x more posts to rank from
    const res = await db.from('posts')
      .select('*,profiles!posts_user_id_fkey(username,avatar_url,is_verified,last_seen)')
      .eq('is_reel', false).eq('is_archived', false)
      .in('user_id', followingIds)
      .order('created_at', {ascending: false})
      .range(offset, offset + limit * 3 - 1);

    let posts = res.data || [];

    // Get user interests from localStorage
    let userInterests = [];
    try { userInterests = JSON.parse(localStorage.getItem('nova-interests') || '[]'); } catch(e) {}

    // Get following set
    const followingSet = new Set(followingIds);

    // Rank posts
    posts = posts.map(p => ({
      ...p,
      _rank: calculatePostRank(p, userInterests, followingSet.has(p.user_id), 0)
    }));

    // Sort by rank (highest first)
    posts.sort((a, b) => b._rank - a._rank);

    // Return top `limit` posts
    return posts.slice(0, limit);
  } catch(e) {
    console.error('Ranked feed error:', e);
    return [];
  }
}

// ── TRACK USER INTERESTS (from liked posts) ──────────────────────────────────────
async function updateMyInterests(){
  try {
    const { data: likedPosts } = await db.from('likes')
      .select('post_id, posts!inner(caption)')
      .eq('user_id', ME.id)
      .order('created_at', {ascending: false})
      .limit(50);

    if(!likedPosts?.length) return;

    // Extract hashtags/keywords from liked captions
    const interestCounts = {};
    likedPosts.forEach(l => {
      const cap = (l.posts?.caption || '').toLowerCase();
      const tags = cap.match(/#[a-z0-9_]+/g) || [];
      tags.forEach(t => {
        interestCounts[t] = (interestCounts[t] || 0) + 1;
      });
      // Also track keywords
      const keywords = cap.match(/\b(gaming|food|travel|music|fitness|tech|art|coding|flutter|python|business|startup)\b/g) || [];
      keywords.forEach(k => {
        interestCounts[k] = (interestCounts[k] || 0) + 1;
      });
    });

    // Top 20 interests
    const topInterests = Object.entries(interestCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 20)
      .map(([k]) => k.replace('#', ''));

    try { localStorage.setItem('nova-interests', JSON.stringify(topInterests)); } catch(e) {}
  } catch(e) {
    console.error('Interest update failed:', e);
  }
}

// Patch renderHome to use ranked feed
const _origRenderHome = window.renderHome;
if(typeof _origRenderHome === 'function' && !window._rankedFeedPatched){
  window._rankedFeedPatched = true;
  // We don't override renderHome, but patch loadMoreFeedPosts to use ranked feed
}

// ── PATCH loadMoreFeedPosts — DISABLED (was causing blank feed)
// The original loadMoreFeedPosts works correctly. Ranked feed caused issues.
// Keeping original simple chronological feed for reliability.
// Ranking algorithm can be used optionally via loadRankedFeed() if needed.
/*
const _origLoadMoreFeedPosts = window.loadMoreFeedPosts;
if(typeof _origLoadMoreFeedPosts === 'function' && false){
  window.loadMoreFeedPosts = async function(){
    // DISABLED - using original
  };
}
*/
