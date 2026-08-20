const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const adminUiModule = fs.readFileSync(path.join(repo, 'src', 'features', 'render-admin-panel-ui.js'), 'utf8');

const requiredMarkers = [
  'async function showAdminPanel()',
  'async function loadAdminTab(tab)',
  'is_banned',
  'is_admin',
  'is_super_admin',
  'Access Denied',
  "const content = document.getElementById('admin-content')",
  'content.innerHTML = `<div style="display:flex;justify-content:center;padding:40px">',
  "if(tab==='dashboard') await adminTabDashboard(content);",
  "else if(tab==='users') await adminTabUsers(content);",
  "else if(tab==='content') await adminTabContent(content);",
  "else if(tab==='reports') await adminTabReports(content);",
  "else if(tab==='verify') await adminTabVerify(content);",
  "else if(tab==='appeals') await adminTabAppeals(content);",
  "else if(tab==='approvals') await adminTabApprovals(content);",
  "else if(tab==='myapprovals') await adminTabMyApprovals(content);",
  "else if(tab==='team') await adminTabTeam(content);",
  "else if(tab==='audit') await adminTabAudit(content);",
  "else if(tab==='deleted') await loadAdminDeletedPosts();",
  'Failed: ${e.message||\'error\'}',
  "db.rpc('log_audit_entry'",
];
for (const marker of requiredMarkers) {
  assert(html.includes(marker), `Admin panel marker missing: ${marker}`);
}
assert(adminUiModule.includes('function renderAdminPanelUI('), 'Admin panel must retain its extracted UI rendering boundary');
assert(html.includes('async function sendAdminNotification('), 'Admin notification boundary must remain present');
assert(html.includes('async function adminSoftDeletePost('), 'Soft-delete boundary must remain present');
assert(html.includes('async function adminHardDeletePost('), 'Hard-delete boundary must remain present');
assert(html.includes('async function adminRecoverPost('), 'Recovery boundary must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-post-delete-two-tier-contract.md')), 'Admin deletion contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-post-delete-two-tier-contract-harness.js')), 'Admin deletion harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-notification-contract.md')), 'Admin notification contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-notification-contract-harness.js')), 'Admin notification harness must remain present');
assert.strictEqual((html.match(/async function showAdminPanel\(/g) || []).length, 1, 'Admin panel must have one inline owner');
assert.strictEqual((html.match(/async function loadAdminTab\(/g) || []).length, 1, 'Admin tab loader must have one inline owner');

console.log('ADMIN_PANEL_RENDERING_CONTRACT_HARNESS=PASS');
console.log('ACCESS_TAB_DISPATCH_ERROR_AUDIT_DELETE_BOUNDARIES=LOCKED');
console.log('PRODUCTION_CHANGE=0');
