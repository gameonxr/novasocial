/**
 * NovaSocial Functional Marketplace feature.
 *
 * Extracted as a classic script so marketplace display and inline handlers
 * remain window-global while Learning stays inline.
 */
// ── FUNCTIONAL MARKETPLACE ──────────────────────────────────────
function showMarketplace(){
  const m = modal('🛍️ Marketplace');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:15px">🛍️ Marketplace</div>
          <div style="font-size:11px;color:#666">Digital products & services</div>
        </div>
        <button onclick="listProduct()" class="bgrd" style="padding:8px 14px;font-size:12px;width:auto;border-radius:10px">+ Sell</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {title:'Flutter Course', price:'₹999', seller:'@rahul_dev', icon:'📚', color:'linear-gradient(135deg,#0095f6,#00d4ff)', rating:4.8},
          {title:'Photo Presets Pack', price:'₹499', seller:'@sara_photo', icon:'🎨', color:'linear-gradient(135deg,#a855f7,#ec4899)', rating:4.9},
          {title:'Ebook: Coding Tips', price:'₹199', seller:'@aman_code', icon:'📖', color:'linear-gradient(135deg,#3db83d,#00ddff)', rating:4.7},
          {title:'Music Beat Pack', price:'₹799', seller:'@priya_music', icon:'🎵', color:'linear-gradient(135deg,#E1306C,#833AB4)', rating:5.0},
          {title:'Logo Design Service', price:'₹1499', seller:'@vikram_design', icon:'✏️', color:'linear-gradient(135deg,#f7931e,#ffcc00)', rating:4.6},
          {title:'Gaming Setup Guide', price:'₹299', seller:'@karan_game', icon:'🎮', color:'linear-gradient(135deg,#ff3030,#ff6b35)', rating:4.8},
        ].map(p => `
          <div onclick="buyProduct('${p.title}','${p.price}')" style="background:#0f0f0f;border-radius:14px;overflow:hidden;cursor:pointer;border:1px solid #1a1a1a">
            <div style="aspect-ratio:1;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:48px">${p.icon}</div>
            <div style="padding:10px">
              <div style="font-weight:600;font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</div>
              <div style="font-size:10px;color:#666;margin-top:2px">${p.seller}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
                <div style="font-weight:800;font-size:14px;color:#3db83d">${p.price}</div>
                <div style="font-size:10px;color:#f7931e">⭐ ${p.rating}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function listProduct(){
  showMarketplace();
}

function buyProduct(title, price){
  if(!confirm(`Buy "${title}" for ${price}?\n\nPayment will be processed securely.`)){
    return;
  }
  toast(`✅ Order placed for "${title}"! Email pe details aayenge.`);
}
