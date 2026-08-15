/**
 * NovaSocial post-detail view.
 *
 * Extracted as a classic script so viewPost remains a window-global handler
 * for deep links and inline UI actions.
 */
async function viewPost(pid){
  if(!pid){toast('Invalid post');return;}
  // NAV-STACK: push post view entry
  pushNavState('post', pid, function(){ go(curTab); });

  // Main query with profiles join
  let p = null;
  try {
    const res = await db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url,is_verified,last_seen)').eq('id',pid).single();
    if(res.error){
      console.error('viewPost join error:', res.error);
      // Fallback: query without profiles join
      const fb = await db.from('posts').select('*').eq('id',pid).single();
      if(fb.error || !fb.data){
        toast('Post not found');
        return;
      }
      p = fb.data;
      // Manually fetch profile
      try {
        const { data: prof } = await db.from('profiles').select('username,avatar_url,is_verified,last_seen').eq('id', p.user_id).single();
        p.profiles = prof || { username: 'user', avatar_url: null };
      } catch(e) { p.profiles = { username: 'user', avatar_url: null }; }
    } else {
      p = res.data;
    }
  } catch(e) {
    console.error('viewPost exception:', e);
    toast('Post not found');
    return;
  }

  if(!p){toast('Post not found');return;}

  let lk=null, sv=null;
  try {
    [lk, sv] = await Promise.all([
      db.from('likes').select('reaction').eq('user_id',ME.id).eq('post_id',pid).maybeSingle(),
      db.from('bookmarks').select('id').eq('user_id',ME.id).eq('post_id',pid).maybeSingle()
    ]);
  } catch(e) { console.error('viewPost likes/bookmarks error:', e); }

  const m=modal('Post');
  m.querySelector('#mbody').innerHTML=postCard(p,!!(lk&&lk.data),!!(sv&&sv.data),(lk&&lk.data&&lk.data.reaction)||'heart');
}
