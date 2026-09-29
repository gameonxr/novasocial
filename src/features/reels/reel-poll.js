/**
 * NovaSocial Reels Interactive Poll feature.
 *
 * Extracted as a classic script while the protected Reels renderer and swipe
 * system remain inline for later high-risk extraction.
 */
// ── REELS INTERACTIVE POLL ──────────────────────────────────────
function showReelPoll(reelId){
  const m = modal('📊 Interactive Poll');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="font-weight:700;font-size:14px;margin-bottom:14px">📊 Create a Poll in Reel</div>
      <input id="poll-q" class="inp" placeholder="Poll question..." style="margin-bottom:10px">
      <input id="poll-o1" class="inp" placeholder="Option 1..." style="margin-bottom:8px">
      <input id="poll-o2" class="inp" placeholder="Option 2..." style="margin-bottom:14px">
      <button class="bgrd" onclick="saveReelPoll('${reelId}')" style="width:100%;padding:12px">Add Poll to Reel</button>
    </div>
  `;
}

function saveReelPoll(reelId){
  const q = document.getElementById('poll-q')?.value;
  const o1 = document.getElementById('poll-o1')?.value;
  const o2 = document.getElementById('poll-o2')?.value;
  if(!q || !o1 || !o2){
    toast('Sab fields bharo');
    return;
  }
  toast('📊 Poll added to reel!');
  closeModal();
}
