'use strict';

const assert = require('assert');
const fs = require('fs');

async function runHarness() {
  const originalME = global.ME;
  const originalPROF = global.PROF;
  const originalDb = global.db;
  const originalConsoleLog = console.log;
  const originalWindow = global.window;

  const logs = [];
  const queries = [];
  let resultMap = {};
  console.log = (...args) => logs.push(args.map(String).join(' '));
  global.window = {};
  global.PROF = { username: 'diagnostic-user' };

  function configureDb(results) {
    queries.length = 0;
    resultMap = results;
    global.db = { from(table) {
      const state = { table, select: null };
      const builder = {
        select(value, options) { state.select = value; queries.push([table, 'select', value, options]); return builder; },
        eq(...args) { queries.push([table, 'eq', ...args]); return builder; },
        limit(...args) { queries.push([table, 'limit', ...args]); return builder; },
        then(resolve, reject) {
          const key = `${table}:${state.select}`;
          const result = resultMap[key] || resultMap[table] || { data: [], error: null };
          return Promise.resolve(result).then(resolve, reject);
        },
        catch(reject) { return Promise.resolve({ data: [], error: null }).catch(reject); }
      };
      return builder;
    } };
  }

  try {
    const source = fs.readFileSync('/home/z/my-project/novasocial/src/features/nova-debug.js', 'utf8');
    const start = source.indexOf('window.novaDebug = async function novaDebug(){');
    assert(start >= 0, 'novaDebug module owner must remain present');
    const fnSource = source.slice(start + 'window.novaDebug = '.length);
    eval(`${fnSource}; global.novaDebug = novaDebug;`);

    // No-session guard returns before any database access.
    global.ME = null;
    queries.length = 0;
    logs.length = 0;
    await global.novaDebug();
    assert.strictEqual(queries.length, 0, 'no-session diagnostic does not query the database');
    assert(logs.some(line => line.includes('ME.id is NULL')), 'no-session warning is logged');

    // Successful session runs all six diagnostics and completes.
    global.ME = { id: 'user-1' };
    logs.length = 0;
    configureDb({
      follows: { data: [{ following_id: 'u2' }, { following_id: 'u3' }], error: null },
      'posts:*': { data: [{ is_reel: true }, { is_reel: false }, { is_archived: true }], error: null },
      'posts:*,profiles!posts_user_id_fkey(username,avatar_url)': { data: [{ id: 'p1' }], error: null },
      'profiles:id,username': { data: [{ id: 'user-1', username: 'diagnostic-user' }], error: null },
      'posts:*:count': { count: 4, error: null }
    });
    await global.novaDebug();
    assert(queries.some(q => q[0] === 'follows'), 'follows diagnostic query runs');
    assert(queries.some(q => q[0] === 'posts' && q[1] === 'select' && q[2] === '*'), 'own-post diagnostic query runs');
    assert(queries.some(q => q[0] === 'posts' && String(q[2]).includes('posts_user_id_fkey')), 'profile-join diagnostic query runs');
    assert(queries.some(q => q[0] === 'profiles'), 'profiles diagnostic query runs');
    assert(logs.some(line => line.includes('DIAGNOSTIC COMPLETE')), 'successful diagnostic logs completion');

    // Query errors are isolated and still reach completion.
    logs.length = 0;
    configureDb({
      follows: { data: null, error: new Error('follows unavailable') },
      posts: { data: null, error: new Error('posts unavailable') },
      'profiles:id,username': { data: null, error: new Error('profiles unavailable') }
    });
    await global.novaDebug();
    assert(logs.some(line => line.includes('Follows query error')), 'follows error is logged');
    assert(logs.some(line => line.includes('Posts query error')), 'posts error is logged');
    assert(logs.some(line => line.includes('DIAGNOSTIC COMPLETE')), 'error-isolated diagnostic still completes');

    console.log = originalConsoleLog;
    console.log('NOVA_DEBUG_HARNESS=PASS');
  } finally {
    console.log = originalConsoleLog;
    global.ME = originalME;
    global.PROF = originalPROF;
    global.db = originalDb;
    global.window = originalWindow;
  }
}

runHarness().catch(error => {
  console.log(error.stack || error);
  process.exitCode = 1;
});
