/**
 * NovaSocial Creator Wallet/Economy feature.
 *
 * Extracted as a classic script while Universal AI Search and later Nova
 * Ultra features remain inline for independent guarded checkpoints.
 */
// ── CREATOR WALLET / ECONOMY ──────────────────────────────────────
function showCreatorWallet(){
  const m = modal('💰 Creator Wallet');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <!-- Balance Card -->
      <div style="background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);border-radius:18px;padding:20px;margin-bottom:16px;color:#fff;position:relative;overflow:hidden">
        <div style="font-size:11px;opacity:0.8;margin-bottom:6px">TOTAL BALANCE</div>
        <div style="font-size:32px;font-weight:800;margin-bottom:14px">₹2,450.00</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;opacity:0.8">⬆️ ₹1,200 this month</div>
          <button onclick="showWithdrawOptions()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;backdrop-filter:blur(10px)">Withdraw</button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div class="insight-stat"><div class="insight-num">₹1.2k</div><div class="insight-label">Tips</div></div>
        <div class="insight-stat"><div class="insight-num">₹800</div><div class="insight-label">Paid Posts</div></div>
        <div class="insight-stat"><div class="insight-num">₹450</div><div class="insight-label">Memberships</div></div>
      </div>

      <!-- Earning Options -->
      <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:10px">💵 EARNING METHODS</div>

      <div onclick="showTipsSettings()" style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:8px;cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">💵</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Tips & Donations</div>
            <div style="font-size:11px;color:#666">Followers direct tip bhej sakte hain</div>
          </div>
          <div style="color:#3db83d;font-size:11px;font-weight:700">ON ✓</div>
        </div>
      </div>

      <div onclick="showPaidPostSettings()" style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:8px;cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">🔒</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Paid Posts</div>
            <div style="font-size:11px;color:#666">Premium content ke liye charge</div>
          </div>
          <div style="color:#3db83d;font-size:11px;font-weight:700">ON ✓</div>
        </div>
      </div>

      <div onclick="showMembershipSettings()" style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:8px;cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">👑</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Memberships</div>
            <div style="font-size:11px;color:#666">Monthly subscription tiers</div>
          </div>
          <div style="color:#666;font-size:11px">Setup →</div>
        </div>
      </div>

      <div onclick="showDigitalProducts()" style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:8px;cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">🛍️</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Digital Products</div>
            <div style="font-size:11px;color:#666">Ebooks, courses, presets</div>
          </div>
          <div style="color:#666;font-size:11px">Add →</div>
        </div>
      </div>

      <div onclick="showPaidStories()" style="background:#0f0f0f;border-radius:14px;padding:14px;border:1px solid #1a1a1a;margin-bottom:14px;cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">📺</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Paid Stories</div>
            <div style="font-size:11px;color:#666">Exclusive stories for paying fans</div>
          </div>
          <div style="color:#666;font-size:11px">Setup →</div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:10px">📊 RECENT TRANSACTIONS</div>
      ${[
        {type:'tip', user:'@rahul', amount:50, time:'2h ago'},
        {type:'paid post', user:'@priya', amount:99, time:'5h ago'},
        {type:'membership', user:'@aman', amount:199, time:'1d ago'},
        {type:'tip', user:'@sara', amount:25, time:'2d ago'},
      ].map(t=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#0f0f0f;border-radius:10px;margin-bottom:6px;border:1px solid #1a1a1a">
          <div style="font-size:20px">${t.type==='tip'?'💵':t.type==='paid post'?'🔒':t.type==='membership'?'👑':'📺'}</div>
          <div style="flex:1">
            <div style="font-size:12px;color:#fff">${t.user} — ${t.type}</div>
            <div style="font-size:10px;color:#666">${t.time}</div>
          </div>
          <div style="font-size:13px;color:#3db83d;font-weight:700">+₹${t.amount}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function showWithdrawOptions(){
  const m = modal('💸 Withdraw');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="background:rgba(0,149,246,0.08);border:1px solid rgba(0,149,246,0.2);border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="font-size:11px;color:#888">Available for withdrawal</div>
        <div style="font-size:28px;font-weight:800;color:#fff;margin-top:4px">₹2,450.00</div>
      </div>

      <div style="font-size:12px;color:#666;font-weight:700;margin-bottom:10px">Choose Method:</div>

      ${[
        ['🏦','Bank Transfer','2-3 business days','Min ₹500'],
        ['💳','UPI / Wallet','Instant','Min ₹100'],
        ['📱','PayPal','3-5 business days','Min $10'],
        ['₿','Crypto','1 hour','Min ₹1000'],
      ].map(([icon,name,time,min])=>`
        <button onclick="toast('${name} withdrawal initiated!');closeModal()" class="bout" style="display:flex;align-items:center;gap:12px;padding:14px;width:100%;text-align:left;margin-bottom:8px;border-radius:12px">
          <div style="font-size:24px">${icon}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:13px">${name}</div>
            <div style="font-size:11px;color:#666">${time} • ${min}</div>
          </div>
          <span style="color:#555">›</span>
        </button>
      `).join('')}
    </div>
  `;
}

function showTipsSettings(){ toast('💵 Tip settings — Go to profile → Wallet to manage'); }
function showPaidPostSettings(){ toast('🔒 Paid posts — Set price when creating a post'); }
function showMembershipSettings(){ toast('👑 Memberships — Go to profile → Wallet to setup'); }
function showDigitalProducts(){ showMarketplace(); }
function showPaidStories(){ toast('📺 Paid stories — Set price when creating a story'); }
