// publishStoryEditor — extracted from index.html
// Owner SHA-256: 323362dade9dd87d75b369708e18b613908ee76b06cb1c7bccefc33ada9be860
// Classic script — exposes window.publishStoryEditor

window.publishStoryEditor = async function publishStoryEditor(){
  const btn = event.target.closest('button');
  if(btn){ btn.textContent = 'Publishing...'; btn.disabled = true; }

  try {
    const canvasArea = document.getElementById('se-canvas-area');
    const rect = canvasArea.getBoundingClientRect();
    const cfToggle = document.getElementById('se-cf-toggle');
    const isCF = cfToggle?.checked || false;

    let url = '';
    let mediaType = 'image';
    let overlayJSON = null;

    // Helper: collect interactive overlays (polls, mentions, links) that can't be burned into image
    function collectInteractiveOverlays(){
      const arr = [];
      storyEditorElements.forEach(el => {
        if(el.type === 'poll'){
          arr.push({
            type: 'poll',
            text: el.question,
            xPercent: el.x,
            yPercent: el.y,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            textShadow: 'none',
            question: el.question,
            options: el.options || [el.optionA || 'Yes', el.optionB || 'No'],
            style: el.style || 0,
            multiVote: el.multiVote || false
          });
        } else if(el.type === 'mention'){
          arr.push({
            type: 'mention',
            text: el.text,
            xPercent: el.x,
            yPercent: el.y,
            color: el.color || '#00E5FF',
            fontSize: el.fontSize || 18,
            fontWeight: el.fontWeight || 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            userId: el.userId || null,
            username: el.username || ''
          });
        } else if(el.type === 'link'){
          arr.push({
            type: 'link',
            text: el.text,
            xPercent: el.x,
            yPercent: el.y,
            color: el.color || '#00E5FF',
            fontSize: el.fontSize || 16,
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            url: el.url || ''
          });
        }
      });
      return arr;
    }

    // ── VIDEO STORY: upload original video + save overlay_data ──
    if(storyEditorMedia && storyEditorMedia.type.startsWith('video/')){
      mediaType = 'video';

      // Collect text/sticker/poll/mention overlays as JSON
      const textOverlays = [];
      storyEditorElements.forEach(el => {
        if(el.type === 'text' || (el.type === 'sticker' && el.isText) || el.type === 'hashtag' || el.type === 'location' || el.type === 'link'){
          textOverlays.push({
            type: el.type,
            text: el.text,
            xPercent: el.x,
            yPercent: el.y,
            color: el.color || '#fff',
            fontSize: el.fontSize || 24,
            fontWeight: el.fontWeight || 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          });
        } else if(el.type === 'sticker'){
          textOverlays.push({
            type: 'sticker',
            text: el.text,
            xPercent: el.x,
            yPercent: el.y,
            color: '#fff',
            fontSize: el.fontSize || 40,
            fontWeight: 400,
            textShadow: 'none'
          });
        } else if(el.type === 'mention'){
          textOverlays.push({
            type: 'mention',
            text: el.text,
            xPercent: el.x,
            yPercent: el.y,
            color: el.color || '#00E5FF',
            fontSize: el.fontSize || 18,
            fontWeight: el.fontWeight || 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            userId: el.userId || null,
            username: el.username || ''
          });
        } else if(el.type === 'poll'){
          textOverlays.push({
            type: 'poll',
            text: el.question,
            xPercent: el.x,
            yPercent: el.y,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            textShadow: 'none',
            question: el.question,
            options: el.options || [el.optionA || 'Yes', el.optionB || 'No'],
            style: el.style || 0,
            multiVote: el.multiVote || false
          });
        }
      });
      if(textOverlays.length > 0) overlayJSON = JSON.stringify(textOverlays);

      // Upload original video as-is
      toast('Uploading video...');
      url = await upload(storyEditorMedia, p => {
        if(btn) btn.textContent = 'Uploading ' + p + '%';
      }, storyEditorMedia?.type?.startsWith('video/') ? 'story_video' : 'story_image');
    }

    // ── IMAGE STORY: composite canvas (text burned in) ──
    else if(storyEditorMedia && storyEditorMedia.type.startsWith('image/')){
      const composite = document.createElement('canvas');
      composite.width = 1080;
      composite.height = 1920;
      const ctx = composite.getContext('2d');

      // Fill background
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, composite.width, composite.height);

      // Draw image (cover fit)
      const img = new Image();
      img.src = URL.createObjectURL(storyEditorMedia);
      await new Promise(res => img.onload = res);
      const scale = Math.max(composite.width / img.width, composite.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (composite.width - w)/2, (composite.height - h)/2, w, h);

      // Draw drawing canvas
      if(storyEditorCanvas){
        ctx.drawImage(storyEditorCanvas, 0, 0, composite.width, composite.height);
      }

      // Draw text/sticker elements onto image
      storyEditorElements.forEach(el => {
        if(el.type === 'text'){
          const fontSize = 24 * el.scale * (composite.width / rect.width) * 2;
          ctx.font = `${el.fontWeight || 400} ${fontSize}px ${el.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const x = (el.x / 100) * composite.width;
          const y = (el.y / 100) * composite.height;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(el.rotate * Math.PI / 180);
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          if(el.gradient){
            const grad = ctx.createLinearGradient(-200, 0, 200, 0);
            grad.addColorStop(0, '#FF2D7A');
            grad.addColorStop(1, '#00E5FF');
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = el.color || '#fff';
          }
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        } else if(el.type === 'sticker' && !el.isText){
          ctx.font = `${40 * el.scale * 2}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, (el.x/100)*composite.width, (el.y/100)*composite.height);
        }
      });

      const blob = await new Promise(res => composite.toBlob(res, 'image/jpeg', 0.9));
      const file = new File([blob], 'story.jpg', {type: 'image/jpeg'});
      toast('Uploading story...');
      url = await upload(file, p => {
        if(btn) btn.textContent = 'Uploading ' + p + '%';
      }, 'story_image');

      // Collect interactive overlays (polls, mentions, links) for image stories
      const interactiveOverlays = collectInteractiveOverlays();
      if(interactiveOverlays.length > 0) overlayJSON = JSON.stringify(interactiveOverlays);
    }

    // ── TEXT-ONLY STORY: gradient background + text ──
    else {
      const composite = document.createElement('canvas');
      composite.width = 1080;
      composite.height = 1920;
      const ctx = composite.getContext('2d');

      // Gradient background
      if(storyEditorBg){
        ctx.fillStyle = storyEditorBg;
        ctx.fillRect(0, 0, composite.width, composite.height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, composite.width, composite.height);
        grad.addColorStop(0, '#833AB4');
        grad.addColorStop(0.5, '#FF2D7A');
        grad.addColorStop(1, '#00E5FF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, composite.width, composite.height);
      }

      // Draw text
      storyEditorElements.forEach(el => {
        if(el.type === 'text'){
          const fontSize = 24 * el.scale * (composite.width / rect.width) * 2;
          ctx.font = `${el.fontWeight || 400} ${fontSize}px ${el.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.translate((el.x/100)*composite.width, (el.y/100)*composite.height);
          ctx.rotate(el.rotate * Math.PI / 180);
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = el.color || '#fff';
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        }
      });

      const blob = await new Promise(res => composite.toBlob(res, 'image/jpeg', 0.9));
      const file = new File([blob], 'story.jpg', {type: 'image/jpeg'});
      toast('Uploading story...');
      url = await upload(file, p => {
        if(btn) btn.textContent = 'Uploading ' + p + '%';
      }, 'story_image');

      // Collect interactive overlays (polls, mentions, links) for text-only stories
      const interactiveOverlays = collectInteractiveOverlays();
      if(interactiveOverlays.length > 0) overlayJSON = JSON.stringify(interactiveOverlays);
    }

    // ── SAVE TO SUPABASE ──
    const insertData = {
      user_id: ME.id,
      media_url: url,
      media_type: mediaType,
      is_close_friends: isCF,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Add overlay_data for ALL story types that have interactive overlays (polls, mentions, links)
    if(overlayJSON){
      insertData.overlay_data = overlayJSON;
    }

    // Try insert with overlay_data, if fails retry without
    // Capture inserted story id so we can pass it to mention/reply notifications
    let newStoryId = null;
    try {
      const { data: insertedStory } = await db.from('stories').insert(insertData).select().single();
      newStoryId = insertedStory?.id || null;
    } catch(e) {
      delete insertData.overlay_data;
      try {
        const { data: insertedStory } = await db.from('stories').insert(insertData).select().single();
        newStoryId = insertedStory?.id || null;
      } catch(e2) { throw e2; }
    }
    try {
      const{data:followers}=await db.from('follows').select('follower_id').eq('following_id',ME.id).limit(200);
      if(followers?.length){
        for(const f of followers){
          await sendNotif(f.follower_id, 'story_mention', {message: 'added a new story', story_id: newStoryId});
        }
      }
    } catch(e) { console.error('Story notif error:', e); }
    // Story mein specifically @mention kiye gaye users ko alag se notify karo
    try {
      const mentionedInStory = (storyEditorElements || []).filter(el => el.type === 'mention' && el.userId);
      for (const m of mentionedInStory) {
        if (m.userId === ME.id) continue;
        await sendNotif(m.userId, 'story_mention', {message: 'mentioned you in their story', story_id: newStoryId});
      }
    } catch(e) { console.error('Story mention-sticker notif error:', e); }
    toast('Story Posted!');
    // Invalidate home cache so new story stories bar mein dikhe
    invalidateTabCache('home');
    closeStoryEditor();

    // Refresh stories
    const { data: newStories } = await db.from('stories').select('*,profiles!stories_user_id_fkey(username,avatar_url)').gt('expires_at', new Date().toISOString()).order('created_at',{ascending:false});
    svData = newStories || [];
    const myStoryIdx = svData.findIndex(s => s.user_id === ME.id);
    if(myStoryIdx !== -1){
      openSV(myStoryIdx);
    } else {
      go('home');
    }
  } catch(e) {
    console.error('Story publish error:', e);
    toast('Story upload failed: ' + e.message);
    if(btn){ btn.textContent = 'Share Story'; btn.disabled = false; }
  }
};
