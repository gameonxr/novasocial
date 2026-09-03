// submitStory — extracted from index.html
// Owner SHA-256: ef4ff4fadd4ad6faf5edf0c8edbb6ae6f21fb668b1cd5ca9140835d14c0fd6b6
// Classic script — exposes window.submitStory

window.submitStory = async function submitStory() {
  if(isBannedClient()) return;
  const f = window._storyFile;
  const btn = document.getElementById('story-submit-btn');
  if(!btn) return;

  const textEls = document.querySelectorAll('.story-text-overlay');
  const hasText = textEls.length > 0 && Array.from(textEls).some(el => el.innerText.trim());
  if(!f && !hasText){
    toast('Photo/video select karo ya text add karo');
    return;
  }

  btn.disabled = true; btn.textContent = 'Uploading 0%';

  try {
    let uploadFile = f;
    let mediaType = f ? (f.type.startsWith('video/') ? 'video' : 'image') : 'image';
    let overlayJSON = null;

    // Safe Video Duration Check
    if(mediaType === 'video') {
      const vid = document.createElement('video');
      vid.src = URL.createObjectURL(f);
      await Promise.race([
        new Promise(res => vid.onloadedmetadata = res),
        new Promise(res => setTimeout(res, 2000))
      ]);

      if(vid.duration && vid.duration !== Infinity && vid.duration > 50) {
        toast('Story video 50 seconds se kam ki honi chahiye!');
        btn.disabled = false; btn.textContent = 'Share Story';
        return;
      }

      // FIX: Collect text overlays as JSON for video stories
      if(hasText) {
        const prevRect = document.getElementById('story-prev').getBoundingClientRect();
        const overlays = [];
        textEls.forEach(el => {
          const text = el.innerText.trim();
          if(!text) return;
          const elRect = el.getBoundingClientRect();
          overlays.push({
            text: text,
            xPercent: ((elRect.left + elRect.width/2 - prevRect.left) / prevRect.width) * 100,
            yPercent: ((elRect.top + elRect.height/2 - prevRect.top) / prevRect.height) * 100,
            color: el.style.color || '#ffffff',
            fontSize: parseFloat(window.getComputedStyle(el).fontSize) || 24,
            fontWeight: el.style.fontWeight || '700',
            textShadow: el.style.textShadow || '0 2px 8px rgba(0,0,0,0.8)'
          });
        });
        if(overlays.length > 0) overlayJSON = JSON.stringify(overlays);
      }
    }

    // Image Canvas Text Burn (existing logic — DON'T TOUCH)
    if(mediaType === 'image') {
      if(hasText) {
        const img = new Image();
        if(f) {
          img.src = URL.createObjectURL(f);
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
          });
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth > 0 ? img.naturalWidth : 1080;
        canvas.height = img.naturalHeight > 0 ? img.naturalHeight : 1920;
        const ctx = canvas.getContext('2d');

        if(f) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#833AB4');
          grad.addColorStop(0.5, '#E1306C');
          grad.addColorStop(1, '#F77737');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const prevRect = document.getElementById('story-prev').getBoundingClientRect();

        textEls.forEach(el => {
          const text = el.innerText;
          if(!text.trim()) return;
          const elRect = el.getBoundingClientRect();

          const xRatio = (elRect.left + elRect.width/2 - prevRect.left) / prevRect.width;
          const yRatio = (elRect.top + elRect.height/2 - prevRect.top) / prevRect.height;

          const canvasX = xRatio * canvas.width;
          const canvasY = yRatio * canvas.height;

          const fontPx = parseFloat(window.getComputedStyle(el).fontSize);
          const fontRatio = fontPx / prevRect.height;
          const canvasFont = fontRatio * canvas.height;

          ctx.font = 'bold ' + canvasFont + 'px sans-serif';
          ctx.fillStyle = el.style.color || '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.fillText(text, canvasX, canvasY);
        });

        uploadFile = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
      } else if(!f) {
        toast('Kuch add karo!');
        btn.disabled = false; btn.textContent = 'Share Story';
        return;
      }
    }

    // Upload
    const url = await upload(uploadFile, p => {
      btn.textContent = 'Uploading ' + p + '%';
    }, 'post');

    const cfToggle = document.getElementById('cf-toggle');
    const isCloseFriends = cfToggle && cfToggle.checked;

    // FIX: Save overlay_data for video stories (image stories have text burned in)
    const insertData = {
      user_id: ME.id,
      media_url: url,
      media_type: mediaType,
      is_close_friends: isCloseFriends,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Add overlay_data only for video stories
    if(mediaType === 'video' && overlayJSON) {
      insertData.overlay_data = overlayJSON;
    }

    // Try insert with overlay_data, if fails retry without it (column may not exist)
    // Capture inserted story id so we can pass it to mention/reply notifications
    let newStoryId = null;
    try {
      const { data: insertedStory } = await db.from('stories').insert(insertData).select().single();
      newStoryId = insertedStory?.id || null;
    } catch(e) {
      // If overlay_data column doesn't exist, retry without it
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
    toast('Story posted!');
    // Invalidate home cache so new story stories bar mein dikhe
    invalidateTabCache('home');
    closeModal();

    const { data: newStories } = await db.from('stories').select('*,profiles!stories_user_id_fkey(username,avatar_url)').gt('expires_at', new Date().toISOString()).order('created_at',{ascending:false});
    svData = newStories || [];
    const myStoryIdx = svData.findIndex(s => s.user_id === ME.id);

    if(myStoryIdx !== -1) {
      openSV(myStoryIdx);
    } else {
      go('home');
    }
  } catch(e) {
    console.error(e);
    toast('Upload failed: ' + (e.message || 'unknown error'));
    btn.disabled = false;
    btn.textContent = 'Share Story';
  }
};
