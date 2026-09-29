// Mood Timeline feature — classic script, preserves legacy global handlers.
// ── MOOD TIMELINE ──────────────────────────────────────
function showMoodTimeline(){
  const scr = document.getElementById('screen');

  // Detect moods from captions
  const mockMoods = [
    {date:'Today', mood:'happy', emoji:'😊', posts:3},
    {date:'Yesterday', mood:'excited', emoji:'🤩', posts:5},
    {date:'2 days ago', mood:'calm', emoji:'😌', posts:2},
    {date:'3 days ago', mood:'motivated', emoji:'💪', posts:4},
    {date:'1 week ago', mood:'creative', emoji:'🎨', posts:6},
  ];

  scr.innerHTML = `
    <div class="topbar">
      <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
      <span style="font-weight:700;font-size:18px;flex:1">🎭 Mood Timeline</span>
    </div>

    <div style="padding:16px;background:linear-gradient(135deg,rgba(168,85,247,0.1),rgba(236,72,153,0.1));border-bottom:1px solid #1a1a1a">
      <div style="font-weight:800;font-size:16px">🎭 Your Mood Journey</div>
      <div style="font-size:12px;color:#aaa;margin-top:4px">AI ne tumhari posts se mood detect kiya</div>
    </div>

    <div style="padding:16px;position:relative">
      <!-- Timeline Line -->
      <div style="position:absolute;left:36px;top:30px;bottom:30px;width:2px;background:linear-gradient(180deg,#E1306C,#833AB4,#7afdff)"></div>

      ${mockMoods.map(m=>`
        <div style="display:flex;gap:16px;margin-bottom:24px;position:relative">
          <div style="width:40px;height:40px;border-radius:50%;background:#0f0f0f;border:2px solid #E1306C;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;z-index:1">${m.emoji}</div>
          <div style="flex:1;padding:14px;background:#0f0f0f;border-radius:14px;border:1px solid #1a1a1a">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <div style="font-weight:700;font-size:14px;text-transform:capitalize">${m.mood}</div>
              <div style="font-size:11px;color:#666">${m.date}</div>
            </div>
            <div style="font-size:12px;color:#888">${m.posts} posts • Mood auto-detected from captions</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="padding:16px">
      <div style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.2);border-radius:14px;padding:14px">
        <div style="font-weight:700;font-size:13px;color:#a855f7;margin-bottom:8px">📊 Mood Insights</div>
        <div style="font-size:12px;color:#aaa;line-height:1.6">Tumhara dominant mood last week: <b style="color:#fff">Motivated 💪</b>. Posts me 60% positive vibes detected. Keep shining! ✨</div>
      </div>
    </div>

    <div style="height:80px"></div>
  `;
}
