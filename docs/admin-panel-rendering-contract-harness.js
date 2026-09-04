const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const adminUiModule = fs.readFileSync(path.join(repo, 'src', 'features', 'render-admin-panel-ui.js'), 'utf8');
const showAdminPanelModule = fs.readFileSync(path.join(repo, 'src', 'features', 'show-admin-panel.js'), 'utf8');
const loadAdminTabModule = fs.readFileSync(path.join(repo, 'src', 'features', 'load-admin-tab.js'), 'utf8');
const logAdminActionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'log-admin-action.js'), 'utf8');
const sendAdminNotificationModule = fs.readFileSync(path.join(repo, 'src', 'features', 'send-admin-notification.js'), 'utf8');

const requiredLoadAdminTabModuleMarkers = [
  'async function loadAdminTab(tab)',
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
];
for (const marker of requiredLoadAdminTabModuleMarkers) {
  assert(loadAdminTabModule.includes(marker), `Admin tab loader module marker missing: ${marker}`);
}

const requiredModuleMarkers = [
  'async function showAdminPanel()',
  'Access Denied',
  'Verifying access...',
];
for (const marker of requiredModuleMarkers) {
  assert(showAdminPanelModule.includes(marker), `Admin panel module marker missing: ${marker}`);
}

const requiredMarkers = [
  'is_banned',
  'is_admin',
  'is_super_admin',
  "const content = document.getElementById('admin-content')",
  "db.rpc('log_audit_entry'",
];
const featureModuleTexts = fs.readdirSync(path.join(repo, 'src', 'features')).filter(n => n.endsWith('.js')).map(n => fs.readFileSync(path.join(repo, 'src', 'features', n), 'utf8'));
for (const marker of requiredMarkers) {
  assert(html.includes(marker) || featureModuleTexts.some(m => m.includes(marker)), `Admin panel marker missing: ${marker}`);
}
assert(adminUiModule.includes('function renderAdminPanelUI('), 'Admin panel must retain its extracted UI rendering boundary');
assert(html.includes('async function sendAdminNotification(') || sendAdminNotificationModule.includes('window.sendAdminNotification = async function sendAdminNotification('), 'Admin notification boundary must remain present');
assert(html.includes('async function adminSoftDeletePost(') || fs.readFileSync(path.join(repo, 'src', 'features', 'admin-soft-delete-post.js'), 'utf8').includes('window.adminSoftDeletePost = async function adminSoftDeletePost('), 'Soft-delete boundary must remain present');
assert(html.includes('async function adminHardDeletePost(') || fs.readFileSync(path.join(repo, 'src', 'features', 'admin-hard-delete-post.js'), 'utf8').includes('window.adminHardDeletePost = async function adminHardDeletePost('), 'Hard-delete boundary must remain present');
assert(html.includes('async function adminRecoverPost(') || fs.readFileSync(path.join(repo, 'src', 'features', 'admin-recover-post.js'), 'utf8').includes('window.adminRecoverPost = async function adminRecoverPost('), 'Recovery boundary must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-post-delete-two-tier-contract.md')), 'Admin deletion contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-post-delete-two-tier-contract-harness.js')), 'Admin deletion harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-notification-contract.md')), 'Admin notification contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'admin-notification-contract-harness.js')), 'Admin notification harness must remain present');
assert.strictEqual((html.match(/async function showAdminPanel\(/g) || []).length, 0, 'Admin panel owner must be fully extracted (zero inline declarations)');
assert.strictEqual((showAdminPanelModule.match(/window\.showAdminPanel\s*=\s*async function showAdminPanel\(/g) || []).length, 1, 'Admin panel module must expose exactly one window.showAdminPanel owner');
assert(html.includes('src="src/features/show-admin-panel.js"'), 'Admin panel module must remain linked from index.html');
assert(html.indexOf('src="src/features/show-admin-panel.js"') > html.indexOf('src="src/features/render-admin-panel-ui.js"'), 'Admin panel module must load after its render-admin-panel-ui dependency');
assert.strictEqual((html.match(/async function loadAdminTab\(/g) || []).length, 0, 'Admin tab loader must be fully extracted (zero inline declarations)');
assert.strictEqual((loadAdminTabModule.match(/window\.loadAdminTab\s*=\s*async function loadAdminTab\(/g) || []).length, 1, 'Admin tab loader module must expose exactly one window.loadAdminTab owner');
assert(html.includes('src="src/features/load-admin-tab.js"'), 'Admin tab loader module must remain linked from index.html');
assert(html.indexOf('src="src/features/load-admin-tab.js"') > html.indexOf('src="src/features/show-admin-panel.js"'), 'Admin tab loader module must load after show-admin-panel.js');
assert(html.includes('let curAdminTab'), 'Admin tab state boundary must remain inline (global lexical env)');

console.log('ADMIN_PANEL_RENDERING_CONTRACT_HARNESS=PASS');
console.log('ACCESS_TAB_DISPATCH_ERROR_AUDIT_DELETE_BOUNDARIES=LOCKED');
console.log('PRODUCTION_CHANGE=0');
