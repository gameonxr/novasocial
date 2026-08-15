// ═══════════════════════════════════════════════════
// CLOUDINARY MULTI-ACCOUNT CONFIG
// Naya account add karne ke liye sirf array mein ek object add karo
// ═══════════════════════════════════════════════════
const CLOUDINARY_ACCOUNTS = [
  { id: 'primary', cloud: 'dhtf1b9ak', preset: 'novasocial', label: 'Account 1' },
  { id: 'backup1', cloud: 'rvjlwaho', preset: 'novasocial', label: 'Account 2' },
];
let _cldActiveIdx = parseInt(localStorage.getItem('nova_cld_idx') || '0');
function _getCldAccount() { return CLOUDINARY_ACCOUNTS[_cldActiveIdx] || CLOUDINARY_ACCOUNTS[0]; }
function _switchCldAccount(reason = '') {
  const prev = _getCldAccount().label;
  _cldActiveIdx = (_cldActiveIdx + 1) % CLOUDINARY_ACCOUNTS.length;
  localStorage.setItem('nova_cld_idx', _cldActiveIdx);
  const next = _getCldAccount().label;
  console.warn(`☁️ Switched: ${prev} → ${next}. Reason: ${reason}`);
}
(function _checkMonthlyReset() {
  const lastMonth = localStorage.getItem('nova_cld_month');
  const thisMonth = new Date().getFullYear() + '-' + new Date().getMonth();
  if(lastMonth !== thisMonth) {
    localStorage.setItem('nova_cld_month', thisMonth);
    localStorage.setItem('nova_cld_idx', '0');
    _cldActiveIdx = 0;
    console.log('☁️ Monthly reset: Primary account active');
  }
})();
Object.defineProperty(window, 'CLD', { get: () => _getCldAccount().cloud, configurable: true });
Object.defineProperty(window, 'CPRE', { get: () => _getCldAccount().preset, configurable: true });
