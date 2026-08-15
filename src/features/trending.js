/**
 * NovaSocial Trending and hashtag indexing feature.
 *
 * Extracted as a classic script so submitCreate hashtag indexing and inline
 * Trending navigation continue to resolve through window globals.
 */
// TRENDING HASHTAGS PAGE (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
/**
 * Part 10 Fix: Extract hashtags from caption + store in hashtags/post_hashtags tables.
 * Non-blocking — wraps everything in try/catch, never throws.
 *
 * Schema (verified):
 * - hashtags table: id (UUID PK), name (TEXT), posts_count (INTEGER)
 * - post_hashtags table: post_id (UUID FK posts), hashtag_id (UUID FK hashtags.id)
 *
 * Uses atomic RPC `increment_hashtag_count(tag_name TEXT)` which:
 *   INSERT INTO hashtags (name, posts_count) VALUES (tag_name, 1)
 *   ON CONFLICT (name) DO UPDATE SET posts_count = hashtags.posts_count + 1
 *   RETURNING id;
 * This is race-condition-safe (no read-then-write, single atomic operation).
 *
 * @param {string} postId - The newly created post's UUID
 * @param {string} caption - The post's caption text
 */
async function _extractAndStoreHashtags(postId, caption) {
  if (!postId || !caption) return;
  const tags = caption.match(/#[\w]+/g) || [];
  if (!tags.length) return;

  // Deduplicate (same hashtag multiple times in one caption = count once)
  const uniqueTags = [...new Set(tags)];

  for (const tag of uniqueTags) {
    try {
      // Step 1: Atomic increment + get hashtag UUID via RPC (race-condition-safe)
      const { data: hashtagId, error } = await db.rpc('increment_hashtag_count', { tag_name: tag });
      if (error) {
        console.warn('[Hashtags] RPC failed for', tag, error.message);
        continue; // skip post_hashtags insert if we don't have the id
      }

      // Step 2: Insert into post_hashtags linking table (using hashtag_id UUID)
      if (hashtagId) {
        try {
          await db.from('post_hashtags').insert({
            post_id: postId,
            hashtag_id: hashtagId
          });
        } catch(e) {
          // Duplicate link (same post + same hashtag) — ignore silently
        }
      }
    } catch(e) {
      console.warn('[Hashtags] Failed to store hashtag', tag, e.message);
    }
  }
}

async function showTrendingPage(){
  const scr = document.getElementById('screen');

  // ── Part 10 Fix: Query hashtags table directly instead of scanning 500 post captions
  // Schema (verified): hashtags(id UUID, name TEXT, posts_count INTEGER)
  let topTags = [];
  try {
    const { data: hashtagData, error } = await db.from('hashtags')
      .select('name, posts_count')
      .order('posts_count', {ascending: false})
      .limit(20);
    if (!error && hashtagData && hashtagData.length) {
      topTags = hashtagData.map(h => [h.name, h.posts_count || 0]);
    }
  } catch(e) {
    console.warn('[Trending] hashtags table query failed, using fallback:', e.message);
  }

  // Also add some default trending
  const defaultTrending = [
    {tag:'#novasocial', count:'Trending'},
    {tag:'#viral', count:'Hot'},
    {tag:'#reels', count:'Trending'},
    {tag:'#explore', count:'Hot'},
    {tag:'#instagood', count:'Trending'},
    {tag:'#fyp', count:'Hot'},
    {tag:'#trending', count:'Trending'},
    {tag:'#aesthetic', count:'Hot'},
  ];

  scr.innerHTML = `
    <div class="topbar">
      <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
      <span style="font-weight:700;font-size:18px">🔥 Trending</span>
      <div style="width:24px"></div>
    </div>

    <div style="padding:16px">
      <div style="background:linear-gradient(135deg,rgba(225,48,108,0.15),rgba(131,58,180,0.15));border:1px solid rgba(225,48,108,0.2);border-radius:18px;padding:16px;margin-bottom:16px">
        <div style="font-weight:800;font-size:16px;color:#fff;margin-bottom:6px">🚀 Top Trends Right Now</div>
        <div style="font-size:12px;color:#aaa">Most used hashtags in last 500 posts</div>
      </div>

      ${topTags.length ? topTags.map((t,i)=>`
        <div class="trending-tag" onclick="searchHashtag('${t[0]}')">
          <div class="trending-rank">${i+1}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:15px;color:#fff">${t[0]}</div>
            <div style="font-size:12px;color:#888">${t[1]} posts</div>
          </div>
          <div style="color:#E1306C;font-size:24px;font-weight:800">${i<3?'🔥':'📈'}</div>
        </div>
      `).join('') : defaultTrending.map((t,i)=>`
        <div class="trending-tag" onclick="searchHashtag('${t.tag}')">
          <div class="trending-rank">${i+1}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:15px;color:#fff">${t.tag}</div>
            <div style="font-size:12px;color:#888">${t.count}</div>
          </div>
          <div style="color:#E1306C;font-size:24px;font-weight:800">${i<3?'🔥':'📈'}</div>
        </div>
      `).join('')}

      <div style="height:80px"></div>
    </div>
  `;
}

async function searchHashtag(tag){
  go('explore');
  setTimeout(()=>{
    const q = document.getElementById('sq');
    if(q){ q.value = tag; doSearch(tag); }
  }, 300);
}

// ═══════════════════════════════════════════════════════════════════════
