/**
 * NovaSocial AI Journal feature.
 *
 * Extracted as a classic script so inline journal handlers remain window-global
 * while AI Video Editor and subsequent Nova Ultra features remain inline.
 */
// ── AI JOURNAL ──────────────────────────────────────
function showAIJournal(){
  const scr = document.getElementById('screen');
  const today = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  scr.innerHTML = `
    <div class="topbar">
      <div onclick="goBack()" style="cursor:pointer">${ico('back')}</div>
      <span style="font-weight:700;font-size:18px;flex:1">📔 AI Journal</span>
      <div onclick="showAIJournalEntry()" style="cursor:pointer;font-size:22px">✏️</div>
    </div>

    <div style="padding:16px;background:linear-gradient(135deg,rgba(255,170,0,0.1),rgba(225,48,108,0.1));border-bottom:1px solid #1a1a1a">
      <div style="font-weight:800;font-size:16px">${today}</div>
      <div style="font-size:12px;color:#aaa;margin-top:4px">AI ne tumhari day ka summary banaya</div>
    </div>

    <!-- AI Generated Daily Summary -->
    <div style="padding:14px">
      <div style="background:linear-gradient(135deg,rgba(255,170,0,0.08),rgba(225,48,108,0.08));border:1px solid rgba(255,170,0,0.2);border-radius:18px;padding:16px;margin-bottom:14px">
        <div style="font-weight:800;font-size:14px;margin-bottom:10px">🤖 AI Daily Summary</div>
        <div style="font-size:13px;color:#ccc;line-height:1.7">
          Aaj tumne 3 posts dekhi, 2 likes kiye, aur 1 comment kiya. Tumhara mood <b>positive</b> tha. Top interest: <b>Gaming</b>.<br><br>
          💡 <b>AI Insight:</b> Tum morning me active the, afternoon me thoda slow. Kal ke liye suggestion: Ek creative post try karo!
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div class="insight-stat"><div class="insight-num">3</div><div class="insight-label">Posts Viewed</div></div>
        <div class="insight-stat"><div class="insight-num">2</div><div class="insight-label">Likes Given</div></div>
        <div class="insight-stat"><div class="insight-num">5</div><div class="insight-label">DMs Sent</div></div>
      </div>

      <!-- Mood Today -->
      <div style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px">
        <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:10px">🎭 MOOD TODAY</div>
        <div style="display:flex;justify-content:space-around;align-items:center">
          <div style="text-align:center"><div style="font-size:32px">😊</div><div style="font-size:10px;color:#888;margin-top:4px">Morning</div></div>
          <div style="text-align:center"><div style="font-size:32px">💪</div><div style="font-size:10px;color:#888;margin-top:4px">Afternoon</div></div>
          <div style="text-align:center"><div style="font-size:32px">😌</div><div style="font-size:10px;color:#888;margin-top:4px">Evening</div></div>
        </div>
      </div>

      <!-- Recent Entries -->
      <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:10px">📚 RECENT ENTRIES</div>
      ${[
        {date:'Yesterday', title:'Productive Day', preview:'Worked on 3 projects, had a great call with team...'},
        {date:'2 days ago', title:'Gaming Marathon', preview:'5 hours of Valorant with friends, ranked up!'},
        {date:'3 days ago', title:'Chill Sunday', preview:'Relaxed at home, watched 2 movies, ordered pizza...'},
      ].map(e=>`
        <div onclick="showAIJournalEntry()" style="padding:12px;background:#0f0f0f;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1px solid #1a1a1a">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <div style="font-weight:700;font-size:13px">${e.title}</div>
            <div style="font-size:10px;color:#666">${e.date}</div>
          </div>
          <div style="font-size:11px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.preview}</div>
        </div>
      `).join('')}
    </div>

    <div style="height:80px"></div>
  `;
}

function showAIJournalEntry(){
  const m = modal('✏️ New Journal Entry');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <input id="journal-title" class="inp" placeholder="Entry title...">
      <textarea id="journal-content" rows="6" class="inp" placeholder="Aaj kaisa din raha? Apne thoughts likho..." style="resize:none;line-height:1.6"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['😊 Happy','😢 Sad','💪 Motivated','😴 Tired','🤩 Excited','😌 Calm','🎨 Creative','🔥 Energetic'].map(m=>`
          <div onclick="document.querySelectorAll('.mood-chip').forEach(c=>c.style.background='#0f0f0f');this.style.background='linear-gradient(135deg,#833AB4,#E1306C)';window._journalMood='${m}'" class="mood-chip" style="padding:8px 12px;background:#0f0f0f;border-radius:14px;font-size:12px;cursor:pointer">${m}</div>
        `).join('')}
      </div>
      <button class="bgrd" onclick="saveJournalEntry()" style="padding:14px">💾 Save Entry</button>
      <button class="bgrd" onclick="generateAIJournal()" style="padding:14px;background:linear-gradient(135deg,#7afdff,#fc007c)">🤖 AI Auto-Generate</button>
    </div>
  `;
}

function saveJournalEntry(){
  const title = document.getElementById('journal-title')?.value;
  const content = document.getElementById('journal-content')?.value;
  if(!title?.trim() || !content?.trim()){
    toast('Title aur content dono chahiye');
    return;
  }
  // Save to localStorage (in production, save to DB)
  try {
    const entries = JSON.parse(localStorage.getItem('nova-journal') || '[]');
    entries.unshift({title, content, mood: window._journalMood || '😊 Happy', date: new Date().toISOString()});
    localStorage.setItem('nova-journal', JSON.stringify(entries));
  } catch(e) {}
  toast('📔 Entry saved!');
  closeModal();
  showAIJournal();
}

function generateAIJournal(){
  const content = document.getElementById('journal-content');
  if(content){
    content.value = "Aaj ka din bahut productive raha. Subah 8 baje utha, workout kiya, phir 3 ghante projects pe kaam kiya. Dopahar me dost ke saath lunch kiya aur gaming ki. Shaam me family ke saath time spend kiya. Overall mood: positive aur energetic. Kal ke liye goals: naye logon se connect karna aur ek creative post banana.";
    toast('🤖 AI ne entry generate kar di!');
  }
}
