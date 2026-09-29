// novaDebug — extracted from index.html
// Owner SHA-256: fd245fe8ca89e0aa6c440f27a877a68978a9dcdf45d3acafbce8281f7a57f21f
// Classic script — exposes window.novaDebug

window.novaDebug = async function novaDebug(){
  console.log('═══════════════════════════════════════');
  console.log('🔍 NOVA SOCIAL DIAGNOSTIC');
  console.log('═══════════════════════════════════════');

  // 1. Check ME
  console.log('\n1️⃣ USER SESSION:');
  console.log('   ME:', ME);
  console.log('   ME.id:', ME?.id || 'NULL ❌');
  console.log('   PROF:', PROF?.username || 'NULL');

  if(!ME?.id){
    console.log('   ⚠️ ME.id is NULL! Login issue.');
    return;
  }

  // 2. Check follows
  console.log('\n2️⃣ FOLLOWS:');
  try {
    const { data: following, error } = await db.from('follows').select('following_id').eq('follower_id', ME.id);
    if(error){
      console.log('   ❌ Follows query error:', error.message);
    } else {
      console.log('   ✅ Following count:', following?.length || 0);
      console.log('   Following IDs:', following?.map(f => f.following_id));
    }
  } catch(e) { console.log('   ❌ Follows exception:', e.message); }

  // 3. Check posts (own)
  console.log('\n3️⃣ OWN POSTS:');
  try {
    const { data: myPosts, error } = await db.from('posts').select('*').eq('user_id', ME.id);
    if(error){
      console.log('   ❌ Posts query error:', error.message);
    } else {
      console.log('   ✅ Own posts count:', myPosts?.length || 0);
      if(myPosts?.length){
        const reels = myPosts.filter(p => p.is_reel);
        const nonReels = myPosts.filter(p => !p.is_reel);
        const archived = myPosts.filter(p => p.is_archived);
        console.log('   Reels:', reels.length, '| Non-reels:', nonReels.length, '| Archived:', archived.length);
      }
    }
  } catch(e) { console.log('   ❌ Posts exception:', e.message); }

  // 4. Check posts with profiles join
  console.log('\n4️⃣ POSTS WITH PROFILES JOIN:');
  try {
    const { data: postsWithProf, error } = await db.from('posts').select('*,profiles!posts_user_id_fkey(username,avatar_url)').eq('user_id', ME.id).limit(3);
    if(error){
      console.log('   ❌ Join query error:', error.message);
      console.log('   ⚠️ Foreign key relationship may be broken!');
    } else {
      console.log('   ✅ Join works! Sample:', postsWithProf?.[0] || 'No posts');
    }
  } catch(e) { console.log('   ❌ Join exception:', e.message); }

  // 5. Check all posts (no filter)
  console.log('\n5️⃣ ALL POSTS IN DATABASE:');
  try {
    const { count, error } = await db.from('posts').select('*', { count: 'exact', head: true });
    if(error){
      console.log('   ❌ Count query error:', error.message);
    } else {
      console.log('   ✅ Total posts in DB:', count);
    }
  } catch(e) { console.log('   ❌ Count exception:', e.message); }

  // 6. Check profiles
  console.log('\n6️⃣ PROFILES TABLE:');
  try {
    const { data: profs, error } = await db.from('profiles').select('id,username').limit(3);
    if(error){
      console.log('   ❌ Profiles query error:', error.message);
    } else {
      console.log('   ✅ Profiles accessible:', profs?.length, 'sample:', profs);
    }
  } catch(e) { console.log('   ❌ Profiles exception:', e.message); }

  console.log('\n═══════════════════════════════════════');
  console.log('🔍 DIAGNOSTIC COMPLETE');
  console.log('If any query shows ❌, run the SQL reset script:');
  console.log('   /home/z/my-project/download/nova_nuclear_reset.sql');
  console.log('Then restart Supabase project.');
  console.log('═══════════════════════════════════════');
};
