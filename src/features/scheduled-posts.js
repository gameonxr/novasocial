/**
 * NovaSocial Scheduled Posts feature.
 *
 * Extracted as a classic script so the shared scheduledPosts state and inline
 * delete handler remain available while other Nova Ultra features stay inline.
 */
// SCHEDULE POSTS (Futuristic)
// ═══════════════════════════════════════════════════════════════════════
let scheduledPosts = [];
try { scheduledPosts = JSON.parse(localStorage.getItem('nova-scheduled') || '[]'); } catch(e) {}

function showScheduledPosts(){
  const m = modal('⏰ Scheduled Posts');
  const body = m.querySelector('#mbody');

  if(!scheduledPosts.length){
    body.innerHTML = `
      <div style="padding:30px;text-align:center;color:#666">
        <div style="font-size:48px;margin-bottom:14px">⏰</div>
        <div style="font-weight:700;font-size:15px;color:#fff;margin-bottom:6px">No scheduled posts</div>
        <div style="font-size:13px">Post banate waqt "Schedule" option use karo</div>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div style="padding:14px">
      ${scheduledPosts.map((s,i)=>`
        <div class="schedule-card" style="margin-bottom:10px">
          <div style="width:50px;height:50px;border-radius:10px;overflow:hidden;background:#111;flex-shrink:0">
            ${s.mediaUrl?`<img src="${s.mediaUrl}" style="width:100%;height:100%;object-fit:cover">`:'<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:24px">📷</div>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.caption||'No caption'}</div>
            <div class="schedule-time">📅 ${new Date(s.scheduledFor).toLocaleString('en-IN')}</div>
          </div>
          <button onclick="deleteScheduledPost(${i})" style="background:transparent;border:none;color:#E1306C;cursor:pointer;padding:6px">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

function deleteScheduledPost(idx){
  if(!confirm('Delete this scheduled post?')) return;
  scheduledPosts.splice(idx,1);
  try { localStorage.setItem('nova-scheduled', JSON.stringify(scheduledPosts)); } catch(e) {}
  showScheduledPosts();
  toast('Deleted');
}
