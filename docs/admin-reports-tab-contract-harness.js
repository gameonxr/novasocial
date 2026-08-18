'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalEsc = global.esc;
  const originalAv = global.av;

  const elements = new Map();
  const calls = [];
  let tableResults = {};
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.document = { getElementById: id => elements.get(id) || null };

  function queryFor(table, resultKey) {
    const result = tableResults[resultKey] || { data: [], error: null };
    const builder = {
      select(...args) { calls.push([table, 'select', ...args]); return builder; },
      order(...args) { calls.push([table, 'order', ...args]); return builder; },
      limit(...args) { calls.push([table, 'limit', ...args]); return builder; },
      eq(...args) { calls.push([table, 'eq', ...args]); return builder; },
      in(...args) { calls.push([table, 'in', ...args]); return builder; },
      then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
      catch(reject) { return Promise.resolve(result).catch(reject); }
    };
    return builder;
  }

  function configureDb(results) {
    calls.length = 0;
    tableResults = results;
    global.db = { from(table) { calls.push(['from', table]); return queryFor(table, table); } };
  }

  function resetElements() {
    elements.clear();
    const list = { innerHTML: '' };
    elements.set('admin-reports-list', list);
    for (const key of ['pending', 'resolved', 'dismissed', 'all']) elements.set('rf-' + key, { style: {} });
    return list;
  }

  try {
    const source = fs.readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function adminTabReports(content){');
    const end = source.indexOf('\nasync function adminResolveReport(', start);
    assert(start >= 0 && end > start, 'reports tab function boundary must remain present and ordered');
    const functionBlock = source.slice(start, end);
    eval(`let _reportsFilter = 'pending'; ${functionBlock}; global.adminTabReports = adminTabReports; global.setReportsFilter = setReportsFilter; global.loadReportsList = loadReportsList;`);

    const reports = [{
      id: 'r1', target_type: 'post', target_id: 'p1', reason: "spam <reason>", details: 'details <x>',
      status: 'pending', created_at: '2026-02-03T00:00:00Z', reporter_id: 'reporter-1'
    }];
    resetElements();
    configureDb({
      reports: { data: reports, error: null },
      posts: { data: [{ id: 'p1', caption: 'A caption <unsafe>', media_url: 'media', media_type: 'image', user_id: 'author-1' }], error: null },
      profiles: { data: [
        { id: 'author-1', username: 'author', avatar_url: 'a' },
        { id: 'reporter-1', username: 'reporter', avatar_url: 'r' }
      ], error: null },
      comments: { data: [], error: null }, messages: { data: [], error: null }, stories: { data: [], error: null }
    });

    const content = { innerHTML: '' };
    await global.adminTabReports(content);
    const list = elements.get('admin-reports-list');
    assert(content.innerHTML.includes('rf-pending') && content.innerHTML.includes('rf-all'), 'reports tab renders all filter controls');
    assert(calls.some(call => call[0] === 'reports' && call[1] === 'eq' && call[2] === 'status' && call[3] === 'pending'), 'pending filter is applied to the report query');
    assert(calls.some(call => call[0] === 'posts' && call[1] === 'in' && call[2] === 'id' && call[3][0] === 'p1'), 'post target content is looked up in a grouped query');
    assert(calls.some(call => call[0] === 'profiles' && call[1] === 'in'), 'reporter and content authors are enriched through profiles');
    assert(list.innerHTML.includes('spam &lt;reason&gt;'), 'reason is escaped in the rendered report');
    assert(list.innerHTML.includes('A caption &lt;unsafe&gt;'), 'post caption preview is escaped');
    assert(list.innerHTML.includes('Reported by @reporter'), 'reporter identity renders');
    assert(list.innerHTML.includes('Resolve') && list.innerHTML.includes('Dismiss'), 'pending report has resolve and dismiss actions');
    assert(list.innerHTML.includes('View Full Details'), 'report detail action renders');

    // Switching to all removes the status equality constraint and updates selected-tab styling.
    resetElements();
    configureDb({ reports: { data: [], error: null }, posts: { data: [], error: null }, profiles: { data: [], error: null }, comments: { data: [], error: null }, messages: { data: [], error: null }, stories: { data: [], error: null } });
    global.setReportsFilter('all');
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(elements.get('rf-all').style.color, '#a855f7', 'all filter receives selected styling');
    assert(!calls.some(call => call[0] === 'reports' && call[1] === 'eq' && call[2] === 'status'), 'all filter does not add a status equality constraint');

    // Empty result has a stable filter-aware empty state.
    assert.strictEqual(elements.get('admin-reports-list').innerHTML, '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No all reports</div>');

    // Initial query failure is rendered safely.
    resetElements();
    configureDb({ reports: { data: null, error: new Error('reports unavailable') }, posts: { data: [], error: null }, profiles: { data: [], error: null }, comments: { data: [], error: null }, messages: { data: [], error: null }, stories: { data: [], error: null } });
    await global.loadReportsList();
    assert(elements.get('admin-reports-list').innerHTML.includes('Failed: reports unavailable'), 'report query failure renders safe failure state');

    console.log('ADMIN_REPORTS_TAB_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.db = originalDb;
    global.esc = originalEsc;
    global.av = originalAv;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
