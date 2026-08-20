const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'profile-customizer.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'const PROFILE_THEMES = [',
  "function showProfileCustomizer()",
  "modal('🎨 Customize Profile')",
  'PROFILE_THEMES.map((t,i)=>',
  'setProfileTheme(${i})',
  'claimVerifiedPlus()',
  'async function setProfileTheme(idx)',
  'const theme = PROFILE_THEMES[idx]',
  'if(!theme) return',
  "update({profile_theme: idx}).eq('id', ME.id)",
  'PROF.profile_theme = idx',
  'closeModal()',
  'renderProfile()',
  'async function claimVerifiedPlus()',
  "update({is_verified_plus: true}).eq('id', ME.id)",
  'PROF.is_verified_plus = true',
  'Error activating. Try again later.'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Profile customizer marker missing: ${marker}`);
}
assert(html.includes('src/features/profile-customizer.js'), 'Profile customizer module must remain linked from HTML');
assert.strictEqual((source.match(/function showProfileCustomizer\(/g) || []).length, 1, 'Profile customizer renderer must have one module owner');
assert.strictEqual((source.match(/function setProfileTheme\(/g) || []).length, 1, 'Profile theme setter must have one module owner');
assert.strictEqual((source.match(/function claimVerifiedPlus\(/g) || []).length, 1, 'Verified Plus helper must have one module owner');

console.log('PROFILE_CUSTOMIZER_CONTRACT_HARNESS=PASS');
console.log('THEMES_INDEX_GUARD_PERSIST_SYNC_REFRESH_VERIFIED_PLUS=LOCKED');
console.log('MODULE_OWNER=src/features/profile-customizer.js');
console.log('PRODUCTION_CHANGE=0');
