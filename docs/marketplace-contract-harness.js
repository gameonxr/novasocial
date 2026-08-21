const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'marketplace.js'), 'utf8');

for (const marker of [
  'function showMarketplace()',
  "modal('🛍️ Marketplace')",
  "m.querySelector('#mbody')",
  'Digital products & services',
  'listProduct()',
  'Flutter Course',
  'Photo Presets Pack',
  'Ebook: Coding Tips',
  'Music Beat Pack',
  'Logo Design Service',
  'Gaming Setup Guide',
  "buyProduct('${p.title}','${p.price}')",
  'function listProduct()',
  'showMarketplace();',
  'function buyProduct(title, price)',
  'if(!confirm(`Buy "${title}" for ${price}?',
  'return;',
  'toast(`✅ Order placed for "${title}"! Email pe details aayenge.`)'
]) {
  assert(source.includes(marker), `Marketplace marker missing: ${marker}`);
}
assert.strictEqual((source.match(/title:'/g) || []).length, 6, 'Marketplace must retain six product fixtures');
assert.strictEqual((source.match(/price:'/g) || []).length, 6, 'Marketplace must retain six product prices');
assert.strictEqual((source.match(/rating:/g) || []).length, 6, 'Marketplace must retain six product ratings');
assert.strictEqual((source.match(/buyProduct\('\$\{p\.title\}','\$\{p\.price\}'\)/g) || []).length, 1, 'Marketplace must use one product-card buy template');
assert.strictEqual((source.match(/confirm\(/g) || []).length, 1, 'Marketplace must use one purchase confirmation gate');
assert(!source.includes('fetch('), 'Marketplace must not own network requests');
assert(!source.includes('supabase'), 'Marketplace must not own persistence');
assert(!source.includes('window.location'), 'Marketplace must not navigate externally');

console.log('MARKETPLACE_CONTRACT_HARNESS=PASS');
console.log('MODAL_SIX_PRODUCTS_METADATA_SELL_BUY_CONFIRMATION_CANCEL_ORDER_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/marketplace.js');
console.log('PRODUCTION_CHANGE=0');
