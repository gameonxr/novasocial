'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalEsc = global.esc;
  const originalAv = global.av;
  const originalIco = global.ico;

  const elements = new Map();
  const calls = [];
  let tableResults = {};
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.ico = (name, color, size) => `[ico:${name}:${color}:${size}]`;
  global.document = { getElementById: id => elements.get(id) || null };

  function configureDb(results) {
    calls.length = 0;
    tableResults = results;
    global.db = { from(table) {
      calls.push(['from', table]);
      const result = tableResults[table] || { data: [], error: null };
      let resolved = result;
      const builder = {
        select(...args) { calls.push([table, 'select', ...args]); return builder; },
        order(...args) { calls.push([table, 'order', ...args]); return builder; },
        limit(...args) { calls.push([table, 'limit', ...args]); return builder; },
        in(...args) { calls.push([table, 'in', ...args]); resolved = tableResults.profiles || { data: [], error: null }; return Promise.resolve(resolved); },
        then(resolve, reject) { return Promise.resolve(resolved).then(resolve, reject); },
        catch(reject) { return Promise.resolve(resolved).catch(reject); }
      };
      return builder;
    } };
  }

  function resetElements() {
    elements.clear();
    const list = { innerHTML: '' };
    elements.set('admin-content-list', list);
    for (const key of ['posts', 'comments', 'stories']) elements.set('ct-' + key, { style: {} });
    return list;
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/src/features/admin-tab-content.js', 'utf8');
    const start = source.indexOf('window.adminTabContent = async function adminTabContent(content){');
    assert(start >= 0, 'content-tab module owner must remain present');
    const functionBlock = source.slice(start + 'window.adminTabContent = '.length);
    const html = fs.readFileSync('/home/z/my-project/novasocial/index.html', 'utf8');
    const lvStart = html.indexOf('async function loadAdminContent(type){');
    const lvEnd = html.indexOf('\nasync function adminDeleteAnyContent(', lvStart);
    assert(lvStart >= 0 && lvEnd > lvStart, 'content loader boundary must remain present and ordered');
    const loadAdminBlock = html.slice(lvStart, lvEnd);
    eval(`let _contentType = 'posts'; ${functionBlock}; ${loadAdminBlock}; global.adminTabContent = adminTabContent; global.loadAdminContent = loadAdminContent;`);

    const post = { id: 'p1', caption: 'Caption <unsafe>', media_url: 'media', media_type: 'image', user_id: 'u1', created_at: '2026-03-08T00:00:00Z', likes_count: 1, comments_count: 2 };
    const profile = { id: 'u1', username: "author'", avatar_url: 'a' };
    const list = resetElements();
    configureDb({ posts: { data: [post], error: null }, profiles: { data: [profile], error: null } });
    const content = { innerHTML: '' };
    await global.adminTabContent(content);
    assert(content.innerHTML.includes('ct-posts') && content.innerHTML.includes('ct-stories'), 'content tab renders all type controls');
    assert(calls.some(call => call[0] === 'posts' && call[1] === 'limit' && call[2] === 50), 'posts are limited to 50');
    assert(calls.some(call => call[0] === 'profiles' && call[1] === 'in'), 'post authors are enriched through profiles');
    assert(list.innerHTML.includes('Caption &lt;unsafe&gt;'), 'post caption preview is escaped');
    assert(list.innerHTML.includes('author'), 'post author renders');
    assert(list.innerHTML.includes('Delete') && list.innerHTML.includes('Ban User'), 'post actions render');
    assert(list.innerHTML.includes("adminDeleteAnyContent('p1','posts'"), 'delete handler preserves post id and type');
    assert(elements.get('ct-posts').style.color === '#00E5FF', 'posts control is selected');

    // Comments switch changes query, selected style, and text preview.
    resetElements();
    configureDb({ comments: { data: [{ id: 'c1', text: 'Comment <unsafe>', user_id: 'u2', post_id: 'p1', created_at: '2026-03-09T00:00:00Z' }], error: null }, profiles: { data: [{ id: 'u2', username: 'commenter', avatar_url: null }], error: null } });
    await global.loadAdminContent('comments');
    assert(calls.some(call => call[0] === 'comments'), 'comments table is queried when selected');
    assert(!calls.some(call => call[0] === 'posts'), 'posts table is not queried for comments selection');
    assert(elements.get('ct-comments').style.color === '#00E5FF', 'comments control is selected');
    assert(elements.get('admin-content-list').innerHTML.includes('Comment &lt;unsafe&gt;'), 'comment text preview is escaped');
    assert(elements.get('admin-content-list').innerHTML.includes("adminDeleteAnyContent('c1','comments'"), 'comment delete handler preserves id and type');

    // Stories switch uses media-type preview.
    resetElements();
    configureDb({ stories: { data: [{ id: 's1', media_url: 'story-media', media_type: 'video', user_id: 'u3', created_at: '2026-03-10T00:00:00Z' }], error: null }, profiles: { data: [{ id: 'u3', username: 'story-user', avatar_url: null }], error: null } });
    await global.loadAdminContent('stories');
    assert(calls.some(call => call[0] === 'stories'), 'stories table is queried when selected');
    assert(elements.get('admin-content-list').innerHTML.includes('[video story]'), 'story media preview renders');
    assert(elements.get('admin-content-list').innerHTML.includes('story-user'), 'story author renders');

    // Empty and failure states remain stable.
    resetElements();
    configureDb({ stories: { data: [], error: null } });
    await global.loadAdminContent('stories');
    assert.strictEqual(elements.get('admin-content-list').innerHTML, '<div style="padding:30px;text-align:center;color:#8A8A8A;font-size:13px">No content</div>');
    configureDb({ stories: { data: null, error: new Error('content unavailable') } });
    await global.loadAdminContent('stories');
    assert(elements.get('admin-content-list').innerHTML.includes('Failed: content unavailable'), 'content query failure renders safe message');

    console.log('ADMIN_CONTENT_TAB_HARNESS=PASS');
  } finally {
    global.document = originalDocument;
    global.db = originalDb;
    global.esc = originalEsc;
    global.av = originalAv;
    global.ico = originalIco;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
