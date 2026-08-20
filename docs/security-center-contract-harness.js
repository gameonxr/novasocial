const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'security-center.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function showSecurityCenter()',
  "modal('🔒 Security Center')",
  'Active Devices',
  'logoutDevice(\'macbook\')',
  'Recent Activity',
  'Anti-Bot Protection',
  'Login Alerts',
  'function setup2FA()',
  "modal('📱 Setup 2FA')",
  'SMS Authentication',
  'Authenticator App',
  'Email Authentication',
  'function toggleBiometric(btn)',
  'navigator.credentials',
  'Biometric not supported on this device',
  'Enabling...',
  'Enabled ✓',
  'function logoutDevice(device)',
  'se logout ho gaya'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Security Center marker missing: ${marker}`);
}
assert(html.includes('src/features/security-center.js'), 'Security Center module must remain linked from HTML');
assert(!source.includes('db.from('), 'Security Center display module must not own database writes');
assert(!source.includes('supabase'), 'Security Center display module must not own authentication transport');
assert.strictEqual((source.match(/function showSecurityCenter\(/g) || []).length, 1, 'Security Center renderer must have one module owner');
assert.strictEqual((source.match(/function setup2FA\(/g) || []).length, 1, '2FA setup helper must have one module owner');

console.log('SECURITY_CENTER_CONTRACT_HARNESS=PASS');
console.log('SESSIONS_2FA_BIOMETRIC_CAPABILITY_FEEDBACK=LOCKED');
console.log('MODULE_OWNER=src/features/security-center.js');
console.log('PRODUCTION_CHANGE=0');
