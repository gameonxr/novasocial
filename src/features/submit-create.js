// submitCreate — extracted from index.html
// Owner SHA-256: eee48ee5fc404a20bad2967dc2b9fda2f1ff515e19a500cfea1deee25923fd66
// Classic script — exposes window.submitCreate

window.submitCreate = async function submitCreate(type){
  const f=document.getElementById('fpick')?.files[0];
  if(!f){toast('Pehle media select karo');return;}
  const btn=document.getElementById('cbtn');
  btn.disabled=true;btn.textContent='Uploading...';
  document.getElementById('uprog').style.display='block';
  try{
    let uploadFile=f;

    // FIX: For reels, ensure video file size is reasonable + trim if too long
    if(type === 'reel' && f.type.startsWith('video/')){
      // Check video duration and trim if needed
      const probe=document.createElement('video');
      probe.preload='metadata';
      probe.src=URL.createObjectURL(f);
      await Promise.race([
        new Promise(res=>{probe.onloadedmetadata=res;}),
        new Promise(res=>setTimeout(res,3000))
      ]);

      const dur=probe.duration;
      if(dur && dur !== Infinity && dur > 180){
        // Trim to 180s
        toast('✂️ Trimming reel to 3 min...');
        try {
          uploadFile = await trimVideo(f, 180);
        } catch(trimErr) {
          console.error('Trim failed:', trimErr);
          // Continue with original if trim fails
        }
      }

      // Warn on large files
      if(f.size > 100 * 1024 * 1024){
        if(!confirm('Video bahut bada hai (' + Math.round(f.size/1024/1024) + 'MB). Upload slow ho sakta hai. Continue?')){
          btn.disabled=false;btn.textContent='Share';
          return;
        }
      }
    }

    // Agar image hai aur filter laga hai, toh Canvas me bake karo
    // FIX: use window._selectedFilter (set by selectFilter)
    const activeFilter = window._selectedFilter || window._createFilter || 'none';
    if(f.type.startsWith('image/') && activeFilter && activeFilter !== 'none'){
      const img = new Image();
      img.src = URL.createObjectURL(f);
      await new Promise(res => img.onload = res);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.filter = activeFilter; // Apply CSS filter to canvas
      ctx.drawImage(img, 0, 0);
      uploadFile = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
    }

    const url=await upload(uploadFile,p=>{
      document.getElementById('upct').textContent=p+'%';
      document.getElementById('upfill').style.width=p+'%';
    }, 'reel');
    const cap=document.getElementById('capinp')?.value||'';
    const loc=document.getElementById('locinp')?.value||'';

    // Check if scheduled
    const schedInp = document.getElementById('schedule-time');
    if(schedInp && schedInp.value && document.getElementById('schedule-input-wrap')?.style.display === 'flex'){
      // Save as scheduled post
      const scheduledFor = new Date(schedInp.value).toISOString();
      scheduledPosts.push({
        mediaUrl: url,
        caption: cap,
        location: loc,
        type: type,
        scheduledFor: scheduledFor,
        createdAt: new Date().toISOString()
      });
      try { localStorage.setItem('nova-scheduled', JSON.stringify(scheduledPosts)); } catch(e) {}
      toast('⏰ Post scheduled for ' + new Date(scheduledFor).toLocaleString('en-IN'));
      closeModal();
      return;
    }

    // Insert with co-author if set
    // ── Part 7 Fix 2: Derive video thumbnail URL (no separate upload — uses Cloudinary so_0 frame-extraction convention)
    // Returns null gracefully if derivation fails (non-Cloudinary URL, unexpected format) — upload is NOT blocked
    const _isVideoUpload = f.type.startsWith('video/');
    const _thumbnailUrl = _isVideoUpload ? _deriveVideoThumbnailUrl(url) : null;
    const insertData = {
      user_id: ME.id,
      media_url: url,
      media_type: _isVideoUpload ? 'video' : 'image',
      is_reel: type === 'reel',
      caption: cap,
      location: loc,
      thumbnail_url: _thumbnailUrl // null for images or if derivation failed — DB column already exists
    };

    // Add co-author if exists (column may not exist in DB - try/catch)
    if(window._collabAuthor){
      try {
        insertData.co_author_id = window._collabAuthor.id;
      } catch(e) {}
    }

    const _collabAuthorRef = window._collabAuthor; // Save ref before reset

    try {
      await db.from('posts').insert(insertData).throwOnError();
    } catch(e) {
      // Part 12 Fix: If rate-limit error, propagate immediately (don't retry without co_author)
      if(e.message?.includes('RATE_LIMIT_EXCEEDED')) throw e;
      console.warn('Insert with co_author failed, retrying:', e);
      // If co_author_id column doesn't exist, retry without it
      delete insertData.co_author_id;
      try {
        await db.from('posts').insert(insertData).throwOnError();
      } catch(e2) {
        console.error('Insert also failed without co_author:', e2);
        throw new Error(e2.message || 'DB insert failed');
      }
    }

    // Reset state
    window._collabAuthor = null;
    window._selectedFilter = 'none';

    // Notify co-author
    if(_collabAuthorRef){
      try {
        await sendNotif(_collabAuthorRef.id, 'mention', {message: `added you as co-author on a new post`});
      } catch(e) {}
    }

    // Send mention notifications
    try {
      // Get the post ID from the inserted post
      const { data: newPost } = await db.from('posts').select('id').eq('user_id', ME.id).order('created_at', {ascending: false}).limit(1).single();
      if(newPost) {
        await sendMentionNotifications(newPost.id);
        // ── Part 10 Fix: Extract hashtags from caption + upsert into hashtags/post_hashtags tables
        // Non-blocking (try/catch) — never fails the post creation if hashtag extraction has issues.
        try { await _extractAndStoreHashtags(newPost.id, cap); } catch(e) { console.warn('[Hashtags] Extract failed:', e.message); }
        // Notify all followers about new post
        try {
          const{data:followers}=await db.from('follows').select('follower_id').eq('following_id',ME.id).limit(200);
          if(followers?.length){
            const notifRows = followers.map(f=>({recipient_id:f.follower_id, sender_id:ME.id, type:'new_post', post_id:newPost.id, message:'shared a new post'}));
            await db.from('notifications').insert(notifRows);
          }
        } catch(e) {}
      }
    } catch(e) {}

    toast(type==='reel'?'Reel posted!':'Post shared!');
    // Invalidate relevant tab caches so naya post turant dikhe
    invalidateTabCache('home');
    invalidateTabCache('profile');
    invalidateTabCache('explore');

    // ── Fix 2: Agar new reel create hua, persistent-container destroy karo
    // taaki next Reels tab visit pe fresh rebuild ho (new reel top pe dikhe)
    if (type === 'reel') {
      destroyReelsPersistentContainer();
    }

    closeModal();
    go(type==='reel'?'reels':'home');
  }catch(e){
    console.error('submitCreate error:', e);
    // Part 12 Fix: Handle server-side rate-limit errors with friendly message
    if(e.message?.includes('RATE_LIMIT_EXCEEDED')) {
      const friendlyMsg = e.message.split('RATE_LIMIT_EXCEEDED:')[1]?.trim() || 'You are doing that too fast. Please wait a moment.';
      toast(friendlyMsg);
    } else {
      let errMsg = 'Upload failed';
      if(e.message) errMsg = e.message.substring(0, 100);
      if(e.message?.includes('network') || e.message?.includes('Network')) errMsg = 'Network issue. Check internet.';
      if(e.message?.includes('413') || e.message?.includes('too large')) errMsg = 'File too large. Try smaller video.';
      toast(errMsg);
    }
    btn.disabled=false;
    btn.textContent = type==='reel'?'Share Reel':'Share';
  }
};
