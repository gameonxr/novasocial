// svAppendOverlays — extracted from index.html
// Owner SHA-256: fdfa5b9daf8484fc110f70262bd5eb1b80a0cc63bd4f565eae9bece4a0b68331
// Classic script — exposes window.svAppendOverlays

window.svAppendOverlays = function svAppendOverlays(med, story){
  try {
    if(!story.overlay_data) return;
    const overlays = JSON.parse(story.overlay_data);
    if(!Array.isArray(overlays) || overlays.length === 0) return;

    // FIX: Append to #sv (not #sv-media) so z-index is above sv-nav (which is z-index:10)
    // #sv-media has z-index:1, anything inside it gets buried below sv-nav
    const svRoot = document.getElementById('sv');
    if(!svRoot) return;

    // Remove any existing overlay container first (for re-renders)
    const existing = svRoot.querySelector('.sv-overlay-root');
    if(existing) existing.remove();

    const overlayContainer = document.createElement('div');
    overlayContainer.className = 'sv-overlay-root';
    // z-index 30 sits ABOVE sv-nav (z-index:10) so poll taps don't advance story
    overlayContainer.style.cssText = 'position:absolute;inset:0;z-index:30;pointer-events:none';

    overlays.forEach((ov, idx) => {
      const div = document.createElement('div');

      if(ov.type === 'poll'){
        // Interactive Poll Card
        const opts = ov.options || [ov.optionA || 'Yes', ov.optionB || 'No'];
        const flexDir = opts.length > 2 ? 'column' : 'row';
        const style = _POLL_STYLES[ov.style || 0] || _POLL_STYLES[0];
        const multiVote = ov.multiVote || false;

        div.style.cssText = 'position:absolute;left:'+ov.xPercent+'%;top:'+ov.yPercent+'%;transform:translate(-50%,-50%);pointer-events:auto;z-index:31';
        div.dataset.pollIdx = idx;
        div.dataset.storyId = story.id;
        div.dataset.multiVote = multiVote ? '1' : '0';

        div.innerHTML = `
          <div class="sv-poll-card" style="background:${style.bg};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.2);border-radius:18px;padding:14px 16px;min-width:220px;max-width:280px;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
              <span style="font-size:14px;display:flex;align-items:center">${ico('poll','#FF2D7A',16)}</span>
              <div style="font-size:13px;font-weight:700;color:#fff;flex:1">${ov.question}</div>
            </div>
            <div class="sv-poll-options" style="display:flex;flex-direction:${flexDir};gap:8px">
              ${opts.map((o, i) => `
                <div class="sv-poll-opt" data-opt-idx="${i}" style="position:relative;flex:1;padding:10px 12px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);border-radius:10px;font-size:12px;color:#fff;cursor:pointer;overflow:hidden;transition:all 0.25s ease;user-select:none;-webkit-user-select:none">
                  <div class="sv-poll-bar" style="position:absolute;inset:0;background:linear-gradient(90deg,#FF2D7A,#00E5FF);opacity:0;transition:opacity 0.4s ease, width 0.6s cubic-bezier(0.4,0,0.2,1);width:0%;border-radius:10px;z-index:0"></div>
                  <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:6px">
                    <span class="sv-poll-opt-text" style="flex:1;font-weight:600">${o}</span>
                    <span class="sv-poll-opt-pct" style="font-size:11px;font-weight:700;color:#fff;opacity:0"></span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="sv-poll-meta" style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.6);text-align:center">${multiVote ? 'Multi-vote · ' : ''}Tap to vote</div>
          </div>
        `;

        // Attach click handlers to each option (with stopPropagation!)
        div.querySelectorAll('.sv-poll-opt').forEach(optEl => {
          optEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const optIdx = parseInt(optEl.dataset.optIdx, 10);
            voteStoryPoll(story.id, idx, opts, optIdx, div);
          });
          // Prevent touch from bubbling to sv-nav
          optEl.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: true});
          optEl.addEventListener('touchend', (e) => { e.stopPropagation(); }, {passive: true});
        });

        // Also stop touchstart on the whole card from pausing the story (otherwise tap on card still advances)
        div.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: true});
        div.addEventListener('click', (e) => { e.stopPropagation(); });

        // Load existing vote (if user already voted) and show results
        loadStoryPollState(story.id, idx, opts, div);

      } else if(ov.type === 'mention'){
        div.style.cssText = 'position:absolute;left:'+ov.xPercent+'%;top:'+ov.yPercent+'%;transform:translate(-50%,-50%);color:'+(ov.color||'#00E5FF')+';font-size:'+(ov.fontSize||18)+'px;font-weight:'+(ov.fontWeight||'700')+';font-family:-apple-system,sans-serif;text-shadow:'+(ov.textShadow||'0 2px 8px rgba(0,0,0,0.8)')+';white-space:nowrap;pointer-events:auto;cursor:pointer;user-select:none;background:rgba(0,229,255,0.12);padding:6px 14px;border-radius:20px;z-index:31';
        div.textContent = ov.text;
        if(ov.userId){
          div.onclick = (e) => { e.stopPropagation(); closeSV(); showUserProfile(ov.userId); };
          div.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: true});
        }
      } else if(ov.type === 'link'){
        div.style.cssText = 'position:absolute;left:'+ov.xPercent+'%;top:'+ov.yPercent+'%;transform:translate(-50%,-50%);color:'+(ov.color||'#00E5FF')+';font-size:'+(ov.fontSize||16)+'px;font-weight:600;font-family:-apple-system,sans-serif;text-shadow:'+(ov.textShadow||'0 2px 8px rgba(0,0,0,0.8)')+';white-space:nowrap;pointer-events:auto;cursor:pointer;user-select:none;background:rgba(0,229,255,0.12);padding:8px 16px;border-radius:24px;z-index:31;border:1px solid rgba(0,229,255,0.4)';
        div.textContent = ov.text;
        if(ov.url){
          div.onclick = (e) => { e.stopPropagation(); window.open(ov.url, '_blank'); };
          div.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: true});
        }
      } else {
        // Text, sticker, hashtag, location
        div.style.cssText = 'position:absolute;left:'+ov.xPercent+'%;top:'+ov.yPercent+'%;transform:translate(-50%,-50%);color:'+(ov.color||'#fff')+';font-size:'+(ov.fontSize||24)+'px;font-weight:'+(ov.fontWeight||'700')+';font-family:-apple-system,sans-serif;text-shadow:'+(ov.textShadow||'0 2px 8px rgba(0,0,0,0.8)')+';white-space:nowrap;pointer-events:none;user-select:none';
        div.textContent = ov.text;
      }

      overlayContainer.appendChild(div);
    });

    svRoot.appendChild(overlayContainer);
  } catch(err) {
    console.log('overlay render skip:', err);
  }
};
