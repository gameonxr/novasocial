// renderSV — extracted from index.html
// Owner SHA-256: 4bc053cf03987f1bd4a6d1310afda78accb41635c33aed49e0c4f3deeb4ef7c4
// Classic script — exposes window.renderSV

window.renderSV = function renderSV(){
  const bucket = svBuckets[svBucketIdx];
  if(!bucket) return closeSV();
  const story = bucket.stories[svStoryIdx];
  if(!story) {
    svBucketIdx++;
    svStoryIdx = 0;
    if(svBucketIdx >= svBuckets.length) return closeSV();
    return renderSV();
  }

  stopSVPlayback(); // Clean previous media
  svProg = 0;

  // 1. Progress Bars
  let barsHtml = '<div style="display:flex;gap:3px;width:100%">';
  for(let i=0; i<bucket.stories.length; i++) {
    barsHtml += '<div class="sv-bar-bg"><div id="sv-bar-'+i+'" class="sv-bar-fg" style="width:'+(i < svStoryIdx ? '100%' : '0%')+'"></div></div>';
  }
  barsHtml += '</div>';
  document.getElementById('sv-bars').innerHTML = barsHtml;

  // 2. Header (With Mute Button for Video)
  let isMuted = window._svMuted || false;
  let muteBtnHtml = story.media_type === 'video' ? '<div onclick="toggleSVMute()" style="cursor:pointer;padding:4px;margin-right:10px;">'+(isMuted ? ico('mute','#fff',18) : ico('unmute','#fff',18))+'</div>' : '';
  let hdrHtml = '<div onclick="closeSV();goToProfile(\''+bucket.user_id+'\')" style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1">'+av(bucket.avatar_url, bucket.username, 32)+'<div><div style="color:#fff;font-weight:700;font-size:14px">'+(bucket.username||'')+'</div><div style="color:rgba(255,255,255,0.6);font-size:11px">'+ago(story.created_at)+'</div></div></div>';
  hdrHtml += muteBtnHtml;
  hdrHtml += '<div onclick="showStoryActions(\''+story.id+'\', \''+bucket.user_id+'\')" style="cursor:pointer;padding:4px">'+ico('more','#fff')+'</div>';
  hdrHtml += '<div onclick="closeSV()" style="cursor:pointer;padding:4px;margin-left:10px">'+ico('close','#fff')+'</div>';
  document.getElementById('sv-hdr').innerHTML = hdrHtml;

  // 3. Media (Premium Loader & Smooth Timer)
  const med = document.getElementById('sv-media');
  med.innerHTML = '<div class="sv-loader"></div><div class="sv-pause-icon">'+ico('vid','#fff',24)+'</div>';

  if(story.media_type === 'video') {
    const vid = document.createElement('video');
    vid.src = story.media_url;
    vid.style.cssText = 'width:100%;height:100%;object-fit:cover;position:relative;z-index:1;';
    vid.playsInline = true;
    vid.muted = isMuted;

    vid.oncanplay = () => {
      const loader = med.querySelector('.sv-loader');
      if(loader) loader.remove();
      vid.play().catch(()=>{ vid.muted = true; window._svMuted = true; vid.play(); });
    };

    vid.ontimeupdate = () => {
      if(!svIsPaused && vid.duration > 0) {
        svProg = (vid.currentTime / vid.duration) * 100;
        const bar = document.getElementById('sv-bar-'+svStoryIdx);
        if(bar) bar.style.width = svProg + '%';
      }
    };

    vid.onended = () => { nextSV(); };
    vid.onerror = () => { med.querySelector('.sv-loader')?.remove(); nextSV(); };
    med.appendChild(vid);

    // Render overlay_data for video stories (interactive polls, mentions, etc.)
    svAppendOverlays(med, story);
  } else {
    const img = document.createElement('img');
    img.src = story.media_url;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:relative;z-index:1;';
    img.onload = () => {
      const loader = med.querySelector('.sv-loader');
      if(loader) loader.remove();
      svTimer = setInterval(() => {
        if(svIsPaused) return;
        svProg += 1;
        const bar = document.getElementById('sv-bar-'+svStoryIdx);
        if(bar) bar.style.width = svProg + '%';
        if(svProg >= 100) { nextSV(); }
      }, 50);
    };
    img.onerror = () => { med.querySelector('.sv-loader')?.remove(); nextSV(); };
    med.appendChild(img);

    // Render overlay_data for image stories (interactive polls, mentions, etc.)
    svAppendOverlays(med, story);
  }

  // 4. Premium Gestures (Swipe & Hold) - FIXED: track deltas properly
  const svEl = document.getElementById('sv');
  let touchStartX = 0, touchStartY = 0;
  let lastDeltaX = 0, lastDeltaY = 0;  // FIX: track last delta for touchend

  svEl.ontouchstart = null;
  svEl.ontouchmove = null;
  svEl.ontouchend = null;

  svEl.ontouchstart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastDeltaX = 0;
    lastDeltaY = 0;
    svIsPaused = true;
    svEl.classList.add('sv-paused');
    const vid = med.querySelector('video');
    if(vid) vid.pause();
  };

  svEl.ontouchmove = (e) => {
    lastDeltaY = e.touches[0].clientY - touchStartY;
    lastDeltaX = e.touches[0].clientX - touchStartX;

    if(Math.abs(lastDeltaY) > Math.abs(lastDeltaX)) {
      if(lastDeltaY > 0) {
        med.style.transform = 'translateY(' + (lastDeltaY * 0.5) + 'px) scale(0.95)';
        med.style.transition = 'none';
        svEl.style.opacity = 1 - (lastDeltaY / 600);
      }
    } else {
      med.style.transform = 'translateX(' + lastDeltaX + 'px) scale(0.9)';
      med.style.transition = 'none';
      med.style.opacity = 1 - Math.abs(lastDeltaX) / 300;
    }
  };

  svEl.ontouchend = (e) => {
    med.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    med.style.transform = 'translate(0,0) scale(1)';
    med.style.opacity = '1';
    svEl.style.opacity = '1';

    // FIX: use tracked lastDelta values
    const deltaY = lastDeltaY;
    const deltaX = lastDeltaX;

    if(Math.abs(deltaY) > Math.abs(deltaX)) {
      if(deltaY > 100) {
        // Swipe down - close
        closeSV();
        return;
      } else if(deltaY < -100 && bucket.user_id === ME.id) {
        // Swipe up - viewers list (only for own stories)
        showStoryViewers(story.id);
        return;
      }
    } else {
      if(deltaX < -50) {
        // Swipe left - next user
        nextUserSV();
        return;
      } else if(deltaX > 50) {
        // Swipe right - prev user
        prevUserSV();
        return;
      }
    }
    // If no significant swipe, just resume
    svIsPaused = false;
    svEl.classList.remove('sv-paused');
    const vid = med.querySelector('video');
    if(vid) vid.play().catch(()=>{});
  };

  // Mouse & Double Tap Support
  let lastTap = 0;
  svEl.onmousedown = () => { svIsPaused = true; svEl.classList.add('sv-paused'); const vid = med.querySelector('video'); if(vid) vid.pause(); };
  svEl.onmouseup = () => { svIsPaused = false; svEl.classList.remove('sv-paused'); const vid = med.querySelector('video'); if(vid) vid.play().catch(()=>{}); };
  svEl.onclick = (e) => {
    if(e.target.id === 'sv' || e.target.id === 'sv-media' || e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      const now = Date.now();
      if(now - lastTap < 300) {
        if(bucket.user_id !== ME.id) {
          reactToStory(bucket.user_id, '❤️', story.id);
          const heart = document.createElement('div');
          heart.textContent = '❤️';
          heart.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(0); font-size:80px; pointer-events:none; z-index:40; animation:heartPop 0.7s ease forwards;';
          svEl.appendChild(heart);
          setTimeout(() => heart.remove(), 700);
        }
      }
      lastTap = now;
    }
  };

  // 5. Navigation Zones (Left/Right Tap)
  document.getElementById('sv-nav').innerHTML = '<div style="flex:0 0 30%;height:100%;z-index:25" onclick="prevSV()"></div><div style="flex:0 0 70%;height:100%;z-index:25" onclick="nextSV()"></div>';

  // 6. Reply & Viewers Logic
  let replyDiv = document.getElementById('sv-reply-box');
  if(bucket.user_id === ME.id) {
    db.from('story_views').select('id', { count: 'exact', head: true }).eq('story_id', story.id).then(({ count }) => {
      replyDiv.innerHTML = '<div onclick="showStoryViewers(\''+story.id+'\')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:12px 16px;color:#fff;font-size:14px;cursor:pointer;backdrop-filter:blur(10px)">👁️ Viewed by '+(count || 0)+' people</div>';
    });
  } else {
    replyDiv.innerHTML = '<div style="flex:1;display:flex;align-items:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:4px 6px 4px 16px;backdrop-filter:blur(10px)"><input id="sv-reply" placeholder="Reply to '+(bucket.username||'')+'..." style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:14px;height:36px"><div onclick="toast(\'Stickers\')" style="cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px">😊</div></div><div onclick="reactToStory(\''+bucket.user_id+'\', \'❤️\', \''+story.id+'\')" style="cursor:pointer;width:42px;height:42px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px">❤️</div>';
    const replyInp = document.getElementById('sv-reply');
    if(replyInp) {
      replyInp.onkeydown = (e) => {
        if(e.key === 'Enter' && replyInp.value.trim()) {
          sendStoryReply(bucket.user_id, replyInp.value.trim(), story.id);
          replyInp.value = '';
          toast('Reply sent! 💬');
        }
      };
    }
  }

  // 7. Analytics
  if(story.user_id !== ME.id) {
    db.from('story_views').upsert({ story_id: story.id, viewer_id: ME.id }).then(()=>{});
  }
};
